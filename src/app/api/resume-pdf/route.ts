import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KIRA_TEMPLATES } from "@/app/resume/canvas/template";
import type { ParsedResume } from "@/app/resume/parsedResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Local Chrome for `next dev`; production uses @sparticuz/chromium (serverless).
const LOCAL_CHROME =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : "/usr/bin/google-chrome";

const VARIANTS = {
  product: "Kira-Cheung-Resume",
  design: "Kira-Cheung-Design-Engineer-Resume",
  ai: "Kira-Cheung-AI-Deployment-Engineer-Resume",
  fullstack: "Kira-Cheung-Full-Stack-Engineer-Resume",
} as const;
type Variant = keyof typeof VARIANTS;

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV !== "production";
  const url = new URL(request.url);
  const origin = url.origin;

  const variantParam = url.searchParams.get("variant");
  const variant: Variant = variantParam && variantParam in VARIANTS ? (variantParam as Variant) : "fullstack";
  const themeParam = url.searchParams.get("theme");
  const theme = ["claude", "notion", "openai", "wispr", "plain"].includes(themeParam ?? "") ? themeParam! : "claude";
  // Optional: export a saved tailored job document (its own `resumes` row) by id.
  const docId = url.searchParams.get("doc");

  // Render the SIGNED-IN CALLER's own saved résumé (RLS-scoped via the cookie
  // session). There is no cross-user lookup and no public data endpoint, so one
  // user's résumé can never appear in another user's export. Falls back to the
  // template only when there's no session / no saved copy (e.g. a public demo).
  let resume: ParsedResume | null = (KIRA_TEMPLATES[variant] ?? null) as ParsedResume | null;
  let fileBase: string = VARIANTS[variant];
  try {
    const supabase = await createClient();
    if (docId) {
      // A specific tailored document (RLS ensures the caller owns it).
      const { data } = await supabase
        .from("resumes")
        .select("composed")
        .eq("id", docId)
        .maybeSingle();
      const composed = data?.composed as
        | { kind?: string; resume?: ParsedResume; label?: string }
        | null;
      if (composed?.resume) {
        resume = composed.resume;
        const slug = (composed.label ?? "tailored").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
        fileBase = `Kira-Cheung-${slug || "tailored"}`;
      }
    } else {
      const { data } = await supabase
        .from("resumes")
        .select("composed")
        .eq("title", "__canvas__")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const byRole = (data?.composed as { byRole?: Record<string, ParsedResume> } | null)?.byRole ?? null;
      if (byRole?.[variant]) resume = byRole[variant];
    }
  } catch {
    /* no session or DB unreachable — fall back to the template */
  }
  const target = `${origin}/resume/print?theme=${theme}`;

  let browser;
  try {
    browser = await puppeteer.launch(
      isDev
        ? { executablePath: LOCAL_CHROME, headless: true, args: ["--no-sandbox"] }
        : {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
          }
    );

    const page = await browser.newPage();
    // Hand the résumé to the print page before any of its scripts run, so the
    // render never depends on a public endpoint or the visitor's session.
    await page.evaluateOnNewDocument(
      (payload) => {
        (window as unknown as { __RESUME_DATA__?: unknown }).__RESUME_DATA__ = payload;
      },
      { resume, variant }
    );
    await page.goto(target, { waitUntil: "networkidle0", timeout: 45000 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Strip any Next.js dev overlay so it never bleeds into the PDF.
    await page.evaluate(
      "document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-next-badge-root], #__next-build-watcher').forEach(function (el) { el.remove(); })"
    );

    await page.emulateMediaType("print");
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBase}-${date}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("resume-pdf generation failed:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
