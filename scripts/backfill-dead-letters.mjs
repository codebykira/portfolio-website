/**
 * Move the Dead Letters notes out of the `letit-notes` storage bucket and into
 * the `letit_notes` table.
 *
 * The bucket was only ever the fallback the API used while the table did not
 * exist. Once the table is there the API switches to it automatically — which
 * would strand the older notes in the bucket unless they are carried over.
 *
 * Safe to re-run: notes already in the table (matched on id) are skipped, and
 * nothing is deleted from the bucket. Verify the table first, then clean up.
 *
 *   node scripts/backfill-dead-letters.mjs          # dry run, reports only
 *   node scripts/backfill-dead-letters.mjs --write  # actually insert
 */
import { readFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const BUCKET = "letit-notes";
const TABLE = "letit_notes";

// Read straight from .env.local so the secret never needs to be passed in.
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const url = (env.SUPABASE_LETIT_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_LETIT_SECRET_KEY;
if (!url || !key) {
  console.error("SUPABASE_LETIT_URL / SUPABASE_LETIT_SECRET_KEY missing from .env.local");
  process.exit(1);
}
const auth = { apikey: key, Authorization: `Bearer ${key}` };

const existing = await fetch(`${url}/rest/v1/${TABLE}?select=id&limit=5000`, { headers: auth });
if (!existing.ok) {
  console.error(`Table ${TABLE} not reachable (${existing.status}). Run the migration first.`);
  process.exit(1);
}
const have = new Set((await existing.json()).map((r) => r.id));
console.log(`table already holds ${have.size} note(s)`);

const listed = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ prefix: "", limit: 1000 }),
});
const objects = (await listed.json()).filter((o) => o.name?.endsWith(".json"));
console.log(`bucket holds ${objects.length} note file(s)`);

let moved = 0, skipped = 0, failed = 0;
for (const obj of objects) {
  const id = obj.name.replace(/\.json$/, "");
  if (have.has(id)) { skipped++; continue; }

  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${obj.name}`, { headers: auth });
  if (!res.ok) { console.warn(`  ! could not read ${obj.name}`); failed++; continue; }
  const note = await res.json();

  const row = {
    id,
    text: typeof note.text === "string" ? note.text.slice(0, 240) : "",
    drawing: typeof note.drawing === "string" ? note.drawing : "",
    // Keep the original timestamp; the bucket's own created_at is the fallback.
    at: note.at || obj.created_at || new Date().toISOString(),
  };
  if (!row.text && !row.drawing) { console.warn(`  ! ${id} is empty, skipping`); skipped++; continue; }

  if (!WRITE) {
    console.log(`  would insert ${id}  ${JSON.stringify(row.text.slice(0, 60))}`);
    moved++;
    continue;
  }
  const ins = await fetch(`${url}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (ins.ok) { console.log(`  inserted ${id}`); moved++; }
  else { console.warn(`  ! insert failed for ${id}: ${ins.status} ${(await ins.text()).slice(0, 120)}`); failed++; }
}

console.log(`\n${WRITE ? "moved" : "would move"}: ${moved}   skipped: ${skipped}   failed: ${failed}`);
if (!WRITE) console.log("dry run — re-run with --write to apply");
