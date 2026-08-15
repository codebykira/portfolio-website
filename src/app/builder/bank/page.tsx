"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Accomplishment, Experience } from "../lib/types";
import AccomplishmentCard from "./AccomplishmentCard";

type MetricDraft = { label: string; value: string };

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function BankPage() {
  const supabase = useMemo(() => createClient(), []);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [items, setItems] = useState<Accomplishment[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual brick fields
  const [bullet, setBullet] = useState("");
  const [metrics, setMetrics] = useState<MetricDraft[]>([{ label: "", value: "" }]);
  const [skills, setSkills] = useState("");
  const [themes, setThemes] = useState("");
  const [expId, setExpId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newOrg, setNewOrg] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: exps }, { data: accs }] = await Promise.all([
        supabase.from("experiences").select("*").order("sort_order").order("created_at"),
        supabase.from("accomplishments").select("*").order("created_at", { ascending: false }),
      ]);
      setExperiences((exps as Experience[]) ?? []);
      setItems((accs as Accomplishment[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const addExperience = async () => {
    if (!newOrg.trim()) return;
    const { data, error } = await supabase
      .from("experiences")
      .insert({ org: newOrg.trim(), role: newRole.trim() || null, sort_order: experiences.length })
      .select()
      .single();
    if (error || !data) {
      setError("Couldn't add that job.");
      return;
    }
    setExperiences((e) => [...e, data as Experience]);
    setExpId((data as Experience).id);
    setNewOrg("");
    setNewRole("");
  };

  const saveBrick = async () => {
    if (bullet.trim().length < 3) return;
    setSaving(true);
    setError(null);
    const cleanMetrics = metrics
      .filter((m) => m.label.trim() && m.value.trim())
      .map((m) => ({ label: m.label.trim(), value: m.value.trim(), verified: true }));
    const { data, error } = await supabase
      .from("accomplishments")
      .insert({
        experience_id: expId || null,
        raw_note: bullet.trim(),
        polished: bullet.trim(),
        metrics: cleanMetrics,
        skills: splitList(skills),
        themes: splitList(themes),
        status: "ready",
        open_questions: [],
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setError("Couldn't save that brick.");
      return;
    }
    setItems((prev) => [data as Accomplishment, ...prev]);
    setBullet("");
    setMetrics([{ label: "", value: "" }]);
    setSkills("");
    setThemes("");
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("accomplishments").delete().eq("id", id);
  };

  const expName = (id: string | null) => {
    const e = experiences.find((x) => x.id === id);
    return e ? `${e.org}${e.role ? ` · ${e.role}` : ""}` : "unassigned";
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="lego-label">station 1</span>
        <h1 className="lego-title mt-1">the brick bank</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Every accomplishment is a brick. Type the bullet, snap on your metrics and tags — you own
          the words, nothing is rewritten.
        </p>
      </div>

      {/* Brick builder */}
      <div className="lego-card p-5">
        <textarea
          value={bullet}
          onChange={(e) => setBullet(e.target.value)}
          rows={2}
          placeholder="Bullet — e.g. Rebuilt onboarding into a single 20-second page"
          className="lego-textarea"
          style={{ color: "var(--ink)" }}
        />

        {/* Metrics editor */}
        <div className="mt-4">
          <span className="pixel text-xs uppercase tracking-wide" style={{ color: "var(--navy)" }}>
            metrics
          </span>
          <div className="mt-2 space-y-2">
            {metrics.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={m.label}
                  onChange={(e) =>
                    setMetrics((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="label (e.g. abandonment)"
                  className="lego-input"
                />
                <input
                  value={m.value}
                  onChange={(e) =>
                    setMetrics((arr) => arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                  }
                  placeholder="value (e.g. 95% → 9%)"
                  className="lego-input"
                />
                {metrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setMetrics((arr) => arr.filter((_, j) => j !== i))}
                    className="lego-btn lego-btn--sm"
                    style={{ background: "#fff", color: "var(--navy)" }}
                    aria-label="Remove metric"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMetrics((arr) => [...arr, { label: "", value: "" }])}
            className="pixel mt-2 text-xs underline underline-offset-4"
            style={{ color: "var(--orange-deep)" }}
          >
            + add metric
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="skills, comma-separated"
            className="lego-input"
          />
          <input
            value={themes}
            onChange={(e) => setThemes(e.target.value)}
            placeholder="tags — growth, infra, ai"
            className="lego-input"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={expId} onChange={(e) => setExpId(e.target.value)} className="lego-select" style={{ width: "auto" }}>
            <option value="">no job</option>
            {experiences.map((e) => (
              <option key={e.id} value={e.id}>
                {e.org}
                {e.role ? ` · ${e.role}` : ""}
              </option>
            ))}
          </select>
          {error && <span className="lego-error" style={{ color: "var(--orange-deep)" }}>{error}</span>}
          <button onClick={saveBrick} disabled={saving || bullet.trim().length < 3} className="lego-btn ml-auto">
            {saving ? "snapping…" : "add brick"}
          </button>
        </div>
      </div>

      {/* Add a job */}
      <div className="lego-panel lego-panel--dashed flex flex-wrap items-center gap-2 p-3">
        <span className="lego-label">add a job</span>
        <input value={newOrg} onChange={(e) => setNewOrg(e.target.value)} placeholder="company" className="lego-input" style={{ width: "auto", flex: "1 1 160px" }} />
        <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="role (optional)" className="lego-input" style={{ width: "auto", flex: "1 1 160px" }} />
        <button onClick={addExperience} disabled={!newOrg.trim()} className="lego-btn lego-btn--ghost lego-btn--sm">
          add
        </button>
      </div>

      {/* Bank list */}
      {loading ? (
        <p className="pixel text-sm text-white/70">loading…</p>
      ) : items.length === 0 ? (
        <p className="pixel text-sm text-white/70">no bricks yet. build your first one above.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}>
              <p className="lego-label mb-1">{expName(item.experience_id)}</p>
              <AccomplishmentCard item={item} onDelete={deleteItem} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
