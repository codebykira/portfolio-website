import type { Metadata } from "next";
import GrokbotDoc from "./GrokbotDoc";

// /grokbot — ideation doc for taking the grok desktop app to the web and
// making it multiplayer. /grokbok redirects here (see next.config.js).
export const metadata: Metadata = {
  title: "Grok goes multiplayer",
  description:
    "Ideation: what happens when grok leaves the desktop, gets a URL, and a second human walks into the room.",
};

export default function GrokbotPage() {
  return <GrokbotDoc />;
}
