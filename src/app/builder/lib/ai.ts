import { openai } from "@ai-sdk/openai";

/** Model for the builder's AI features (Compose + Strength). Uses the OpenAI
 *  provider directly (reads OPENAI_API_KEY). The bank is fully manual — no AI. */
export const aiModel = openai("gpt-4o-mini");
