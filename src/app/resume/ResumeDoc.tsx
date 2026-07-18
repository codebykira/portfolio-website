"use client";
import React, { useState } from "react";
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
import "./resume.css";

/* Per-role variant → PDF endpoint + download filename + nav routing */
export type Variant = "product" | "design" | "ai";

const VARIANTS: Record<Variant, { fileBase: string; path: string }> = {
  product: { fileBase: "Kira-Cheung-Resume", path: "/resume" },
  design: { fileBase: "Kira-Cheung-Design-Engineer-Resume", path: "/resume/design" },
  ai: { fileBase: "Kira-Cheung-AI-Deployment-Engineer-Resume", path: "/resume/ai" },
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

function SectionTitle({ title, icon: SectionIcon }: { title: string; icon: Icon }) {
  return (
    <div className="section-title-row">
      <span className="section-title-pill">
        <SectionIcon className="section-icon" size={15} weight="regular" aria-hidden />
        <span className="section-title">{title}</span>
      </span>
      <span className="rule" />
    </div>
  );
}

export default function ResumeDoc({ data, variant }: { data: Resume; variant: Variant }) {
  // Company "Style" is owned by the resume layout so it survives role switches.
  const { theme, setTheme } = useResumeTheme();
  const [zoom, setZoom] = useState(1);

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
      {/* Google Fonts — React 19 hoists these into <head> */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&family=Inconsolata:wght@500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="resume-root">
        <div className="toolbar">
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

        <main className="sheet" style={{ zoom }}>
          <header>
            <div className="name-row">
              {NAME_MARKS[theme] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="name-mark" src={NAME_MARKS[theme]} alt="" aria-hidden />
              ) : null}
              <h1 className="name">{data.name}</h1>
            </div>
            <div className="contact">
              {data.contact.map((c, i) => {
                const IconCmp = c.icon;
                const inner = (
                  <>
                    <IconCmp size={12} weight="fill" aria-hidden />
                    {c.text}
                  </>
                );
                return c.href ? (
                  <a key={i} href={c.href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <span key={i}>{inner}</span>
                );
              })}
            </div>
            <p className="summary" dangerouslySetInnerHTML={{ __html: data.summary }} />
          </header>

          <section>
            <SectionTitle title="Experience" icon={Briefcase} />
            {data.experience.map((e, i) => (
              <div className="entry" key={i}>
                <div className="entry-head">
                  <div className="org-line">
                    <span className="org">{e.org}</span>
                    <span className="role">, {e.role}</span>
                  </div>
                  <span className="entry-date">{e.date}</span>
                </div>
                <div className="tagline">
                  {e.tagline}
                  {e.link ? (
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
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <SectionTitle title="Education" icon={GraduationCap} />
            {data.education.map((e, i) => (
              <div className="entry" key={i}>
                <div className="entry-head">
                  <div className="org-line">
                    <span className="org">{e.org}</span>
                  </div>
                  <span className="entry-date">{e.date}</span>
                </div>
                <div className="edu-detail">{e.detail}</div>
                {e.points.length ? (
                  <ul className="points">
                    {e.points.map((p, j) => (
                      <li key={j}>
                        <span className="marker" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>

          <section>
            <SectionTitle title="Awards & Leaderships" icon={Trophy} />
            {data.awards.map((a, i) => (
              <div className="award" key={i}>
                <span className="marker" />
                <span className="award-text">
                  <b>{a.title}:</b> {a.detail}
                </span>
                <span className="entry-date">{a.date}</span>
              </div>
            ))}
          </section>

          <section>
            <SectionTitle title="Skills" icon={Wrench} />
            <div className="skills-flow">
              {data.skills.map((g, i) => (
                <React.Fragment key={i}>
                  {/* Label + first item are glued (nowrap) so the group label
                      never gets stranded alone at the end of a line. */}
                  <span className="group-lead">
                    <span className="group-label">{g.group}:</span>&nbsp;{g.items[0]}
                  </span>
                  {g.items.slice(1).map((item, j) => (
                    <React.Fragment key={j}>
                      <span className="sep">·</span>
                      {item}
                    </React.Fragment>
                  ))}
                  {i < data.skills.length - 1 ? <>&nbsp; </> : null}
                </React.Fragment>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
