import { NextResponse } from "next/server";
import { BUCKET, TABLE, supa, storageHeaders, tableMissing, projectDown, reach } from "../lib";

// GET /api/dead-letters/count — how many notes are actually in the pool.
// The table draws one crumple per note, so this is what makes the pile true
// rather than decorative.

export const dynamic = "force-dynamic";

/** PostgREST reports the total in `content-range`, e.g. "0-0/12". */
function totalFrom(header: string | null): number | null {
  const total = header?.split("/")[1];
  if (!total || total === "*") return null;
  const n = Number.parseInt(total, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const cfg = supa();
  if (!cfg) return NextResponse.json({ count: 0, source: "unconfigured" });

  const res = await reach(`${cfg.url}/rest/v1/${TABLE}?select=id`, {
    headers: { ...storageHeaders(cfg.key), Prefer: "count=exact", Range: "0-0" },
    cache: "no-store",
  });

  // A paused project is "come back later", not "the pool is empty".
  if (!res || projectDown(res.status)) {
    return NextResponse.json({ count: 0, source: "unreachable" });
  }

  if (res.ok || res.status === 206) {
    const count = totalFrom(res.headers.get("content-range"));
    if (count !== null) return NextResponse.json({ count, source: "table" });
  }

  if (!tableMissing(res.status)) {
    return NextResponse.json({ count: 0, source: "error" });
  }

  // Before the table existed the notes lived in a private bucket, and some
  // deployments may still be in that state.
  const listed = await reach(`${cfg.url}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...storageHeaders(cfg.key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1000 }),
    cache: "no-store",
  });
  if (!listed?.ok) return NextResponse.json({ count: 0, source: "error" });

  const objects = (await listed.json()) as Array<{ name?: string }>;
  const count = objects.filter((o) => o.name?.endsWith(".json")).length;
  return NextResponse.json({ count, source: "bucket" });
}
