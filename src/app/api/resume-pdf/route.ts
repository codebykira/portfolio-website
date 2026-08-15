import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

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

// Which resume version to render → source path + download filename base.
// Full Stack renders via the auth-free /resume/print page (the live /resume is
// an auth-gated canvas headless Chrome can't reach).
const VARIANTS = {
  product: { path: "/resume", fileBase: "Kira-Cheung-Resume" },
  design: { path: "/resume/design", fileBase: "Kira-Cheung-Design-Engineer-Resume" },
  ai: { path: "/resume/ai", fileBase: "Kira-Cheung-AI-Deployment-Engineer-Resume" },
  fullstack: { path: "/resume/print", fileBase: "Kira-Cheung-Full-Stack-Engineer-Resume" },
} as const;

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV !== "production";
  const url = new URL(request.url);
  const origin = url.origin;
  const variantParam = url.searchParams.get("variant");
  const variant =
    variantParam === "design" || variantParam === "ai" || variantParam === "fullstack"
      ? variantParam
      : "product";
  const { path, fileBase } = VARIANTS[variant];

  // Forward the chosen style so the render matches the on-screen selection
  // (headless Chrome has no access to the user's localStorage theme).
  const themeParam = url.searchParams.get("theme");
  const theme = ["claude", "notion", "openai", "plain"].includes(themeParam ?? "") ? themeParam : null;
  const targetUrl = new URL(`${origin}${path}`);
  if (variant === "fullstack") targetUrl.searchParams.set("variant", "fullstack");
  if (theme) targetUrl.searchParams.set("theme", theme);
  const target = targetUrl.toString();

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
    await page.goto(target, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });
    // Give web fonts a moment to settle so the PDF matches the screen.
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Strip any Next.js dev overlay (static-route indicator, toasts) so it
    // never bleeds into the PDF. No-op in production, where these don't exist.
    await page.evaluate(
      "document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-next-badge-root], #__next-build-watcher').forEach(function (el) { el.remove(); })"
    );

    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // honor @page { size: letter }
    });

    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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
