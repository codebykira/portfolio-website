import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiModel } from "@/app/builder/lib/ai";
import { evaluationSchema } from "@/app/builder/lib/schemas";
import { detectCompanyTheme } from "@/app/api/scrape-jd/ats";
import type { ParsedResume } from "@/app/resume/parsedResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_JD = 12000;

// Reorder-only: the model returns a permutation of bullet indices per
// experience. It NEVER rewrites, adds, or drops bullets — so nothing is
// fabricated; only the ordering changes to surface the most relevant evidence.
const rankSchema = z.object({
  experiences: z
    .array(
      z.object({
        order: z
          .array(z.number().int())
          .describe(
            "This experience's bullet indices, reordered MOST → LEAST relevant to THIS job. A permutation of the given indices.",
          ),
      }),
    )
    .describe("One entry per input experience, in the same order."),
});

const EVAL_SYSTEM =
  "You are a sharp, honest technical recruiter. Given a job description and a candidate's real " +
  "résumé (summary + experience bullets), evaluate genuine fit. Distill the JD into its most " +
  "important requirements, then judge each against the résumé: 'strong' (clear evidence), " +
  "'partial' (adjacent/implied), or 'gap' (no evidence). Cite the specific bullet as evidence — " +
  "never invent experience the candidate doesn't have. Be candid about gaps. Give a 0–100 fit " +
  "score grounded in the evidence, and concrete positioning advice.";

const RANK_SYSTEM =
  "You are a sharp technical recruiter tailoring a candidate's résumé to a specific job. For each " +
  "experience, order its bullets from most to least relevant and impactful FOR THIS JOB — favor " +
  "bullets that show the job's required skills and quantified outcomes. Return only a permutation " +
  "of the bullet indices per experience. Never rewrite, add, or drop bullets.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { jd_text?: unknown; base_role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const jd = typeof body.jd_text === "string" ? body.jd_text.trim() : "";
  const baseRole = typeof body.base_role === "string" ? body.base_role : "";
  if (jd.length < 40) {
    return NextResponse.json({ error: "Paste the full job description." }, { status: 400 });
  }
  if (!baseRole) {
    return NextResponse.json({ error: "Pick a base résumé to tailor." }, { status: 400 });
  }

  // Read the user's REAL résumé for that role from the canvas document (RLS).
  const { data } = await supabase
    .from("resumes")
    .select("composed")
    .eq("title", "__canvas__")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const byRole = (data?.composed as { byRole?: Record<string, ParsedResume> } | null)?.byRole ?? null;
  const base = byRole?.[baseRole] ?? null;
  if (!base) {
    return NextResponse.json(
      { error: "No saved résumé for that role yet — build it first." },
      { status: 400 },
    );
  }

  const bulletsText = base.experience
    .map(
      (e, i) =>
        `Experience ${i} — ${e.org}, ${e.role}:\n${e.points.map((p, j) => `  [${j}] ${p}`).join("\n")}`,
    )
    .join("\n\n");
  const jdSlice = jd.slice(0, MAX_JD);

  // 1) Gap report — the centerpiece: what the candidate is lacking for this job.
  let gapReport;
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: evaluationSchema,
      system: EVAL_SYSTEM,
      prompt: `JOB DESCRIPTION:\n${jdSlice}\n\nCANDIDATE RÉSUMÉ:\nSUMMARY: ${base.summary}\n\n${bulletsText}`,
    });
    gapReport = object;
  } catch {
    return NextResponse.json({ error: "Couldn't analyze the job. Try again." }, { status: 502 });
  }

  // 2) Reorder each experience's bullets for this job (permutation only).
  const tailored: ParsedResume = structuredClone(base);
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: rankSchema,
      system: RANK_SYSTEM,
      prompt: `JOB DESCRIPTION:\n${jdSlice}\n\nRank the bullets in each experience most → least relevant to THIS job.\n\n${bulletsText}`,
    });
    object.experiences.forEach((ex, i) => {
      const pts = tailored.experience[i]?.points;
      if (!pts) return;
      const seen = new Set<number>();
      const reordered: string[] = [];
      ex.order.forEach((k) => {
        if (k >= 0 && k < pts.length && !seen.has(k)) {
          seen.add(k);
          reordered.push(pts[k]);
        }
      });
      pts.forEach((p, k) => {
        if (!seen.has(k)) reordered.push(p);
      });
      tailored.experience[i].points = reordered;
    });
  } catch {
    // Reordering failed — return the base order; the gap report still stands.
  }

  // Detect the company from the JD so the résumé can render in that company's
  // format (theme). Scans the first ~800 chars where the company is usually named.
  const theme = detectCompanyTheme(jd.slice(0, 800));
  return NextResponse.json({ gap_report: gapReport, tailored, theme });
}
