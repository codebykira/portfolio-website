import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiModel } from "@/app/builder/lib/ai";
import { evaluationSchema } from "@/app/builder/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const MAX_JD = 12000;

const SYSTEM_PROMPT =
  "You are a sharp, honest technical recruiter. Given a job description and a candidate's real " +
  "accomplishment bank, evaluate genuine fit. Distill the JD into its most important requirements, " +
  "then judge each against the bank: 'strong' (clear evidence), 'partial' (adjacent/implied), or " +
  "'gap' (no evidence). Cite the specific accomplishment as evidence — never invent experience the " +
  "candidate doesn't have. Be candid about gaps. Give an overall 0–100 fit score grounded in the " +
  "evidence, and concrete positioning advice.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { jd_text?: unknown; target_role_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const jdText = typeof body.jd_text === "string" ? body.jd_text.trim() : "";
  const roleId = typeof body.target_role_id === "string" ? body.target_role_id : null;
  if (jdText.length < 40) {
    return NextResponse.json({ error: "Paste the full job description." }, { status: 400 });
  }

  const [{ data: bank }, { data: experiences }] = await Promise.all([
    supabase.from("accomplishments").select("*").in("status", ["ready", "needs_metrics"]),
    supabase.from("experiences").select("id, org, role, tagline"),
  ]);

  if (!bank || bank.length === 0) {
    return NextResponse.json({ error: "Add accomplishments to your bank first." }, { status: 400 });
  }

  const expById = new Map((experiences ?? []).map((e) => [e.id, e]));
  const bankText = bank
    .map((b) => {
      const e = b.experience_id ? expById.get(b.experience_id) : null;
      return `- ${b.polished || b.raw_note}${e ? ` (${e.org})` : ""}`;
    })
    .join("\n");

  let result;
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: evaluationSchema,
      system: SYSTEM_PROMPT,
      prompt: `JOB DESCRIPTION:\n${jdText.slice(0, MAX_JD)}\n\nCANDIDATE ACCOMPLISHMENT BANK:\n${bankText}`,
    });
    result = object;
  } catch {
    return NextResponse.json({ error: "Couldn't evaluate. Try again." }, { status: 502 });
  }

  await supabase.from("job_evaluations").insert({
    user_id: user.id,
    target_role_id: roleId,
    jd_text: jdText,
    fit_score: result.fit_score,
    result,
  });

  return NextResponse.json({ result });
}
