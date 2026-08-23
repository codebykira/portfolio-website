import { NextResponse } from "next/server";
import { detectAts, fetchAtsJd, htmlToText, detectCompanyTheme } from "./ats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// A realistic desktop UA — some job boards 403 obvious bots.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const MIN_CHARS = 200;
const MAX_CHARS = 12000;

// Reject obviously-internal targets so a pasted URL can't be used to probe the
// server's own network (basic SSRF guard — not bulletproof against DNS rebind).
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h === "[::1]" || h === "::1") return true;
  return false;
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const raw = typeof body.url === "string" ? body.url.trim() : "";
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json(
      { text: "", needsPaste: true, error: "Enter a valid http(s) link." },
      { status: 400 },
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { text: "", needsPaste: true, error: "Only http(s) links are supported." },
      { status: 400 },
    );
  }
  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json(
      { text: "", needsPaste: true, error: "That address isn't allowed." },
      { status: 400 },
    );
  }

  // Known ATS boards (Ashby / Greenhouse / Lever) render the JD client-side, so
  // plain HTML scraping sees an empty shell. Pull the description from their
  // public JSON API instead. Falls through to generic scraping if unavailable.
  const ats = detectAts(parsed);
  if (ats) {
    const found = await fetchAtsJd(ats);
    if (found && found.text.length >= MIN_CHARS) {
      return NextResponse.json({
        text: found.text.slice(0, MAX_CHARS),
        title: found.title,
        needsPaste: false,
        source: ats.provider,
        theme: detectCompanyTheme(ats.org, found.title, parsed.hostname, found.text.slice(0, 800)),
      });
    }
    // else: fall through — maybe the id is stale or the board is private.
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      return NextResponse.json({
        text: "",
        needsPaste: true,
        error: `Couldn't fetch that page (${res.status}) — paste the description instead.`,
      });
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) {
      return NextResponse.json({
        text: "",
        needsPaste: true,
        error: "That link isn't a readable page — paste the description instead.",
      });
    }
    const { text, title } = htmlToText(await res.text());
    if (text.length < MIN_CHARS) {
      return NextResponse.json({
        text: "",
        title,
        needsPaste: true,
        error: "This posting needs login or JavaScript — paste the description instead.",
      });
    }
    return NextResponse.json({
      text: text.slice(0, MAX_CHARS),
      title,
      needsPaste: false,
      theme: detectCompanyTheme(title, parsed.hostname, text.slice(0, 800)),
    });
  } catch {
    return NextResponse.json({
      text: "",
      needsPaste: true,
      error: "Couldn't reach that page — paste the description instead.",
    });
  }
}
