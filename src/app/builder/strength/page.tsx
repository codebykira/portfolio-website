"use client";

import { useState } from "react";
import type { Evaluation } from "../lib/schemas";

const COVERAGE: Record<string, { bg: string; fg: string }> = {
  strong: { bg: "#b7f5c9", fg: "#14532d" },
  partial: { bg: "#ffe6a3", fg: "#7a4b00" },
  gap: { bg: "#ffc9bd", fg: "#7a1c0a" },
};

export default function StrengthPage() {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Evaluation | null>(null);

  const evaluate = async () => {
    if (jd.trim().length < 40) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jd.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed.");
      setResult(data.result as Evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="lego-label">station 4</span>
        <h1 className="lego-title mt-1">strength test</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Paste a job description. Your bricks get matched against its requirements — honestly, with
          the evidence behind each call.
        </p>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={7}
        placeholder="Paste the full job description here…"
        className="lego-textarea"
        style={{ color: "var(--ink)" }}
      />
      <div className="flex items-center gap-3">
        <button onClick={evaluate} disabled={busy || jd.trim().length < 40} className="lego-btn">
          {busy ? "testing…" : "run strength test"}
        </button>
        {error && <span className="lego-error">{error}</span>}
      </div>

      {result && (
        <div className="space-y-5">
          <div className="lego-card flex items-center gap-4 p-4">
            <div
              className="pixel flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-2xl"
              style={{ background: "var(--orange)", color: "#fff", border: "2px solid var(--navy)" }}
            >
              {result.fit_score}
            </div>
            <div>
              <p className="lego-label" style={{ color: "var(--muted)" }}>
                overall fit
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--ink)" }}>
                {result.summary}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="pixel text-sm text-white">requirements</h3>
            {result.requirements.map((r, i) => {
              const c = COVERAGE[r.coverage] ?? COVERAGE.gap;
              return (
                <div key={i} className="lego-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm" style={{ color: "var(--ink)" }}>
                      {r.need}
                    </p>
                    <span className="lego-status shrink-0" style={{ background: c.bg, color: c.fg }}>
                      {r.coverage}
                    </span>
                  </div>
                  {r.evidence && (
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {r.evidence}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {result.gaps.length > 0 && (
            <div className="lego-card p-4">
              <h3 className="pixel text-sm" style={{ color: "var(--orange-deep)" }}>
                gaps to address
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--ink)" }}>
                {result.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="lego-card p-4">
            <h3 className="pixel text-sm" style={{ color: "var(--navy)" }}>
              how to position yourself
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--ink)" }}>
              {result.positioning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
