"use client";
import { useEffect, useState } from "react";
import ResumeDoc, { type Variant } from "../ResumeDoc";
import { parsedToResume } from "../parsedToResume";
import { KIRA_TEMPLATES } from "../canvas/template";
import type { ParsedResume } from "../parsedResume";

// Public, auth-free render of a single role's résumé, used by the headless
// Chrome PDF route (/api/resume-pdf). The canvas at /resume is auth-gated, so a
// server render can't reach it — instead this fetches the owner's LIVE saved
// copy from /api/resume-data so the PDF matches the edited résumé exactly
// (falling back to the template only if that copy can't be loaded).
const VALID: Variant[] = ["product", "design", "ai", "fullstack"];

export default function ResumePrintPage() {
  const [variant, setVariant] = useState<Variant>("fullstack");
  const [data, setData] = useState<ParsedResume | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("variant");
    const v: Variant = raw && VALID.includes(raw as Variant) ? (raw as Variant) : "fullstack";
    setVariant(v);
    let cancelled = false;
    fetch(`/api/resume-data?variant=${v}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setData((j.resume as ParsedResume) ?? KIRA_TEMPLATES[v] ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(KIRA_TEMPLATES[v] ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;
  return <ResumeDoc data={parsedToResume(data)} variant={variant} />;
}
