/** Company "formats" the résumé can render in. Plain data with no client
 *  code, so both the React theme context and server routes can import it. */
export const THEMES = [
  { id: "claude", label: "Claude" },
  { id: "notion", label: "Notion" },
  { id: "openai", label: "OpenAI" },
  { id: "wispr", label: "Wispr" },
  { id: "netflix", label: "Netflix" },
  { id: "linear", label: "Linear" },
  { id: "plain", label: "Plain" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
