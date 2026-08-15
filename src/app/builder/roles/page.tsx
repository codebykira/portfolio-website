"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TargetRole } from "../lib/types";

export default function RolesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [framing, setFraming] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("target_roles")
        .select("*")
        .order("sort_order")
        .order("created_at");
      setRoles((data as TargetRole[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const addRole = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("target_roles")
      .insert({
        title: title.trim(),
        framing: framing.trim() || null,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        sort_order: roles.length,
      })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setRoles((r) => [...r, data as TargetRole]);
      setTitle("");
      setFraming("");
      setKeywords("");
    }
  };

  const deleteRole = async (id: string) => {
    setRoles((r) => r.filter((x) => x.id !== id));
    await supabase.from("target_roles").delete().eq("id", id);
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="lego-label">station 2</span>
        <h1 className="lego-title mt-1">target roles</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          The jobs you&apos;re aiming for. Each is a mould the AI uses to reframe your bricks when it
          builds a résumé.
        </p>
      </div>

      <div className="lego-card space-y-3 p-5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Role title — e.g. AI Deployment Engineer" className="lego-input" />
        <textarea value={framing} onChange={(e) => setFraming(e.target.value)} rows={2} placeholder="Framing — the angle to emphasize (LLM pipelines, evals, infra ownership)" className="lego-textarea" />
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Keywords, comma-separated — rag, evals, python" className="lego-input" />
        <button onClick={addRole} disabled={saving || !title.trim()} className="lego-btn">
          add role
        </button>
      </div>

      {loading ? (
        <p className="pixel text-sm text-white/70">loading…</p>
      ) : roles.length === 0 ? (
        <p className="pixel text-sm text-white/70">no roles yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id} className="lego-card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="pixel text-base" style={{ color: "var(--navy)" }}>
                  {r.title}
                </h3>
                <button onClick={() => deleteRole(r.id)} className="pixel text-xs" style={{ color: "var(--muted)" }}>
                  ✕
                </button>
              </div>
              {r.framing && (
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {r.framing}
                </p>
              )}
              {r.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.keywords.map((k, i) => (
                    <span key={i} className="lego-tag">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
