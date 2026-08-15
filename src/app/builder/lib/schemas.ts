import { z } from "zod";
import { parsedResumeSchema } from "@/app/resume/parsedResume";

/* ============================================================
   AI I/O SCHEMAS — shared by the /api routes (generateObject) and
   the client. Kept wire-safe (plain JSON, no React types).
   ============================================================ */

/** A quantified result pulled out of (or still missing from) a note. */
export const metricSchema = z.object({
  label: z.string().describe("What is being measured, e.g. 'ARR' or 'activation rate'."),
  value: z.string().describe("The figure with units, e.g. '$1M' or '40%'. Empty if unknown."),
  verified: z
    .boolean()
    .describe("True only if the number was clearly stated by the user; false if inferred/assumed."),
});
export type Metric = z.infer<typeof metricSchema>;

/** A clarifying question the AI wants answered to sharpen a metric. */
export const openQuestionSchema = z.object({
  id: z.string().describe("Stable slug id for the question, e.g. 'user-growth-range'."),
  question: z
    .string()
    .describe("A short, specific question about a missing metric, e.g. 'Grew users from what to what, over what period?'"),
  answer: z.string().optional().describe("The user's answer; omit when first asked."),
});
export type OpenQuestion = z.infer<typeof openQuestionSchema>;

/** Compose output reuses the résumé shape the renderer already understands. */
export const composeSchema = parsedResumeSchema;

/** Strength evaluation of a candidate against a job description. */
export const evaluationSchema = z.object({
  fit_score: z.number().min(0).max(100).describe("Overall fit, 0–100, grounded in the evidence."),
  summary: z.string().describe("2–3 sentence honest read on fit."),
  requirements: z
    .array(
      z.object({
        need: z.string().describe("A single requirement distilled from the JD."),
        coverage: z.enum(["strong", "partial", "gap"]).describe("How well the candidate covers it."),
        evidence: z
          .string()
          .describe("Which accomplishment(s) back this, quoted or paraphrased. Empty for a gap."),
      }),
    )
    .describe("Per-requirement coverage, most important first."),
  gaps: z.array(z.string()).describe("The most important missing or weak areas."),
  positioning: z
    .string()
    .describe("How the candidate should position themselves for this role given their real evidence."),
});
export type Evaluation = z.infer<typeof evaluationSchema>;
