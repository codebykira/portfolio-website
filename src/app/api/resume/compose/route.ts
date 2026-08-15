import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiModel } from "@/app/builder/lib/ai";
import { composeSchema } from "@/app/builder/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const SYSTEM_PROMPT =
  "You compose a tailored résumé from a person's real accomplishment bank, framed for a specific " +
  "target role. Use ONLY the supplied facts — never invent employers, dates, metrics, or skills. " +
  "For each job, pick and reframe the strongest bank bullets for THIS role's angle; drop what's " +
  "irrelevant. Keep the person's real numbers. Order experience most-recent-first. Write a 1–2 " +
  "sentence summary aimed at the role. Group skills sensibly, leaning into the role's keywords. " +
  "Return every field in the required schema; use empty arrays for absent sections.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { target_role_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  const roleId = typeof body.target_role_id === "string" ? body.target_role_id : null;
  if (!roleId) return NextResponse.json({ error: "Pick a target role." }, { status: 400 });

  const [role, profile, experiences, accomplishments, education, awards, skills] = await Promise.all([
    supabase.from("target_roles").select("*").eq("id", roleId).maybeSingle(),
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("experiences").select("*").order("sort_order").order("created_at"),
    supabase.from("accomplishments").select("*").in("status", ["ready", "needs_metrics"]),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("awards").select("*").order("sort_order"),
    supabase.from("skill_groups").select("*").order("sort_order"),
  ]);

  if (!role.data) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  const bank = accomplishments.data ?? [];
  if (bank.length === 0) {
    return NextResponse.json({ error: "Add some accomplishments to your bank first." }, { status: 400 });
  }

  // Assemble a compact, grounded brief for the model.
  const expById = new Map((experiences.data ?? []).map((e) => [e.id, e]));
  const bankByExp = (experiences.data ?? []).map((e) => {
    const bullets = bank
      .filter((b) => b.experience_id === e.id)
      .map((b) => `- ${b.polished || b.raw_note}${b.themes?.length ? ` [themes: ${b.themes.join(", ")}]` : ""}`);
    return `## ${e.org}${e.role ? ` — ${e.role}` : ""} (${e.start_date ?? ""}${
      e.end_date || e.is_current ? ` – ${e.is_current ? "Present" : e.end_date}` : ""
    })\n${e.tagline ? `${e.tagline}\n` : ""}${bullets.join("\n") || "- (no bullets)"}`;
  });
  const unassigned = bank
    .filter((b) => !b.experience_id || !expById.has(b.experience_id))
    .map((b) => `- ${b.polished || b.raw_note}`);

  const brief = [
    `TARGET ROLE: ${role.data.title}`,
    role.data.framing ? `FRAMING: ${role.data.framing}` : "",
    role.data.keywords?.length ? `KEYWORDS: ${role.data.keywords.join(", ")}` : "",
    "",
    `NAME: ${profile.data?.name ?? ""}`,
    profile.data?.location ? `LOCATION: ${profile.data.location}` : "",
    profile.data?.contact ? `CONTACT: ${JSON.stringify(profile.data.contact)}` : "",
    "",
    "EXPERIENCE + BANK BULLETS:",
    ...bankByExp,
    unassigned.length ? `\nOTHER ACCOMPLISHMENTS:\n${unassigned.join("\n")}` : "",
    education.data?.length ? `\nEDUCATION:\n${JSON.stringify(education.data)}` : "",
    awards.data?.length ? `\nAWARDS:\n${JSON.stringify(awards.data)}` : "",
    skills.data?.length ? `\nSKILLS:\n${JSON.stringify(skills.data)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  let composed;
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: composeSchema,
      system: SYSTEM_PROMPT,
      prompt: brief,
    });
    composed = object;
  } catch {
    return NextResponse.json({ error: "Couldn't compose the résumé. Try again." }, { status: 502 });
  }

  const { data: row, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      target_role_id: roleId,
      title: `${composed.name || profile.data?.name || "Résumé"} — ${role.data.title}`,
      summary: composed.summary,
      item_ids: bank.map((b) => b.id),
      composed,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Couldn't save the résumé." }, { status: 500 });

  return NextResponse.json({ resume: row, composed });
}
