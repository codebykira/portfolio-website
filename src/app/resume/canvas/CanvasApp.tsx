"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ParsedResume } from "../parsedResume";
import { createClient } from "@/lib/supabase/client";
import { pixelFont, displayFont, bodyFont } from "@/lib/fonts";
import { useCanvas, useUsageElapsed, newBlockId, type Block } from "./store";
import { KIRA_TEMPLATES, blankByRole, blocksFromResume } from "./template";
import ResumeDoc, { type Variant } from "../ResumeDoc";
import { parsedToResume } from "../parsedToResume";
import { useResumeTheme, THEMES, type ThemeId } from "../ThemeContext";
import "../../builder/builder.css";

const ROLES: { id: Variant; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "design", label: "Design Eng" },
  { id: "ai", label: "AI Deploy" },
  { id: "fullstack", label: "Full Stack" },
];

/* Heuristic bullet strength (AI-free): a quantified result + an action verb is
   strong; a bare number or verb is fair; neither is weak. */
function bulletStrength(text: string): 0 | 1 | 2 {
  const t = text.trim();
  const hasMetric = /(\$\s?\d|\d+\s?%|\bfrom\b[^.]*\bto\b|\d[\d,]*\s?(users|k\b|m\b|x\b|days|months|years|hours))/i.test(t);
  const hasNumber = /\d/.test(t);
  const actionVerb = /^(built|shipped|grew|cut|drove|designed|led|launched|rebuilt|closed|owned|engineered|created|increased|reduced|scaled|delivered|ran|managed|improved|turned|killed|migrated|established|crafted|prototyped|partnered|identified)/i.test(t);
  let score = 0;
  if (hasMetric) score += 2;
  else if (hasNumber) score += 1;
  if (actionVerb) score += 1;
  return score >= 3 ? 2 : score >= 1 ? 1 : 0;
}

const STRENGTH_LABEL = ["weak", "fair", "strong"] as const;
const STRENGTH_COLOR = ["#b85c38", "#b8862c", "#2e6a44"];

/* Keywords that signal a bullet's relevance to each role. Used to rank bullets
   when "order for role" is pressed. */
const ROLE_KEYWORDS: Record<string, string[]> = {
  product: ["user", "arr", "revenue", "retention", "onboarding", "activation", "marketplace", "growth", "conversion", "roadmap", "discovery", "metric", "gtm", "signup", "partnership", "incentive"],
  design: ["design", "figma", "framer", "interface", "motion", "prototype", " ui", " ux", "component", "animation", "craft", "swiftui", "react", "visual", "system", "flow"],
  ai: ["llm", "rag", "eval", "model", "gpt", "vector", "infrastructure", "deploy", "backend", "ml ", "prompt", " api", "agent", "pipeline", "function", "python", "recommend"],
  fullstack: ["react", "next", "typescript", "swift", "python", "fastapi", "postgres", "backend", "frontend", "api", "docker", "ci", "infrastructure", "redis", "end-to-end", "full-stack", "shipped", "built"],
};

function roleScore(text: string, role: string): number {
  const t = text.toLowerCase();
  return (ROLE_KEYWORDS[role] ?? []).reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
}

function Strength({ text }: { text: string }) {
  const level = bulletStrength(text);
  return (
    <span className="flex items-center gap-1" title={`Bullet strength: ${STRENGTH_LABEL[level]}`}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            style={{
              width: 9,
              height: 4,
              borderRadius: 1,
              background: k <= level ? STRENGTH_COLOR[level] : "var(--rule)",
            }}
          />
        ))}
      </span>
      <span
        className="pixel"
        style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: STRENGTH_COLOR[level] }}
      >
        {STRENGTH_LABEL[level]}
      </span>
    </span>
  );
}

