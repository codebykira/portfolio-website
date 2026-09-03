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
import { useResumeTheme, THEMES } from "../ThemeContext";
import type { Evaluation } from "@/app/builder/lib/schemas";
import "../../builder/builder.css";

/* Coverage pill colors for the JD gap report (mirrors builder/strength). */
const COVERAGE: Record<string, { bg: string; fg: string }> = {
  strong: { bg: "#b7f5c9", fg: "#14532d" },
  partial: { bg: "#ffe6a3", fg: "#7a4b00" },
  gap: { bg: "#ffc9bd", fg: "#7a1c0a" },
};

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
  const { state, hydrated, patch, start, reset, setState, disableLocal } = useCanvas();
  const { theme, setTheme } = useResumeTheme();
  // Read after mount rather than with useSearchParams, which would force this
  // statically rendered route to become dynamic.
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmbed(params.get("embed") === "1");
    const urlRole = params.get("role");
    if (urlRole && ROLES.some((r) => r.id === urlRole)) setRole(urlRole as Variant);
  }, []);

  const [user, setUser] = useState<{ email?: string } | null>(null);
  // Full Stack (Claude) is the base résumé — the one Kira spends the most time on.
  const [role, setRole] = useState<Variant>("fullstack");
  const [panelOpen, setPanelOpen] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  // Unsaved-changes flag. Saving is EXPLICIT (the Save button) — nothing writes
  // to the DB in the background, so a second tab can never clobber your work.
  const [dirty, setDirty] = useState(false);
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
  // The embedded preview always renders the template for the requested role,
  // read-only: it never starts a canvas, so it can't touch saved local state.
  const resume = embed
    ? KIRA_TEMPLATES[role] ?? null
    : state.byRole
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

  // Monotonic document revision for optimistic concurrency. We load the DB's
  // rev, and a save only succeeds if the DB rev still matches what we loaded —
  // so a write from another tab/device is refused instead of silently clobbered.
  const revRef = useRef(0);

  // Persist the whole canvas (every role's résumé + blocks) to the signed-in
  // user's account as one "__canvas__" document — kept across devices/sessions.
  // Throws { code: "conflict" } when the account copy changed since we loaded.
  const persistCanvas = async () => {
    if (!state.byRole) return;
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { data: existing } = await supabase
      .from("resumes")
      .select("id, composed")
      .eq("title", "__canvas__")
      .limit(1)
      .maybeSingle();
    const dbRev = ((existing?.composed as { rev?: number } | null)?.rev) ?? 0;
    if (existing?.id && dbRev !== revRef.current) {
      throw Object.assign(new Error("conflict"), { code: "conflict" });
    }
    const nextRev = revRef.current + 1;
    const payload = { byRole: state.byRole, blocks: state.blocks, rev: nextRev };
    if (existing?.id) await supabase.from("resumes").update({ composed: payload }).eq("id", existing.id);
    else await supabase.from("resumes").insert({ user_id: uid, title: "__canvas__", composed: payload });
    revRef.current = nextRev;
  };

  // Once signed in, the account copy owns the data — drop the local cache so a
  // stale localStorage copy can never compete with (or clobber) the DB.
  useEffect(() => {
    if (user) disableLocal();
  }, [user, disableLocal]);

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
        const c = data?.composed as { byRole?: Record<string, ParsedResume>; blocks?: Block[]; rev?: number } | null;
        if (c?.byRole) {
          revRef.current = c.rev ?? 0;
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
    } catch (err) {
      if ((err as { code?: string })?.code === "conflict") {
        setSaveMsg("this résumé was updated in another tab — reload to get the latest, then re-apply your change");
      } else {
        setSaveMsg("couldn't save — try again");
      }
    } finally {
      setSaving(false);
    }
  };

  // Export the current role's résumé to PDF. The server renders the signed-in
  // caller's OWN saved copy (RLS-scoped) via headless Chrome — no public data
  // endpoint, so one user's résumé can never leak into another's export.
  const [exporting, setExporting] = useState(false);
  // Exports exactly what the right pane is showing (base with any unsaved
  // edits, or the tailored preview), in the current theme.
  const exportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    setSaveMsg("exporting…");
    try {
      const label = showingTailored ? tailorLabel.trim() || "tailored" : `${role}-resume`;
      const res = await fetch("/api/resume-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: rightResume, theme, variant: role, filename: label }),
      });
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `Kira-Cheung-${label.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setSaveMsg(null);
    } catch {
      setSaveMsg("export failed — try again");
    } finally {
      setExporting(false);
    }
  };

  // ---- Tailor to a job (per-application tailored résumés) ----
  // Each tailored version is saved as its OWN `resumes` row (kind:"tailored"),
  // separate from the __canvas__ base document — so base résumés stay clean and
  // every application keeps its own reusable copy + gap report.
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [fetchingJd, setFetchingJd] = useState(false);
  const [jdMsg, setJdMsg] = useState<string | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<{ gap_report?: Evaluation; tailored: ParsedResume } | null>(null);
  const [tailorLabel, setTailorLabel] = useState("");
  const [savingJob, setSavingJob] = useState(false);
  const [jobDocs, setJobDocs] = useState<{ id: string; label: string; fit: number | null; theme: string }[]>([]);
  const [exportingDoc, setExportingDoc] = useState<string | null>(null);
  // Which résumé the right pane shows: the editable base, or the tailored result.
  const [rightView, setRightView] = useState<"base" | "tailored">("base");
  // The base résumé stays inline-editable; the tailored preview is read-only.
  const showingTailored = rightView === "tailored" && !!tailorResult;
  const rightResume = showingTailored && tailorResult ? tailorResult.tailored : resume;

  const loadJobDocs = async () => {
    const { data } = await supabase
      .from("resumes")
      .select("id, title, composed")
      .neq("title", "__canvas__")
      .order("updated_at", { ascending: false });
    const docs = (data ?? [])
      .filter((r) => (r.composed as { kind?: string } | null)?.kind === "tailored")
      .map((r) => {
        const c = r.composed as { label?: string; theme?: string; gap_report?: { fit_score?: number } };
        return {
          id: r.id as string,
          label: c.label ?? (r.title as string),
          fit: c.gap_report?.fit_score ?? null,
          theme: c.theme ?? "claude",
        };
      });
    setJobDocs(docs);
  };

  // Switch the résumé format to a detected company's theme. Returns the format
  // label (e.g. "Wispr") when a known company was recognized, else null.
  const applyDetectedTheme = (t: unknown): string | null => {
    const match = THEMES.find((x) => x.id === t);
    if (!match) return null;
    setTheme(match.id);
    return match.label;
  };

  // Fetch the JD text from a pasted URL (falls back to manual paste on failure).
  const fetchJd = async () => {
    if (!jdUrl.trim() || fetchingJd) return;
    setFetchingJd(true);
    setJdMsg(null);
    try {
      const res = await fetch("/api/scrape-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl.trim() }),
      });
      const data = await res.json();
      if (data.text) {
        setJdText(data.text);
        // Auto-switch the résumé format to the detected company's theme.
        const fmt = applyDetectedTheme(data.theme);
        setJdMsg(fmt ? `fetched — using ${fmt} format` : "fetched — review below, then tailor");
        if (data.title && !tailorLabel) setTailorLabel(String(data.title).slice(0, 80));
      } else {
        setJdMsg(data.error ?? "Couldn't read that link — paste the description below.");
      }
    } catch {
      setJdMsg("Couldn't reach that link — paste the description below.");
    } finally {
      setFetchingJd(false);
    }
  };

  const runTailor = async () => {
    if (jdText.trim().length < 40 || tailoring) return;
    setTailoring(true);
    setJdMsg(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText.trim(), base_role: role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed.");
      setTailorResult({ gap_report: data.gap_report as Evaluation, tailored: data.tailored as ParsedResume });
      applyDetectedTheme(data.theme);
      setRightView("tailored");
    } catch (e) {
      setJdMsg(e instanceof Error ? e.message : "Couldn't tailor. Try again.");
    } finally {
      setTailoring(false);
    }
  };

  const saveJobVersion = async () => {
    if (!user || !tailorResult || savingJob) return;
    const label =
      tailorLabel.trim() || `${ROLES.find((r) => r.id === role)?.label ?? role} — tailored`;
    setSavingJob(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      await supabase.from("resumes").insert({
        user_id: uid,
        title: label,
        composed: {
          kind: "tailored",
          label,
          source_url: jdUrl.trim() || null,
          jd_text: jdText.trim(),
          base_role: role,
          theme, // the detected company format this version renders in
          gap_report: tailorResult.gap_report,
          resume: tailorResult.tailored,
        },
      });
      setJdMsg("saved as a job version");
      await loadJobDocs();
    } catch {
      setJdMsg("couldn't save — try again");
    } finally {
      setSavingJob(false);
    }
  };

  const openJobDoc = async (id: string) => {
    const { data } = await supabase.from("resumes").select("composed").eq("id", id).maybeSingle();
    const c = data?.composed as
      | { gap_report?: Evaluation; resume?: ParsedResume; jd_text?: string; label?: string; base_role?: string; theme?: string }
      | null;
    if (c?.resume) {
      setTailorResult({ gap_report: c.gap_report, tailored: c.resume });
      setJdText(c.jd_text ?? "");
      setTailorLabel(c.label ?? "");
      if (c.base_role) setRole(c.base_role as Variant);
      applyDetectedTheme(c.theme); // render this version in its saved company format
      setRightView("tailored");
    }
  };

  const exportJobDoc = async (id: string, label: string, docTheme: string) => {
    if (exportingDoc) return;
    setExportingDoc(id);
    try {
      const res = await fetch(`/api/resume-pdf?doc=${id}&theme=${docTheme}`);
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${label.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "tailored"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      setJdMsg("export failed — try again");
    } finally {
      setExportingDoc(null);
    }
  };

  const deleteJobDoc = async (id: string) => {
    await supabase.from("resumes").delete().eq("id", id);
    await loadJobDocs();
  };

  // Load saved job versions once signed in.
  useEffect(() => {
    if (!user) {
      setJobDocs([]);
      return;
    }
    loadJobDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
        {/* Header — hidden in the embedded preview. No base/style/order controls:
            Full Stack (Claude) is the fixed base; tailoring is the main surface. */}
        <header
          className="lego-topbar flex-wrap"
          style={{ display: embed ? "none" : undefined, borderBottom: "none" }}
        >
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
              compact={embed}
              onTemplate={startTemplate}
              onBlank={startBlank}
              onUpload={() => fileRef.current?.click()}
            />
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* LEFT: tailor workspace — the primary surface (signed-in only) */}
              {user && (
                <aside className="w-full space-y-4 lg:w-[38%] lg:max-w-[27rem] lg:shrink-0">
                  <div className="lego-card space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="lego-label">tailor to a job</span>
                      <span className="lego-label" style={{ color: "var(--muted)" }}>
                        base: {ROLES.find((r) => r.id === role)?.label ?? role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className="lego-input flex-1"
                        placeholder="paste a job URL…"
                        value={jdUrl}
                        onChange={(e) => setJdUrl(e.target.value)}
                      />
                      <button
                        className="lego-btn lego-btn--ghost lego-btn--sm"
                        onClick={fetchJd}
                        disabled={fetchingJd || !jdUrl.trim()}
                      >
                        {fetchingJd ? "fetching…" : "fetch"}
                      </button>
                    </div>
                    <textarea
                      className="lego-textarea"
                      rows={5}
                      placeholder="…or paste the description (some boards can't be fetched)"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      style={{ color: "var(--ink)" }}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        className="lego-btn"
                        onClick={runTailor}
                        disabled={tailoring || jdText.trim().length < 40}
                      >
                        {tailoring ? "tailoring…" : "tailor"}
                      </button>
                      {jdMsg && (
                        <span className="lego-label" style={{ color: "var(--muted)" }}>
                          {jdMsg}
                        </span>
                      )}
                    </div>
                  </div>

                  {tailorResult && (
                    <div className="lego-card space-y-4 p-4">
                      {tailorResult.gap_report && (
                        <div className="flex items-center gap-4">
                          <div
                            className="pixel flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-xl"
                            style={{ background: "var(--orange)", color: "#fff", border: "2px solid var(--navy)" }}
                          >
                            {tailorResult.gap_report.fit_score}
                          </div>
                          <div>
                            <p className="lego-label" style={{ color: "var(--muted)" }}>
                              overall fit
                            </p>
                            <p className="mt-0.5 text-sm" style={{ color: "var(--ink)" }}>
                              {tailorResult.gap_report.summary}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          className="lego-input flex-1"
                          placeholder="label, e.g. Stripe — Product Eng"
                          value={tailorLabel}
                          onChange={(e) => setTailorLabel(e.target.value)}
                        />
                        <button className="lego-btn lego-btn--sm" onClick={saveJobVersion} disabled={savingJob}>
                          {savingJob ? "saving…" : "save version"}
                        </button>
                      </div>

                      {tailorResult.gap_report && (
                        <>
                          <div className="space-y-2">
                            <h3 className="pixel text-sm" style={{ color: "var(--ink)" }}>
                              requirements
                            </h3>
                            {tailorResult.gap_report.requirements.map((r, i) => {
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

                          {tailorResult.gap_report.gaps.length > 0 && (
                            <div className="lego-card p-4">
                              <h3 className="pixel text-sm" style={{ color: "var(--orange-deep)" }}>
                                what you&apos;re lacking
                              </h3>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--ink)" }}>
                                {tailorResult.gap_report.gaps.map((g, i) => (
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
                              {tailorResult.gap_report.positioning}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {jobDocs.length > 0 && (
                    <div className="lego-card p-4">
                      <h3 className="pixel text-sm" style={{ color: "var(--ink)" }}>
                        saved job versions
                      </h3>
                      <div className="mt-2 space-y-2">
                        {jobDocs.map((d) => (
                          <div key={d.id} className="lego-card flex items-center justify-between gap-2 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm" style={{ color: "var(--ink)" }}>
                                {d.label}
                              </p>
                              {d.fit != null && (
                                <p className="lego-label" style={{ color: "var(--muted)" }}>
                                  fit {d.fit}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                className="lego-btn lego-btn--ghost lego-btn--sm"
                                onClick={() => openJobDoc(d.id)}
                              >
                                open
                              </button>
                              <button
                                className="lego-btn lego-btn--ghost lego-btn--sm"
                                onClick={() => exportJobDoc(d.id, d.label, d.theme)}
                                disabled={exportingDoc === d.id}
                              >
                                {exportingDoc === d.id ? "…" : "export"}
                              </button>
                              <button
                                className="lego-btn lego-btn--ghost lego-btn--sm"
                                onClick={() => deleteJobDoc(d.id)}
                              >
                                del
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              )}

              {/* RIGHT: the résumé — editable base, or read-only tailored preview */}
              <div className="min-w-0 flex-1 overflow-x-auto">
                {tailorResult && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="lego-label">viewing</span>
                    <button
                      className={`lego-btn lego-btn--sm ${showingTailored ? "lego-btn--ghost" : ""}`}
                      onClick={() => setRightView("base")}
                    >
                      base
                    </button>
                    <button
                      className={`lego-btn lego-btn--sm ${showingTailored ? "" : "lego-btn--ghost"}`}
                      onClick={() => setRightView("tailored")}
                    >
                      tailored
                    </button>
                  </div>
                )}
                {rightResume && (
                  <ResumeDoc
                    data={parsedToResume(rightResume)}
                    variant={role}
                    chromeless
                    editable={!showingTailored}
                    onEdit={applyEdit}
                  />
                )}
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
                  className="lego-btn lego-btn--ghost lego-btn--sm"
                  onClick={exportPdf}
                  disabled={exporting}
                >
                  {exporting ? "exporting…" : "export pdf"}
                </button>
              )}
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
  compact = false,
}: {
  onTemplate: () => void;
  onBlank: () => void;
  onUpload: () => void;
  /** Scaled down for the embedded preview on the work page. */
  compact?: boolean;
}) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${compact ? "py-6" : "py-12"}`}>
      <span className="lego-label">résumé canvas</span>
      <h1
        className="lego-title mx-auto mt-2 max-w-xl"
        style={{ fontSize: compact ? 20 : 44 }}
      >
        Build your résumé, block by block.
      </h1>
      <p
        className={`mx-auto mt-3 max-w-lg ${compact ? "text-xs" : "text-sm"}`}
        style={{ color: "var(--muted)" }}
      >
        Start from a template, a blank canvas, or an existing file. Everything saves on this device —
        sign in whenever you want to keep it.
      </p>
      <div className={`grid gap-4 sm:grid-cols-3 ${compact ? "mt-5" : "mt-8"}`}>
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
