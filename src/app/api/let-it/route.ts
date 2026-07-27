import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BUCKET, supa, storageHeaders } from "./lib";

// POST /api/let-it — deposit a note (text and/or drawing) into the pool.

// Light guardrails for anonymous public input: size caps and PII scrubbing.
function scrub(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
    .replace(/(\+?\d[\d\s().-]{7,}\d)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

// Best-effort per-instance rate limit (serverless instances don't share this).
const seen = new Map<string, number[]>();
function allow(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (hits.length >= 6) return false;
  hits.push(now);
  seen.set(ip, hits);
  return true;
}

export async function POST(req: NextRequest) {
  const cfg = supa();
  if (!cfg) {
    return NextResponse.json({ error: "notes pool not configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) {
    return NextResponse.json({ error: "the table needs a rest — try again later" }, { status: 429 });
  }

  let body: { text?: unknown; drawing?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? scrub(body.text) : "";
  const drawing = typeof body.drawing === "string" ? body.drawing : "";
  const drawingOk =
    drawing === "" || (/^data:image\/(png|webp);base64,/.test(drawing) && drawing.length < 400_000);

  if (!drawingOk || (text.length < 5 && drawing === "")) {
    return NextResponse.json({ error: "nothing to leave" }, { status: 400 });
  }

  const id = randomUUID();
  const note = { text, drawing, at: new Date().toISOString() };
  const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${id}.json`, {
    method: "POST",
    headers: { ...storageHeaders(cfg.key), "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("let-it deposit failed:", res.status, detail.slice(0, 200));
    return NextResponse.json({ error: "could not set it down" }, { status: 502 });
  }

  return NextResponse.json({ id });
}
