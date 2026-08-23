"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Trophy,
  Wrench,
  type Icon,
} from "@phosphor-icons/react";
import type { Resume } from "./resumeData";
import { THEMES, type ThemeId, useResumeTheme } from "./ThemeContext";
import ResumeUpload from "./ResumeUpload";
import "./resume.css";

/* Per-role variant → PDF endpoint + download filename + nav routing */
export type Variant = "product" | "design" | "ai" | "fullstack";

const VARIANTS: Record<Variant, { fileBase: string; path: string }> = {
  product: { fileBase: "Kira-Cheung-Resume", path: "/resume" },
  design: { fileBase: "Kira-Cheung-Design-Engineer-Resume", path: "/resume/design" },
  ai: { fileBase: "Kira-Cheung-AI-Deployment-Engineer-Resume", path: "/resume/ai" },
  fullstack: { fileBase: "Kira-Cheung-Full-Stack-Engineer-Resume", path: "/resume" },
};

const VERSION_LINKS: { variant: Variant; label: string }[] = [
  { variant: "product", label: "Product" },
  { variant: "design", label: "Design Eng" },
  { variant: "ai", label: "AI Deploy" },
];

/* Optional illustrated mark shown to the left of the name, per theme. */
const NAME_MARKS: Partial<Record<ThemeId, string>> = {
  claude: "/claude-mark.svg",
  notion: "/notion-face.png",
};

/* Build a schema.org Person from the resume data so AI/crawlers scanning the
   live page get a clean, unambiguous profile instead of inferring from prose.
   Derived per-variant so title/employer/skills always match what's shown. */
function buildStructuredData(data: Resume): Record<string, unknown> {
  const emailHref = data.contact.find((c) => c.href?.startsWith("mailto:"))?.href;
  const websiteHref = data.contact.find((c) => c.href?.startsWith("http"))?.href;
  const socialHrefs = data.contact
    .filter((c) => c.href?.startsWith("http") && c.href !== websiteHref)
    .map((c) => c.href as string);
  const current = data.experience[0];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    description: data.summary,
    ...(current ? { jobTitle: current.role } : {}),
    ...(websiteHref ? { url: websiteHref } : {}),
    ...(emailHref ? { email: emailHref.replace("mailto:", "") } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Brooklyn", addressRegion: "NY" },
    ...(socialHrefs.length ? { sameAs: socialHrefs } : {}),
    ...(current ? { worksFor: { "@type": "Organization", name: current.org } } : {}),
    alumniOf: data.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.org,
    })),
    knowsAbout: data.skills.flatMap((g) => g.items),
  };
}

function SectionTitle({ title, icon: SectionIcon }: { title: string; icon: Icon }) {
  return (
    <div className="section-title-row">
      <span className="section-title-pill">
        <SectionIcon className="section-icon" size={15} weight="regular" aria-hidden />
        <h2 className="section-title">{title}</h2>
      </span>
      <span className="rule" />
    </div>
  );
}

