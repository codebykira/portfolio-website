// Shared HTML→text helpers + ATS (Ashby / Greenhouse / Lever) public-API
// resolvers. These job boards render the description CLIENT-SIDE, so a plain
// server-side HTML fetch only sees an empty app shell. Each ATS exposes a public
// JSON API that returns the full posting — we detect the board from the URL and
// pull the JD from there, falling back to generic HTML scraping otherwise.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function htmlToText(html: string): { text: string; title?: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : undefined;

  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|header|footer)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  s = decodeEntities(s)
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text: s, title };
}

// Map a detected company to the résumé "format" (theme) it should render in.
// Highest-signal hints first (ATS org slug, page title), then JD body text.
const COMPANY_THEMES: { theme: string; pattern: RegExp }[] = [
  { theme: "claude", pattern: /\banthropic\b|\bclaude\b/i },
  { theme: "openai", pattern: /\bopenai\b/i },
  { theme: "notion", pattern: /\bnotion(\.so|hq)?\b/i },
  { theme: "wispr", pattern: /\bwispr\b|wisprflow|wispr\s*flow/i },
];

/** Returns the theme id for a recognized company, or null. Scans the given
 *  hints (org slug, title, then a slice of JD text) in priority order. */
export function detectCompanyTheme(...hints: (string | null | undefined)[]): string | null {
  for (const h of hints) {
    if (!h) continue;
    for (const c of COMPANY_THEMES) if (c.pattern.test(h)) return c.theme;
  }
  return null;
}

export type Ats = { provider: "ashby" | "greenhouse" | "lever"; org: string; jobId: string };

/** Recognize an Ashby / Greenhouse / Lever posting URL and pull out org + job id. */
export function detectAts(u: URL): Ats | null {
  const host = u.hostname.toLowerCase();
  const segs = u.pathname.split("/").filter(Boolean);

  // Ashby: jobs.ashbyhq.com/{org}/{uuid}
  if (host.endsWith("ashbyhq.com") && segs.length >= 2 && UUID.test(segs[1])) {
    return { provider: "ashby", org: segs[0], jobId: segs[1] };
  }

  // Lever: jobs.lever.co/{org}/{uuid}
  if (host.endsWith("lever.co") && segs.length >= 2 && UUID.test(segs[1])) {
    return { provider: "lever", org: segs[0], jobId: segs[1] };
  }

  // Greenhouse: (job-)boards.greenhouse.io/{org}/jobs/{numericId}
  if (host.endsWith("greenhouse.io")) {
    const jobsIdx = segs.indexOf("jobs");
    if (jobsIdx >= 1 && segs[jobsIdx + 1]) {
      const id = segs[jobsIdx + 1].replace(/\D/g, "");
      if (id) return { provider: "greenhouse", org: segs[jobsIdx - 1], jobId: id };
    }
    // Embedded form: /embed/job_app?for={org}&token={id}  (also ?gh_jid=)
    const forOrg = u.searchParams.get("for");
    const token = (u.searchParams.get("token") ?? u.searchParams.get("gh_jid") ?? "").replace(/\D/g, "");
    if (forOrg && token) return { provider: "greenhouse", org: forOrg, jobId: token };
  }

  return null;
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch the full JD text from the board's public API. Null if unavailable. */
export async function fetchAtsJd(ats: Ats): Promise<{ text: string; title?: string } | null> {
  if (ats.provider === "ashby") {
    const data = (await getJson(
      `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(ats.org)}`,
    )) as { jobs?: Array<{ id: string; title?: string; descriptionPlain?: string; descriptionHtml?: string }> } | null;
    const job = data?.jobs?.find((j) => j.id === ats.jobId);
    if (!job) return null;
    const text = (job.descriptionPlain || htmlToText(job.descriptionHtml ?? "").text).trim();
    return { text, title: job.title };
  }

  if (ats.provider === "greenhouse") {
    const data = (await getJson(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(ats.org)}/jobs/${encodeURIComponent(ats.jobId)}`,
    )) as { title?: string; content?: string } | null;
    if (!data?.content) return null;
    // `content` is entity-encoded HTML — decode it back to real tags, then strip.
    const text = htmlToText(decodeEntities(data.content)).text.trim();
    return { text, title: data.title };
  }

  if (ats.provider === "lever") {
    const d = (await getJson(
      `https://api.lever.co/v0/postings/${encodeURIComponent(ats.org)}/${encodeURIComponent(ats.jobId)}`,
    )) as
      | { text?: string; descriptionPlain?: string; lists?: Array<{ text?: string; content?: string }>; additionalPlain?: string }
      | null;
    if (!d) return null;
    const parts: string[] = [];
    if (d.descriptionPlain) parts.push(d.descriptionPlain);
    for (const l of d.lists ?? []) {
      if (l.text) parts.push(`${l.text}:`);
      if (l.content) parts.push(htmlToText(l.content).text);
    }
    if (d.additionalPlain) parts.push(d.additionalPlain);
    return { text: parts.filter(Boolean).join("\n\n").trim(), title: d.text };
  }

  return null;
}
