"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ParsedResume } from "@/app/resume/parsedResume";
import type { ResumeRow, TargetRole } from "../lib/types";
import ComposedResumePreview from "./ComposedResumePreview";

export default function ComposePage() {
  const supabase = useMemo(() => createClient(), []);
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [recent, setRecent] = useState<ResumeRow[]>([]);
  const [roleId, setRoleId] = useState("");
  const [composed, setComposed] = useState<ParsedResume | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: r }, { data: res }] = await Promise.all([
        supabase.from("target_roles").select("*").order("sort_order"),
        supabase.from("resumes").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      setRoles((r as TargetRole[]) ?? []);
      setRecent((res as ResumeRow[]) ?? []);
    })();
  }, [supabase]);

  const compose = async () => {
    if (!roleId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role_id: roleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed.");
      setComposed(data.composed as ParsedResume);
      setRecent((prev) => [data.resume as ResumeRow, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="lego-label">station 3</span>
        <h1 className="lego-title mt-1">assemble</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Pick a target role. Your bricks get selected and reframed for it into a finished résumé.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="lego-select" style={{ width: "auto" }}>
          <option value="">select a role…</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
        <button onClick={compose} disabled={busy || !roleId} className="lego-btn">
          {busy ? "assembling…" : "assemble résumé"}
        </button>
        {composed && (
          <button onClick={() => window.print()} className="lego-btn lego-btn--ghost">
            print / pdf
          </button>
        )}
        {roles.length === 0 && <span className="pixel text-xs text-white/70">add a role first.</span>}
        {error && <span className="lego-error">{error}</span>}
      </div>

      {recent.length > 0 && !composed && (
        <div className="flex flex-wrap gap-2">
          {recent.map((r) => (
            <button
              key={r.id}
              onClick={() => setComposed(r.composed as ParsedResume)}
              className="lego-btn lego-btn--ghost lego-btn--sm"
            >
              {r.title}
            </button>
          ))}
        </div>
      )}

      {composed && <ComposedResumePreview data={composed} />}
    </div>
  );
}
