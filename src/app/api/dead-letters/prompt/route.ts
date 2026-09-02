import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { aiModel } from "@/app/builder/lib/ai";

// GET /api/dead-letters/prompt?avoid=<a>|<b> — one line to sit at the top of a
// fresh sheet of paper. A new sheet gets a new prompt.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

// Left-field openings, one picked at random per request. Temperature alone
// makes a model circle the same three ideas; steering it at a different door
// each time is what actually produces variety.
const ANGLES = [
  "a specific five minutes of the day, not the whole day",
  "something they ate, and whether it was any good",
  "a person they spoke to, and what it was about",
  "something they noticed on the way somewhere",
  "a small thing that went wrong and did not matter",
  "the last thing that made them laugh",
  "what the weather did to the day",
  "something they meant to do and did not",
  "a moment they were alone in",
  "something someone else said that stuck",
  "what they were doing when they last checked the time",
  "the part of the day they would keep if they could keep one part",
];

// Used when the model is slow, rate-limited, or the key is missing. The sheet
// should never wait on a network call.
const FALLBACK = [
  "What was the best five minutes of today?",
  "What did you eat today? Was it any good?",
  "Who did you talk to, and what about?",
  "What did you notice on the way somewhere?",
  "What almost happened today?",
  "What made you laugh, even a little?",
  "What are you still thinking about from today?",
  "What did you mean to do today and not do?",
  "Where were you when you last checked the time?",
  "What is the smallest good thing that happened?",
];

const schema = z.object({
  prompt: z
    .string()
    .describe(
      "One line, 6-14 words, asking about one small concrete part of the " +
        "writer's day. No preamble, no quotation marks."
    ),
});

const SYSTEM = [
  "You write the single line at the top of a blank sheet where someone is about to write about their day.",
  "It is anonymous — nobody will know who wrote it — but this is not a confession booth. Most people have had an ordinary day and want an easy way in.",
  "",
  "Voice: warm, plain, curious. Someone who actually wants to hear it, asking over a table.",
  "",
  "Address the writer as 'you', or use a bare imperative. Never write in the first person — you are opening a door, not walking through it.",
  "Vary how you open; do not lean on the same verb every time.",
  "",
  "Rules:",
  "- 6 to 14 words, one line, fitting above a small writing area.",
  "- Ask about something CONCRETE and small: a moment, a meal, a person, a walk, a thing they noticed. Specific questions are easy to answer; 'how was your day' is not.",
  "- It must be answerable by someone whose day was completely unremarkable.",
  "- No therapy register, no self-improvement, no gratitude exercises, no prompting for lessons or growth.",
  "- Do not fish for something painful or secret. If a heavy answer comes, that is the writer's choice, not the prompt's request.",
  "- Never ask for a name, a place, a date, or anything else identifying — the page is anonymous by design.",
  "- Banned words: journal, reflect, explore, feelings, journey, vulnerable, healing, unpack, safe space, grateful, blessed.",
  "- No emoji, no quotation marks, no hashtags, no preamble like 'Prompt:'.",
].join("\n");

/**
 * Stop hammering a model that is plainly not answering.
 *
 * With no credit on the key, every request costs a full timeout before falling
 * back — so the sheet waits seconds for a line we already had, and the console
 * fills with AbortErrors. After a failure we skip the model entirely for a
 * while. Best-effort per instance, like the deposit rate limit.
 */
let modelColdUntil = 0;
const COOLDOWN_MS = 5 * 60 * 1000;

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function fallback(avoid: string[]): string {
  const fresh = FALLBACK.filter((p) => !avoid.includes(p));
  return pick(fresh.length ? fresh : FALLBACK);
}

export async function GET(req: NextRequest) {
  // The client sends back the last few it displayed so a new sheet doesn't
  // repeat the sheet before it.
  const avoid = (req.nextUrl.searchParams.get("avoid") ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!process.env.OPENAI_API_KEY || Date.now() < modelColdUntil) {
    return NextResponse.json({ prompt: fallback(avoid), source: "fallback" });
  }

  try {
    const { object } = await generateObject({
      model: aiModel,
      schema,
      temperature: 1,
      // A sheet must never wait on the model. Without these, a 429 (an expired
      // key, or no credit left) is retried with backoff and the request hangs
      // long enough that the client's fetch never settles — which leaves the
      // "another" control disabled forever.
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(3500),
      system: SYSTEM,
      prompt: [
        `Write one prompt about: ${pick(ANGLES)}.`,
        avoid.length
          ? `Do not write anything close to these, in wording or in idea:\n${avoid.map((a) => `- ${a}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });

    const line = object.prompt.trim().replace(/^["']|["']$/g, "");
    const words = line.split(/\s+/).length;
    // Two failure modes worth catching: a line too long for the sheet, and the
    // model confessing in the first person instead of prompting.
    const firstPerson = /^(i|i'm|i've|my|we|we're)\b/i.test(line);
    if (!line || words > 20 || firstPerson) {
      return NextResponse.json({ prompt: fallback(avoid), source: "fallback" });
    }
    return NextResponse.json({ prompt: line, source: "ai" });
  } catch {
    // Rate limit, timeout, bad key — the sheet still gets a line, and we stop
    // asking for a few minutes rather than paying the timeout every click.
    modelColdUntil = Date.now() + COOLDOWN_MS;
    return NextResponse.json({ prompt: fallback(avoid), source: "fallback" });
  }
}
