import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { parsedResumeSchema } from "@/app/resume/parsedResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Structured extraction runs through the Vercel AI Gateway. Requires
// AI_GATEWAY_API_KEY in the environment (or Vercel OIDC in production).
const MODEL = "openai/gpt-5.4-mini";
const MAX_TEXT = 25_000; // clip very long résumés to keep the request bounded
const MIN_TEXT = 40;

const SYSTEM_PROMPT =
  "You extract structured data from a résumé and return it in the required schema. " +
  "Use only information present in the text — never invent employers, dates, metrics, or skills. " +
  "Preserve the résumé's own wording for bullet points; do not embellish. " +
  "Keep all output as plain text with no markdown or HTML. " +
  "List experience most-recent-first. If a section is absent, return an empty array for it.";

/** Pull plain text out of an uploaded PDF or DOCX file. */
async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx");

  if (isPdf) {
    const { extractText: extractPdfText, getDocumentProxy } = await import("unpdf");
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractPdfText(pdf, { mergePages: true });
    return text;
  }

  if (isDocx) {
    const mammoth = (await import("mammoth")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  throw new UnsupportedFileError();
}

class UnsupportedFileError extends Error {}

export async function POST(request: Request) {
  try {
    let file: FormDataEntryValue | null;
    try {
      const form = await request.formData();
      file = form.get("file");
    } catch {
      return NextResponse.json(
        { error: "Expected a multipart form upload." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 },
      );
    }

    let text: string;
    try {
      text = (await extractText(file)).replace(/\s+\n/g, "\n").trim();
    } catch (err) {
      if (err instanceof UnsupportedFileError) {
        return NextResponse.json(
          { error: "Please upload a PDF or DOCX résumé." },
          { status: 415 },
        );
      }
      throw err;
    }

    if (text.length < MIN_TEXT) {
      return NextResponse.json(
        {
          error:
            "Couldn't read any text from that file — it may be an image-only scan.",
        },
        { status: 422 },
      );
    }

    const { object } = await generateObject({
      model: MODEL,
      schema: parsedResumeSchema,
      system: SYSTEM_PROMPT,
      prompt: `Résumé text:\n\n${text.slice(0, MAX_TEXT)}`,
    });

    return NextResponse.json({ resume: object });
  } catch (err) {
    console.error("parse-resume failed:", err);
    return NextResponse.json(
      { error: "Couldn't parse that résumé. Please try another file." },
      { status: 500 },
    );
  }
}