export default function ResumeDoc({
  data,
  variant,
  chromeless = false,
  editable = false,
  onEdit,
}: {
  data: Resume;
  variant: Variant;
  chromeless?: boolean;
  editable?: boolean;
  onEdit?: (path: string, value: string) => void;
}) {
  // Company "Style" is owned by the resume layout so it survives role switches.
  const { theme, setTheme } = useResumeTheme();

  // When `editable`, every text field becomes contentEditable and commits on
  // blur (not per-keystroke, so the caret is never disrupted mid-typing).
  const editProps = (path: string) =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          spellCheck: false,
          onBlur: (e: React.FocusEvent<HTMLElement>) =>
            onEdit?.(path, e.currentTarget.textContent ?? ""),
        }
      : {};
  const [zoom, setZoom] = useState(1);

  // On the "plain" style, visitors can upload their own résumé to see it
  // rendered in this template. The parsed result overrides the shown data.
  const [override, setOverride] = useState<Resume | null>(null);
  const activeData = override ?? data;
  const isUpload = override !== null;

  // On the "plain" style, before anything is uploaded, we blur Kira's résumé
  // behind a centered "drop your résumé" prompt.
  const showUploadPrompt = theme === "plain" && !isUpload && !chromeless;

  // `chromeless` (embedded in the canvas Preview) or `?embed=1` hides the
  // toolbar + upload affordance and renders just the styled sheet.

  // Embedded preview (?embed=1): no toolbar, and the whole sheet auto-fits the
  // frame so it can be dropped into a card as a live, responsive thumbnail.
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("embed") !== "1") return;
    setEmbed(true);
    const fit = () => {
      const sheetW = 8.5 * 96;
      const sheetH = 11 * 96;
      const availW = window.innerWidth - 24;
      const availH = window.innerHeight - 24;
      setZoom(Math.min(availW / sheetW, availH / sheetH));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Fit the whole Letter page (8.5in x 11in) within the current viewport.
  const fitToScreen = () => {
    const sheetW = 8.5 * 96;
    const sheetH = 11 * 96;
    const availW = window.innerWidth - 40;
    const availH = window.innerHeight - 96; // leave room for the toolbar
    setZoom(Math.min(availW / sheetW, availH / sheetH));
  };
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));

  const [saving, setSaving] = useState(false);
  // Download a real, styled PDF rendered server-side by headless Chrome.
  const savePdf = async () => {
    // An uploaded résumé lives only in the browser, so the server can't
    // re-render it — print the on-screen sheet instead.
    if (isUpload) {
      window.print();
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/resume-pdf?variant=${variant}&theme=${theme}`);
      if (!res.ok) throw new Error("PDF request failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const a = document.createElement("a");
      a.href = url;
      a.download = `${VARIANTS[variant].fileBase}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fall back to the browser print dialog if the server render fails.
      window.print();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Machine-readable profile for AI/ATS scanners reading the live page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData(activeData)) }}
      />

      {/* Google Fonts — React 19 hoists these into <head> */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&family=Inconsolata:wght@500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Figtree:wght@400;500;600;700&family=EB+Garamond:wght@500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div
        className={`resume-root${embed ? " resume-root--embed" : ""}${
          chromeless ? " resume-root--bare" : ""
        }`}
      >
        {!embed && !chromeless && (
        <div className="toolbar" role="toolbar" aria-label="Résumé display controls">
          <span className="label">Version</span>
          <div style={{ display: "flex", gap: 8 }}>
            {VERSION_LINKS.map((v) => (
              <Link
                key={v.variant}
                href={VARIANTS[v.variant].path}
                className={`version-link${variant === v.variant ? " active" : ""}`}
              >
                {v.label}
              </Link>
            ))}
          </div>
          <span className="label" style={{ marginLeft: 12 }}>Style</span>
          <div style={{ display: "flex", gap: 8 }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={theme === t.id ? "active" : undefined}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="spacer" />
          <span className="label">{Math.round(zoom * 100)}%</span>
          <button onClick={fitToScreen} title="Zoom out — fit to screen" aria-label="Zoom out to fit screen">−</button>
          <button onClick={zoomIn} title="Zoom in" aria-label="Zoom in">＋</button>
          <button onClick={savePdf} disabled={saving}>
            {saving ? "Saving…" : "Save PDF"}
          </button>
        </div>
        )}

        {/* The résumé itself is a self-contained <article> so a scanner has a
            clean boundary and reads straight through, skipping the toolbar. */}
        <main>
          <article
            className={`sheet${showUploadPrompt ? " sheet-prompting" : ""}`}
            aria-label={
              isUpload
                ? `Uploaded résumé of ${activeData.name}`
                : `Résumé of ${activeData.name} — ${variant} version`
            }
            style={{ zoom }}
          >
          {/* Plain style only: hover the sheet to upload & restyle a résumé. */}
          {theme === "plain" && !chromeless && (
            <ResumeUpload
              onParsed={setOverride}
              hasOverride={isUpload}
              onReset={() => setOverride(null)}
            />
          )}
          <header>
            <div className="name-row">
              {NAME_MARKS[theme] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="name-mark" src={NAME_MARKS[theme]} alt="" aria-hidden />
              ) : null}
              <h1 className="name" {...editProps("name")}>{activeData.name}</h1>
            </div>
            <div className="contact">
              {activeData.contact.map((c, i) => {
                const IconCmp = c.icon;
                const inner = (
                  <>
                    <IconCmp size={12} weight="fill" aria-hidden />
                    <span {...editProps(`contact.${i}`)}>{c.text}</span>
                  </>
                );
                return c.href && !editable ? (
                  <a key={i} href={c.href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <span key={i}>{inner}</span>
                );
              })}
            </div>
            {/* Editable: plain text. Otherwise Kira's summary may carry <em>. */}
            {editable ? (
              <p className="summary" {...editProps("summary")}>{activeData.summary}</p>
            ) : isUpload ? (
              <p className="summary">{activeData.summary}</p>
            ) : (
              <p className="summary" dangerouslySetInnerHTML={{ __html: activeData.summary }} />
            )}
          </header>

          <section>
            <SectionTitle title="Experience" icon={Briefcase} />
            {activeData.experience.map((e, i) => (
              <div className="entry" key={i}>
                <div className="entry-head">
                  <h3 className="org-line">
                    <span className="org" {...editProps(`exp.${i}.org`)}>{e.org}</span>
                    <span className="role">, <span {...editProps(`exp.${i}.role`)}>{e.role}</span></span>
                  </h3>
                  <span className="entry-date" {...editProps(`exp.${i}.date`)}>{e.date}</span>
                </div>
                <div className="tagline">
                  <span {...editProps(`exp.${i}.tagline`)}>{e.tagline}</span>
                  {e.link && !editable ? (
                    <a href={e.link.href} target="_blank" rel="noopener noreferrer">
                      <LinkIcon size={10} weight="bold" aria-hidden />
                      {e.link.text}
                    </a>
                  ) : null}
                </div>
                <ul className="points">
                  {e.points.map((p, j) => (
                    <li key={j}>
                      <span className="marker" />
                      <span {...editProps(`exp.${i}.pt.${j}`)}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {activeData.education.length > 0 && (
          <section>
            <SectionTitle title="Education" icon={GraduationCap} />
            {activeData.education.map((e, i) => (
              <div className="entry" key={i}>
                <div className="entry-head">
                  <h3 className="org-line">
                    <span className="org" {...editProps(`edu.${i}.org`)}>{e.org}</span>
                  </h3>
                  <span className="entry-date" {...editProps(`edu.${i}.date`)}>{e.date}</span>
                </div>
                <div className="edu-detail" {...editProps(`edu.${i}.detail`)}>{e.detail}</div>
                {e.points.length ? (
                  <ul className="points">
                    {e.points.map((p, j) => (
                      <li key={j}>
                        <span className="marker" />
                        <span {...editProps(`edu.${i}.pt.${j}`)}>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
          )}

          {activeData.awards.length > 0 && (
          <section>
            <SectionTitle title="Awards & Leaderships" icon={Trophy} />
            {activeData.awards.map((a, i) => (
              <div className="award" key={i}>
                <span className="marker" />
                <span className="award-text">
                  <b {...editProps(`award.${i}.title`)}>{a.title}</b>:{" "}
                  <span {...editProps(`award.${i}.detail`)}>{a.detail}</span>
                </span>
                <span className="entry-date" {...editProps(`award.${i}.date`)}>{a.date}</span>
              </div>
            ))}
          </section>
          )}

          {activeData.skills.length > 0 && (
          <section>
            <SectionTitle title="Skills" icon={Wrench} />
            {/* One continuous paragraph: every group + item flows together and
                wraps item-by-item to fill the full width. */}
            <div className="skills-flow">
              {activeData.skills.map((g, i) => (
                <React.Fragment key={i}>
                  <span className="group-label">
                    <span {...editProps(`skill.${i}.group`)}>{g.group}</span>:
                  </span>{" "}
                  <span {...editProps(`skill.${i}.item.0`)}>{g.items[0]}</span>
                  {g.items.slice(1).map((item, j) => (
                    <React.Fragment key={j}>
                      {" "}<span className="sep">·</span>{" "}
                      <span {...editProps(`skill.${i}.item.${j + 1}`)}>{item}</span>
                    </React.Fragment>
                  ))}
                  {i < activeData.skills.length - 1 ? <>{" "}<span className="sep">·</span>{" "}</> : null}
                </React.Fragment>
              ))}
            </div>
          </section>
          )}
          </article>
        </main>
      </div>
    </>
  );
}
