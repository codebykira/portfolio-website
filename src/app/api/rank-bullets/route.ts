import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiModel } from "@/app/builder/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const requestSchema = z.object({
  role: z.string(),
  experiences: z.array(z.object({ org: z.string(), bullets: z.array(z.string()) })),
});

const rankSchema = z.object({
  experiences: z
    .array(
      z.object({
        order: z
          .array(z.number().int())
          .describe("The bullet indices for this experience, reordered MOST → LEAST relevant/impactful for the target role. Must be a permutation of the given indices."),
      }),
    )
    .describe("One entry per input experience, in the same order."),
});

const SYSTEM_PROMPT =
  "You are a sharp technical recruiter ranking a candidate's résumé bullets for a specific target role. " +
  "For each experience, order its bullets from most to least relevant and impactful for that role — favor bullets " +
  "that show role-relevant skills and quantified outcomes. Return only a permutation of the bullet indices per " +
  "experience. Never rewrite, add, or drop bullets.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use AI ranking." }, { status: 401 });
  }

  let parsed;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const prompt =
    `TARGET ROLE: ${parsed.role}\n\nRank the bullets in each experience for this role.\n\n` +
    parsed.experiences
      .map(
        (e, i) =>
          `Experience ${i} — ${e.org}:\n${e.bullets.map((b, j) => `  [${j}] ${b}`).join("\n")}`,
      )
      .join("\n\n");

  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: rankSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    return NextResponse.json({ experiences: object.experiences });
  } catch {
    return NextResponse.json({ error: "Ranking failed." }, { status: 502 });
  }
}
