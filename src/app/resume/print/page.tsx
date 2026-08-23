"use client";
import { useEffect, useState } from "react";
import ResumeDoc, { type Variant } from "../ResumeDoc";
import { parsedToResume } from "../parsedToResume";
import { KIRA_TEMPLATES } from "../canvas/template";
import type { ParsedResume } from "../parsedResume";

// Public, auth-free render of a single résumé, used by the headless-Chrome PDF
// route (/api/resume-pdf). That route reads the signed-in caller's OWN saved
// copy server-side and injects it as `window.__RESUME_DATA__` before this page's
// scripts run — so the PDF matches the edited résumé with no public data
// endpoint. Falls back to the template when opened directly (a demo/preview).
const VALID: Variant[] = ["product", "design", "ai", "fullstack"];

type Injected = { resume?: ParsedResume; variant?: Variant };

export default function ResumePrintPage() {
  const [variant, setVariant] = useState<Variant>("fullstack");
  const [data, setData] = useState<ParsedResume | null>(null);

  useEffect(() => {
    const injected = (window as unknown as { __RESUME_DATA__?: Injected }).__RESUME_DATA__;
    if (injected?.resume) {
      const v = injected.variant && VALID.includes(injected.variant) ? injected.variant : "fullstack";
      setVariant(v);
      setData(injected.resume);
      return;
    }
    // Standalone / demo fallback: template chosen by ?variant=.
    const raw = new URLSearchParams(window.location.search).get("variant");
    const v: Variant = raw && VALID.includes(raw as Variant) ? (raw as Variant) : "fullstack";
    setVariant(v);
    setData(KIRA_TEMPLATES[v] ?? null);
  }, []);

  if (!data) return null;
  return <ResumeDoc data={parsedToResume(data)} variant={variant} />;
}
