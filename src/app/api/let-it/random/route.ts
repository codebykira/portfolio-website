import { NextRequest, NextResponse } from "next/server";
import { BUCKET, supa, storageHeaders, type StoredNote } from "../lib";

// GET /api/let-it/random?exclude=<id> — draw one stranger's note from the pool.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cfg = supa();
  if (!cfg) {
    return NextResponse.json({ error: "notes pool not configured" }, { status: 503 });
  }

  const exclude = req.nextUrl.searchParams.get("exclude") ?? "";

  const listRes = await fetch(`${cfg.url}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...storageHeaders(cfg.key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1000, sortBy: { column: "created_at", order: "desc" } }),
    cache: "no-store",
  });
  if (!listRes.ok) {
    return NextResponse.json({ error: "could not reach the table" }, { status: 502 });
  }

  const objects = (await listRes.json()) as Array<{ name: string }>;
  const names = objects
    .map((o) => o.name)
    .filter((n) => n.endsWith(".json") && n !== `${exclude}.json`);
  if (names.length === 0) {
    return NextResponse.json({ error: "the table is empty" }, { status: 404 });
  }

  const pick = names[Math.floor(Math.random() * names.length)];
  const noteRes = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${pick}`, {
    headers: storageHeaders(cfg.key),
    cache: "no-store",
  });
  if (!noteRes.ok) {
    return NextResponse.json({ error: "that one blew off the table" }, { status: 502 });
  }

  const note = (await noteRes.json()) as StoredNote;
  return NextResponse.json({
    text: typeof note.text === "string" ? note.text.slice(0, 240) : "",
    drawing: typeof note.drawing === "string" ? note.drawing : "",
  });
}
