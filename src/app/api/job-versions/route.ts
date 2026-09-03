import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsedResumeSchema } from "@/app/resume/parsedResume";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Import a hand-tailored résumé as a saved job version.
 *
 *  The Tailor panel saves what /api/tailor produced; this route accepts a
 *  résumé written outside the app (by hand, or by an agent) and stores it in
 *  the same `resumes` row shape (kind:"tailored"), so it appears in the saved
 *  job versions list and exports like any other. Runs as the signed-in user,
 *  so RLS applies and nothing can be written to another account. */
const bodySchema = z.object({
  label: z.string().min(1).max(120),
  theme: z.string().default("claude"),
  base_role: z.string().default("fullstack"),
  source_url: z.string().url().nullable().optional(),
  jd_text: z.string().default(""),
  resume: parsedResumeSchema,
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const b = parsed.data;

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: uid,
      title: b.label,
      composed: {
        kind: "tailored",
        label: b.label,
        source_url: b.source_url ?? null,
        jd_text: b.jd_text,
        base_role: b.base_role,
        theme: b.theme,
        gap_report: null,
        resume: b.resume,
      },
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

/** Replace the résumé (and optionally the label/theme) of an existing job
 *  version. Same auth and RLS as POST: only the owner's rows are reachable. */
const patchSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(120).optional(),
  theme: z.string().optional(),
  resume: parsedResumeSchema,
});

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const b = parsed.data;

  const { data: row, error: readErr } = await supabase.from("resumes").select("composed").eq("id", b.id).maybeSingle();
  if (readErr || !row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const composed: Record<string, unknown> = { ...(row.composed as Record<string, unknown>), resume: b.resume };
  if (b.label) composed.label = b.label;
  if (b.theme) composed.theme = b.theme;

  const { error } = await supabase
    .from("resumes")
    .update({ composed, ...(b.label ? { title: b.label } : {}) })
    .eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: b.id });
}

/** List the signed-in user's saved job versions with their full résumé, so
 *  an agent (or a script) can read what is stored before patching it. RLS
 *  scopes this to the caller's own rows. */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, composed, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data ?? [] });
}
