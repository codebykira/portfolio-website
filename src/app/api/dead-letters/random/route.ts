import { NextRequest, NextResponse } from "next/server";
import { BUCKET, TABLE, supa, storageHeaders, tableMissing, projectDown, reach, type StoredNote } from "../lib";

// GET /api/let-it/random?exclude=<id,id,...> — draw one stranger's note.
// `exclude` carries the reader's own note and the one they just read, so the
// pool never hands back the same paper twice in a row.

export const dynamic = "force-dynamic";

function parseExcludes(req: NextRequest): string[] {
  return (req.nextUrl.searchParams.get("exclude") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[\w-]+$/.test(s));
}

export async function GET(req: NextRequest) {
  const cfg = supa();
  if (!cfg) {
    return NextResponse.json({ error: "notes pool not configured" }, { status: 503 });
  }
  const excludes = parseExcludes(req);

  // Preferred home: the letit_notes table.
  const idsRes = await reach(`${cfg.url}/rest/v1/${TABLE}?select=id&limit=2000`, {
    headers: storageHeaders(cfg.key),
    cache: "no-store",
  });
  if (!idsRes || projectDown(idsRes.status)) {
    return NextResponse.json({ error: "the table is out of reach" }, { status: 503 });
  }
  if (idsRes.ok) {
    const rows = (await idsRes.json()) as Array<{ id: string }>;
    let ids = rows.map((r) => r.id).filter((id) => !excludes.includes(id));
    if (ids.length === 0) ids = rows.map((r) => r.id); // tiny pool: repeats beat nothing
    if (ids.length === 0) {
      return NextResponse.json({ error: "the table is empty" }, { status: 404 });
    }
    const pick = ids[Math.floor(Math.random() * ids.length)];
    const rowRes = await reach(
      `${cfg.url}/rest/v1/${TABLE}?id=eq.${pick}&select=id,text,drawing&limit=1`,
      { headers: storageHeaders(cfg.key), cache: "no-store" }
    );
    if (rowRes?.ok) {
      const [note] = (await rowRes.json()) as StoredNote[];
      if (note) {
        return NextResponse.json({
          id: note.id ?? "",
          text: (note.text ?? "").slice(0, 240),
          drawing: note.drawing ?? "",
        });
      }
    }
    return NextResponse.json({ error: "that one blew off the table" }, { status: 502 });
  }

  if (!tableMissing(idsRes.status)) {
    return NextResponse.json({ error: "could not reach the table" }, { status: 502 });
  }

  // Fallback while the table doesn't exist yet: the private bucket.
  const listRes = await reach(`${cfg.url}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...storageHeaders(cfg.key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1000 }),
    cache: "no-store",
  });
  if (!listRes?.ok) {
    return NextResponse.json({ error: "could not reach the table" }, { status: 502 });
  }
  const objects = (await listRes.json()) as Array<{ name: string }>;
  let names = objects
    .map((o) => o.name)
    .filter((n) => n.endsWith(".json") && !excludes.includes(n.replace(/\.json$/, "")));
  if (names.length === 0) names = objects.map((o) => o.name).filter((n) => n.endsWith(".json"));
  if (names.length === 0) {
    return NextResponse.json({ error: "the table is empty" }, { status: 404 });
  }
  const pick = names[Math.floor(Math.random() * names.length)];
  const noteRes = await reach(`${cfg.url}/storage/v1/object/${BUCKET}/${pick}`, {
    headers: storageHeaders(cfg.key),
    cache: "no-store",
  });
  if (!noteRes?.ok) {
    return NextResponse.json({ error: "that one blew off the table" }, { status: 502 });
  }
  const note = (await noteRes.json()) as StoredNote;
  return NextResponse.json({
    id: pick.replace(/\.json$/, ""),
    text: typeof note.text === "string" ? note.text.slice(0, 240) : "",
    drawing: typeof note.drawing === "string" ? note.drawing : "",
  });
}