export default function CanvasApp() {
  const supabase = useMemo(() => createClient(), []);
  const { state, hydrated, patch, start, reset, setState } = useCanvas();
  const { theme, setTheme } = useResumeTheme();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [role, setRole] = useState<Variant>("product");
  const [panelOpen, setPanelOpen] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  // Unsaved-changes flag. Saving is EXPLICIT (the Save button) — nothing writes
  // to the DB in the background, so a second tab can never clobber your work.
  const [dirty, setDirty] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const elapsed = useUsageElapsed(state.startedAt, 30);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { email: data.user.email } : null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ? { email: session.user.email } : null),
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // The active role's résumé — each role keeps its own bullet combination.
  // A role not yet saved (e.g. a newly added one) falls back to its template.
  // Every role — Full Stack included — renders from its saved copy so on-page
  // edits win and persist. It falls back to the template only when unsaved.
  // (Stale copies are healed once, on load, via the TEMPLATE_VERSION guard.)
  const resume = state.byRole
    ? state.byRole[role] ?? KIRA_TEMPLATES[role] ?? null
    : null;

  // ---- resume mutation helpers (immutable) ----
  const setResume = (r: ParsedResume) => {
    setDirty(true);
    setState((s) => ({ ...s, byRole: { ...(s.byRole ?? {}), [role]: r } }));
  };
  const addBulletTo = (i: number, text: string) =>
    resume &&
    setResume({
      ...resume,
      experience: resume.experience.map((e, j) => (j === i ? { ...e, points: [...e.points, text] } : e)),
    });

  // Commit an inline edit from the résumé preview back into the canvas data.
  const applyEdit = (path: string, value: string) => {
    if (!resume) return;
    const r = structuredClone(resume) as ParsedResume;
    const p = path.split(".");
    const idx = Number(p[1]);
    if (path === "name") r.name = value;
    else if (path === "summary") r.summary = value;
    else if (p[0] === "contact") {
      if (r.contact[idx]) r.contact[idx].text = value;
    } else if (p[0] === "exp") {
      const e = r.experience[idx];
      if (!e) return;
      if (p[2] === "org") e.org = value;
      else if (p[2] === "role") e.role = value;
      else if (p[2] === "date") e.date = value;
      else if (p[2] === "tagline") e.tagline = value;
      else if (p[2] === "pt") e.points[Number(p[3])] = value;
    } else if (p[0] === "edu") {
      const e = r.education[idx];
      if (!e) return;
      if (p[2] === "org") e.org = value;
      else if (p[2] === "date") e.date = value;
      else if (p[2] === "detail") e.detail = value;
      else if (p[2] === "pt") e.points[Number(p[3])] = value;
    } else if (p[0] === "award") {
      const a = r.awards[idx];
      if (!a) return;
      if (p[2] === "title") a.title = value;
      else if (p[2] === "detail") a.detail = value;
      else if (p[2] === "date") a.date = value;
    } else if (p[0] === "skill") {
      const g = r.skills[idx];
      if (!g) return;
      if (p[2] === "group") g.group = value;
      else if (p[2] === "item") g.items[Number(p[3])] = value;
    }
    setResume(r);
  };

  // Which block texts are currently in the active résumé (for the drop/remove toggle).
  const resumeBulletSet = useMemo(() => {
    const s = new Set<string>();
    resume?.experience.forEach((e) => e.points.forEach((p) => s.add(p)));
    resume?.education.forEach((e) => e.points.forEach((p) => s.add(p)));
    return s;
  }, [resume]);

  const removeBlockFromResume = (b: Block) => {
    if (!resume) return;
    const r = structuredClone(resume) as ParsedResume;
    r.experience.forEach((e) => (e.points = e.points.filter((p) => p !== b.text)));
    r.education.forEach((e) => (e.points = e.points.filter((p) => p !== b.text)));
    setResume(r);
  };

  // Reorder every experience's bullets by relevance to the active role
  // (keyword match), with bullet strength as the tiebreaker.
  const orderForRole = async () => {
    if (!resume || ranking) return;
    setRanking(true);

    // Deterministic keyword+strength fallback if the AI call fails.
    const heuristic = () => {
      const r = structuredClone(resume) as ParsedResume;
      const rank = (p: string) => roleScore(p, role) * 10 + bulletStrength(p);
      r.experience.forEach((e) => e.points.sort((a, b) => rank(b) - rank(a)));
      setResume(r);
    };

    try {
      const res = await fetch("/api/rank-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: ROLES.find((r) => r.id === role)?.label ?? role,
          experiences: resume.experience.map((e) => ({ org: e.org, bullets: e.points })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      const r = structuredClone(resume) as ParsedResume;
      (data.experiences as { order: number[] }[]).forEach((ex, i) => {
        const pts = r.experience[i]?.points;
        if (!pts || !Array.isArray(ex.order)) return;
        const seen = new Set<number>();
        const reordered: string[] = [];
        ex.order.forEach((k) => {
          if (k >= 0 && k < pts.length && !seen.has(k)) {
            seen.add(k);
            reordered.push(pts[k]);
          }
        });
        pts.forEach((p, k) => !seen.has(k) && reordered.push(p));
        r.experience[i].points = reordered;
      });
      setResume(r);
    } catch {
      heuristic();
    } finally {
      setRanking(false);
    }
  };

  const [targetExp, setTargetExp] = useState(0);
  const [newBlock, setNewBlock] = useState("");

  const addBlock = () => {
    if (!newBlock.trim()) return;
    setDirty(true);
    patch({ blocks: [{ id: newBlockId(), text: newBlock.trim(), tags: [] }, ...state.blocks] });
    setNewBlock("");
  };
  const dropBlock = (b: Block) => {
    if (!resume || resume.experience.length === 0) return;
    addBulletTo(Math.min(targetExp, resume.experience.length - 1), b.text);
  };

  // ---- entry actions ----
  const startTemplate = () => start(KIRA_TEMPLATES, blocksFromResume(KIRA_TEMPLATES.product));
  const startBlank = () => start(blankByRole("Your Name"), []);
  const startUpload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/extract-text", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setSaveMsg(data?.error ?? "Couldn't read that file.");
      return;
    }
    const blocks: Block[] = (data.lines as string[])
      .slice(0, 60)
      .map((t) => ({ id: newBlockId(), text: t, tags: [] }));
    start(blankByRole("Your Name"), blocks);
  };

  // Persist the whole canvas (every role's résumé + blocks) to the signed-in
  // user's account as one "__canvas__" document — kept across devices/sessions.
  const persistCanvas = async () => {
    if (!state.byRole) return;
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const payload = { byRole: state.byRole, blocks: state.blocks };
    const { data: existing } = await supabase
      .from("resumes")
      .select("id")
      .eq("title", "__canvas__")
      .limit(1)
      .maybeSingle();
    if (existing?.id) await supabase.from("resumes").update({ composed: payload }).eq("id", existing.id);
    else await supabase.from("resumes").insert({ user_id: uid, title: "__canvas__", composed: payload });
  };

  // On sign-in, load the saved canvas from the account. The DB is the single
  // source of truth — every role loads verbatim and the template NEVER
  // overrides a saved copy (it only seeds brand-new, never-saved roles).
  //
  // `dbLoaded` flips true only AFTER the load lands in state, so the debounced
  // auto-save can't fire first and clobber the DB with stale localStorage.
  const loadingRef = useRef(false);
  useEffect(() => {
    if (!user || dbLoaded || loadingRef.current) return;
    loadingRef.current = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("resumes")
          .select("composed")
          .eq("title", "__canvas__")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const c = data?.composed as { byRole?: Record<string, ParsedResume>; blocks?: Block[] } | null;
        if (c?.byRole) {
          setState((s) => ({
            ...s,
            byRole: c.byRole!,
            blocks: c.blocks ?? s.blocks,
            startedAt: s.startedAt ?? Date.now(),
          }));
        }
      } finally {
        setDbLoaded(true);
      }
    })();
  }, [user, dbLoaded, supabase, setState]);

  // Saving is EXPLICIT — this is the ONLY path that writes to the DB, so nothing
  // can overwrite your résumé in the background. Called by the Save button.
  const [saving, setSaving] = useState(false);
  const saveNow = async () => {
    if (!user || saving) return;
    setSaving(true);
    setSaveMsg("saving…");
    try {
      await persistCanvas();
      setDirty(false);
      setSaveMsg("saved to your account");
    } catch {
      setSaveMsg("couldn't save — try again");
    } finally {
      setSaving(false);
    }
  };

  // Warn before leaving/reloading with unsaved edits, so a refresh can't
  // silently drop work that was never saved to the account.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!hydrated) return null;

  const shell = `${pixelFont.variable} ${displayFont.variable} ${bodyFont.variable} builder-root`;

  return (
    <div className={shell}>
      <div className="builder-frame">
        {/* Header */}
        <header className="lego-topbar flex-wrap">
          <span className="lego-brand">
            <span className="lego-brand-mark" aria-hidden />
            résumé.canvas
          </span>

          {resume && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="lego-label">role</span>
              <select
                className="lego-select"
                style={{ width: "auto", fontFamily: "var(--font-pixel), monospace" }}
                value={role}
                onChange={(e) => setRole(e.target.value as Variant)}
                aria-label="Role"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="lego-label ml-1">company</span>
              <select
                className="lego-select"
                style={{ width: "auto", fontFamily: "var(--font-pixel), monospace" }}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
                aria-label="Company style"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                className="lego-btn lego-btn--ghost lego-btn--sm ml-1"
                onClick={orderForRole}
                disabled={ranking}
                title="Rank bullets by AI for the selected role"
              >
                {ranking ? "ranking…" : "order for role"}
              </button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            {resume && (
              <button className="lego-btn lego-btn--ghost lego-btn--sm" onClick={() => setPanelOpen((o) => !o)}>
                {panelOpen ? "hide blocks" : "show blocks"}
              </button>
            )}
            {user ? (
              <>
                <span className="lego-label hidden sm:inline">{user.email}</span>
                <button className="lego-btn lego-btn--ghost lego-btn--sm" onClick={signOut}>
                  log out
                </button>
              </>
            ) : (
              <Link href="/login?next=/resume" className="lego-btn lego-btn--sm">
                sign in
              </Link>
            )}
          </div>
        </header>

        <main className="w-full">
          {!resume ? (
            <Entry
              onTemplate={startTemplate}
              onBlank={startBlank}
              onUpload={() => fileRef.current?.click()}
            />
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Themed résumé preview — always the surface */}
              <div className="min-w-0 flex-1 overflow-x-auto">
                <ResumeDoc
                  data={parsedToResume(resume)}
                  variant={role}
                  chromeless
                  editable
                  onEdit={applyEdit}
                />
              </div>

              {/* Blocks panel */}
              {panelOpen && (
                <aside className="fixed right-0 top-[56px] z-50 w-[min(30rem,94vw)] p-4">
                  <div className="lego-card flex max-h-[80vh] flex-col shadow-2xl">
                    <div className="shrink-0 p-4">
                      <span className="lego-label">building blocks</span>
                      <div className="mt-3 flex gap-2">
                        <input
                          className="lego-input"
                          placeholder="new block…"
                          value={newBlock}
                          onChange={(e) => setNewBlock(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addBlock()}
                        />
                        <button className="lego-btn lego-btn--sm" onClick={addBlock}>
                          add
                        </button>
                      </div>
                      {resume.experience.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="lego-label shrink-0">drop into</span>
                          <select
                            className="lego-select"
                            value={targetExp}
                            onChange={(e) => setTargetExp(Number(e.target.value))}
                          >
                            {resume.experience.map((e, i) => (
                              <option key={i} value={i}>
                                {e.org || `Role ${i + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex-1 space-y-2 overflow-y-auto border-t px-4 pb-4 pt-3"
                      style={{ borderColor: "var(--rule)" }}
                    >
                      {state.blocks.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          No blocks yet.
                        </p>
                      ) : (
                        state.blocks.map((b) => {
                          const inResume = resumeBulletSet.has(b.text);
                          return (
                            <div key={b.id} className="lego-panel p-2.5">
                              <p className="text-[13px]" style={{ color: "var(--ink)" }}>
                                {b.text}
                              </p>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                {inResume ? (
                                  <button
                                    className="pixel text-[11px]"
                                    style={{ color: "var(--muted)" }}
                                    onClick={() => removeBlockFromResume(b)}
                                  >
                                    − remove from résumé
                                  </button>
                                ) : (
                                  <button
                                    className="pixel text-[11px]"
                                    style={{ color: "var(--orange-deep)" }}
                                    onClick={() => dropBlock(b)}
                                  >
                                    + drop into résumé
                                  </button>
                                )}
                                <Strength text={b.text} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}
        </main>

        {/* Save bar */}
        {resume && (
          <div className="lego-topbar" style={{ borderTop: "1px solid var(--rule)", borderBottom: "none" }}>
            <span className="lego-label">
              {user
                ? dirty
                  ? "unsaved changes"
                  : `saved to ${user.email ?? "your account"}`
                : "saved on this device — sign in to keep it"}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {saveMsg && <span className="lego-label">{saveMsg}</span>}
              <button className="lego-btn lego-btn--ghost lego-btn--sm" onClick={reset}>
                start over
              </button>
              {user && (
                <button
                  className="lego-btn lego-btn--sm"
                  onClick={saveNow}
                  disabled={saving || !dirty}
                  style={dirty ? undefined : { opacity: 0.5 }}
                >
                  {saving ? "saving…" : dirty ? "save" : "saved"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 30-minute sign-in nudge */}
      {elapsed && !user && !nudged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="lego-card max-w-sm p-6">
            <h2 className="lego-title" style={{ fontSize: 24 }}>
              save your work
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              You&apos;ve been building for a while. Sign in to save your résumé and blocks to your account —
              they&apos;re only on this device until you do.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/login?next=/resume" className="lego-btn lego-btn--sm">
                sign in &amp; save
              </Link>
              <button className="lego-btn lego-btn--ghost lego-btn--sm" onClick={() => setNudged(true)}>
                later
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) startUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Entry({
  onTemplate,
  onBlank,
  onUpload,
}: {
  onTemplate: () => void;
  onBlank: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl py-12 text-center">
      <span className="lego-label">résumé canvas</span>
      <h1 className="lego-title mt-2" style={{ fontSize: 44 }}>
        Build your résumé, block by block.
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm" style={{ color: "var(--muted)" }}>
        Start from a template, a blank canvas, or an existing file. Everything saves on this device —
        sign in whenever you want to keep it.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <button className="lego-card p-6 text-left" onClick={onTemplate}>
          <span className="bp-numeral" style={{ fontSize: 40 }}>
            01
          </span>
          <h3 className="mt-2 text-base">Template</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            Start from a filled example résumé.
          </p>
        </button>
        <button className="lego-card p-6 text-left" onClick={onBlank}>
          <span className="bp-numeral" style={{ fontSize: 40 }}>
            02
          </span>
          <h3 className="mt-2 text-base">Blank</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            Start from empty building blocks.
          </p>
        </button>
        <button className="lego-card p-6 text-left" onClick={onUpload}>
          <span className="bp-numeral" style={{ fontSize: 40 }}>
            03
          </span>
          <h3 className="mt-2 text-base">Upload</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            PDF or DOCX → cleaned into blocks by hand.
          </p>
        </button>
      </div>
    </div>
  );
}
