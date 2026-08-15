import { z } from "zod";

/* ============================================================
   PARSED RÉSUMÉ SCHEMA
   The JSON-serializable shape an uploaded résumé is parsed into.
   Mirrors the `Resume` type in resumeData.ts, but contact icons are
   expressed as a `type` enum (React components can't cross the wire);
   parsedToResume.ts maps each type back to a Phosphor icon on the client.
   Shared by the /api/parse-resume route (as the generateObject schema).
   ============================================================ */

export const CONTACT_TYPES = [
  "location",
  "website",
  "linkedin",
  "x",
  "email",
  "phone",
  "github",
  "other",
] as const;

export const parsedResumeSchema = z.object({
  name: z.string().describe("The person's full name."),
  contact: z
    .array(
      z.object({
        type: z
          .enum(CONTACT_TYPES)
          .describe("Kind of contact detail, used to pick an icon."),
        text: z.string().describe("Display text, e.g. 'Brooklyn, NY' or the handle/URL."),
        href: z
          .string()
          .optional()
          .describe("Link target: mailto:, tel:, or https:// URL. Omit for plain text like a city."),
      }),
    )
    .describe("Contact line: location, website, email, and social profiles."),
  summary: z
    .string()
    .describe("A 1-2 sentence professional summary. Plain text only, no markup."),
  experience: z
    .array(
      z.object({
        org: z.string().describe("Company or organization name."),
        role: z.string().describe("Job title."),
        date: z.string().describe("Date range, e.g. 'Jan 2026 – Present'."),
        tagline: z
          .string()
          .describe("One-line description of the company/product. Empty string if none."),
        points: z.array(z.string()).describe("Bullet points describing impact and work."),
      }),
    )
    .describe("Work experience, most recent first."),
  education: z
    .array(
      z.object({
        org: z.string().describe("School or university name."),
        date: z.string().describe("Date range."),
        detail: z.string().describe("Degree, field of study, honors."),
        points: z.array(z.string()).describe("Optional detail bullets; usually empty."),
      }),
    )
    .describe("Education history."),
  awards: z
    .array(
      z.object({
        title: z.string().describe("Award or leadership title."),
        date: z.string().describe("Year or date."),
        detail: z.string().describe("Short description."),
      }),
    )
    .describe("Awards, honors, and leadership roles. Empty array if none."),
  skills: z
    .array(
      z.object({
        group: z.string().describe("Skill category, e.g. 'Development'."),
        items: z.array(z.string()).describe("Individual skills in the group."),
      }),
    )
    .describe("Skills grouped by category."),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;
