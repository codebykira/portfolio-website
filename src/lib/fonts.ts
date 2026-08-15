import localFont from "next/font/local";
import { Inter, Space_Grotesk } from "next/font/google";

/** Departure Mono — the monospace/technical-label font (callouts, meta labels,
 *  index numerals) in the blueprint theme. Self-hosted from public/fonts. */
export const pixelFont = localFont({
  src: "../../public/fonts/DepartureMono-Regular.woff2",
  variable: "--font-pixel",
  display: "swap",
});

/** Space Grotesk — bold grotesque for large editorial display headings. */
export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

/** Clean sans for body copy inside cards. */
export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
