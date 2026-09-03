import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { aiModel } from "@/app/builder/lib/ai";
import { evaluationSchema } from "@/app/builder/lib/schemas";
import type { ParsedResume } from "@/app/resume/parsedResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Score a saved job version against the job description stored with it, and
 *  write the result back as its gap_report so the list shows a FIT number.
 *  For versions written outside the app (which arrive without a score). Same
 *  rubric as /api/evaluate, but judged on the résumé as it will be sent rather
 *  than on the accomplishment bank. */
const SYSTEM_PROMPT =
  "You are a sharp, honest technical recruiter. Given a job description and the résumé a " +
  "candidate will actually submit, evaluate genuine fit. Distill the JD into its most important " +
  "requirements, then judge each against the résumé: 'strong' (clear evidence), 'partial' " +
  "(adjacent/implied), or 'gap' (no evidence). Cite the specific bullet as evidence and never " +
  "invent experience. Be candid about gaps. Give an overall 0–100 fit score grounded in the " +
  "evidence, and concrete positioning advice.";

function resumeToText(r: ParsedResume): string {
  const exp = r.experience
    .map((e) => `${e.org} — ${e.role} (${e.date})\n${e.tagline}\n${e.points.map((p) => `- ${p}`).join("\n")}`)
    .join("\n\n");
  const skills = r.skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join("\n");
  const edu = r.education.map((e) => `${e.org}: ${e.detail} (${e.date})`).join("\n");
  return `SUMMARY\n${r.summary}\n\nEXPERIENCE\n${exp}\n\nSKILLS\n${skills}\n\nEDUCATION\n${edu}`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = z.object({ id: z.string().uuid() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pass the version id." }, { status: 400 });

  const { data: row } = await supabase.from("resumes").select("composed").eq("id", parsed.data.id).maybeSingle();
  const composed = row?.composed as { resume?: ParsedResume; jd_text?: string } | null;
  if (!composed?.resume) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!composed.jd_text || composed.jd_text.length < 40) {
    return NextResponse.json({ error: "This version has no job description saved with it." }, { status: 400 });
  }

  let result;
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: evaluationSchema,
      system: SYSTEM_PROMPT,
      prompt: `JOB DESCRIPTION:\n${composed.jd_text.slice(0, 12000)}\n\nRÉSUMÉ:\n${resumeToText(composed.resume)}`,
    });
    result = object;
  } catch (e) {
    console.error("job-version score failed:", e);
    const detail = process.env.NODE_ENV !== "production" && e instanceof Error ? e.message : undefined;
    return NextResponse.json({ error: "Couldn't score. Try again.", detail }, { status: 502 });
  }

  const { error } = await supabase
    .from("resumes")
    .update({ composed: { ...(composed as Record<string, unknown>), gap_report: result } })
    .eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result });
}
