import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { KIRA_TEMPLATES } from "@/app/resume/canvas/template";
import type { ParsedResume } from "@/app/resume/parsedResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns a single role's résumé from the owner's saved canvas so auth-free
// renders (the /resume/print page → PDF route) reflect the LIVE edited content,
// not the code template. Reads server-side with the service key; falls back to
// the template if the DB is unreachable or the role was never saved.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const variant = url.searchParams.get("variant") ?? "fullstack";
  const fallback = (KIRA_TEMPLATES[variant] ?? null) as ParsedResume | null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ resume: fallback }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data } = await admin
      .from("resumes")
      .select("composed")
      .eq("title", "__canvas__")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const byRole = (data?.composed as { byRole?: Record<string, ParsedResume> } | null)?.byRole ?? {};
    const resume = byRole[variant] ?? fallback;
    return NextResponse.json({ resume }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ resume: fallback }, { headers: { "Cache-Control": "no-store" } });
  }
}
