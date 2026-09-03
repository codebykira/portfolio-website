// One-off: put the current Atrios headline bullet on every saved résumé row
// (base canvas and all saved job versions, the Linear ones included).
//
//   node scripts/update-atrios-bullet.mjs          # dry run, prints what would change
//   node scripts/update-atrios-bullet.mjs --write  # apply
//
// Uses the service role key from .env.local, so run it from your own machine.
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const NEW =
  "Took Atrios from prototype to $2M ARR and 8,000 users in 5 months as Head of Product, owning design, product, and the full stack in React, TypeScript, and Node, and setting the component patterns the team builds on.";

// Any bullet that carries the old scale numbers is the headline bullet and gets replaced.
const OLD_HEADLINE = /(5,000|2,000|8,000) users|\$1M ARR|\$2M ARR|prototype to/i;
// Stray old numbers anywhere else in a row (summary, other bullets).
const FIXES = [
  ["5,000 users", "8,000 users"],
  ["2,000 users", "8,000 users"],
  ["$1M ARR", "$2M ARR"],
];

const write = process.argv.includes("--write");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: rows, error } = await sb.from("resumes").select("id, title, composed");
if (error) throw error;

for (const row of rows) {
  const composed = row.composed ?? {};
  const resume = composed.resume ?? composed; // job versions nest under .resume; the canvas row may not
  const exp = resume?.experience;
  if (!Array.isArray(exp)) continue;
  const notes = [];
  for (const e of exp) {
    if (!/atrios/i.test(e.org ?? "")) continue;
    if (e.role !== "Head of Product") { notes.push(`role: ${e.role} -> Head of Product`); e.role = "Head of Product"; }
    const pts = e.points ?? [];
    const i = pts.findIndex((p) => OLD_HEADLINE.test(p));
    if (i === -1) { notes.push("prepend headline"); pts.unshift(NEW); }
    else if (pts[i] !== NEW) { notes.push(`replace point ${i}: ${pts[i].slice(0, 80)}...`); pts[i] = NEW; }
    e.points = pts;
  }
  let json = JSON.stringify(composed);
  for (const [from, to] of FIXES) if (json.includes(from)) { notes.push(`${from} -> ${to}`); json = json.split(from).join(to); }
  if (!notes.length) continue;
  console.log(`\n${row.title} (${row.id})\n  ` + notes.join("\n  "));
  if (write) {
    const { error: upErr } = await sb.from("resumes").update({ composed: JSON.parse(json) }).eq("id", row.id);
    if (upErr) throw upErr;
    console.log("  written");
  }
}
console.log(write ? "\nDone." : "\nDry run. Re-run with --write to apply.");
