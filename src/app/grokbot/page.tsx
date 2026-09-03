import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import GrokbotDoc from "./GrokbotDoc";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

// /grokbot — ideation doc for taking the grok desktop app to the web and
// making it multiplayer. /grokbok redirects here (see next.config.js).
export const metadata: Metadata = {
  title: "Grok goes multiplayer",
  description:
    "Ideation: what happens when grok leaves the desktop, gets a URL, and a second human walks into the room.",
};

export default function GrokbotPage() {
  return (
    <div className={plexMono.variable}>
      <GrokbotDoc />
    </div>
  );
}
