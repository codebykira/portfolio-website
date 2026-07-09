"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Globe, LinkedinLogo, XLogo, EnvelopeSimple, Link as LinkIcon, type Icon } from "@phosphor-icons/react";
import "./resume.css";

/* ============================================================
   THEME REGISTRY — add a new company style here + a CSS block in resume.css
   ============================================================ */
const THEMES = [
  { id: "claude", label: "Claude" },
  { id: "plain", label: "Plain" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

/* ============================================================
   RESUME DATA — edit content here only
   ============================================================ */
const RESUME = {
  name: "Kira Cheung",
  contact: [
    { text: "Brooklyn, NY", icon: MapPin },
    { text: "kiracheung.space", href: "https://www.kiracheung.space/", icon: Globe },
    { text: "linkedin.com/in/kira-cheung", href: "https://www.linkedin.com/in/kira-cheung", icon: LinkedinLogo },
    { text: "x.com/CheungKira", href: "https://x.com/CheungKira", icon: XLogo },
    { text: "kiracheung0211@gmail.com", href: "mailto:kiracheung0211@gmail.com", icon: EnvelopeSimple },
  ] as { text: string; href?: string; icon: Icon }[],
  summary:
    "I love to build, and I build with care. Ship production-quality from early prototypes, simplify as products mature, iterate live for retention and fit.",
  experience: [
    {
      org: "Atrios",
      role: "Head of Product, Tastemaker Experience",
      date: "Jan 2026 – Present",
      tagline:
        "Web platform that turns warm introductions into qualified sales meetings. Backed by a16z.",
      link: { text: "link", href: "https://atrios.com" },
      points: [
        "Grew users from 0 to 2,000 and revenue from $0 to $1M in 5 months by shipping the core loop that makes Atrios's marketplace work: an incentive and feedback system that gets leads to take qualified sales calls and share post-call feedback, turning every meeting into either a converted customer or a third-party ICP signal that vendors can't source anywhere else.",
        "Rebuilt the infrastructure and the shipping culture together: migrated off the AWS Lambda architecture that was gating every release and built a design and engineering team that ships daily and celebrates wins in real time, taking release cadence from monthly to daily.",
        "Set the product metrics the team measures against and built the analytics infrastructure to track them end-to-end across every user flow, revisiting and evolving the target metrics monthly so the team always measures what actually drives growth, not what's easiest to instrument.",
      ],
    },
    {
      org: "Blind Hangouts",
      role: "Founder and CEO",
      date: "Jan 2025 – Jan 2026",
      tagline:
        "iOS app with an AI agent that plans your social life. Backed by Founders Inc.",
      link: { text: "link", href: "https://www.kiracheung.space/blind-hangouts" },
      points: [
        "Grew to 1,200 users by shipping an AI agent that learns your behavior, recommends what to do, and books it for your whole group, cutting social planning from days to minutes. Built end-to-end solo (iOS, backend, UX) with an army of AI agents as my engineering team.",
        "Engineered the multi-user coordination layer that made it work: a preference-matching model combining natural language input with behavioral and contextual signals (location, weather, pricing, calendar) that resolved conflicting group preferences into a single booked plan.",
      ],
    },
    {
      org: "Waverly",
      role: "Product and Growth Lead, Founding Team Member",
      date: "Nov 2021 – Aug 2024",
      tagline:
        "Mobile social network for interest-based communities, with AI matching to the people you'd actually click with. Backed by Betaworks.",
      link: { text: "link", href: "https://betakit.com/element-ai-co-founder-launches-waverly-to-fix-the-internet-by-changing-the-way-people-consume-content/" },
      points: [
        'Identified community builders as the segment that actually stuck and rebuilt the product around them: skipped generic setup in onboarding and landed them straight in a "seed your community" flow (define a shared interest, invite 5-10 initial members), then shipped an AI-powered member-matching layer that auto-suggested new joiners based on each community\'s conversation patterns. Lifted activation 40%.',
        'Cut time-to-value from 14 days to 3 by turning the ML team\'s recommendation model into a daily curated card of 5 people you might click with, replacing the previous open feed that overwhelmed users. Redefined "connection quality" as a two-way DM within 48 hours of a match (not just a follow), and ran the experiments that validated each model change against it. Drove Day-30 retention to 85%.',
        "Drove 10K+ signups by pitching and winning BBC/CBC coverage, closed 10 enterprise partnerships at Startupfest, and ran marketing, partnerships, and sales end-to-end as the GTM lead on the founding team.",
      ],
    },
  ],
  education: [
    {
      org: "Penn Engineering, University of Pennsylvania",
      date: "Sep 2022 – Dec 2024",
      detail:
        "Master of Computer and Information Technology, focus on Artificial Intelligence",
      points: [] as string[],
    },
    {
      org: "Rotman Commerce, University of Toronto",
      date: "Sep 2018 – Apr 2022",
      detail:
        "Bachelor of Commerce, Finance, minor in Economics (graduated w/ High Distinction)",
      points: [] as string[],
    },
  ],
  awards: [
    {
      title: "Winner, Y Combinator Hackathon",
      date: "2025",
      detail:
        "Built voice AI agent serving as daily work assistant, handling email replies, message responses, and appointment scheduling through natural conversation.",
    },
    {
      title: "Included VC Fellowship (<2% acceptance)",
      date: "2023",
      detail:
        "Global program training leaders for VC careers, backed by BITKRAFT, Seedcamp, and HSBC Ventures. Built a 0-to-1 GPT-4 matching platform that lifted match accuracy 35% and validated PMF across 5 beta partnerships.",
    },
    {
      title: "University of Toronto Student Leadership Award",
      date: "2022",
      detail:
        "Recognized among 4,000+ students for exceptional peer leadership and community impact.",
    },
    {
      title: "President, Rotman Commerce Student Association",
      date: "2021",
      detail:
        "Elected from 700+ students to lead 9 portfolios of 50 students. Launched first student-led scholarship ($25K) recognizing exceptional international student leaders.",
    },
  ],
  skills: [
    { group: "AI/ML", items: ["Large Language Model APIs", "RAG systems", "Prompt Engineering", "Vector Databases", "Model Customization"] },
    { group: "Data & Analytics", items: ["Python", "SQL", "Pandas/NumPy", "Product Analytics (Mixpanel, Amplitude)", "A/B Testing", "Data Visualization"] },
    { group: "Development", items: ["React/JavaScript", "Swift", "Flutter", "PostgreSQL", "APIs", "Redis", "Web scraping", "FastAPI / Flask", "Docker", "Cloud", "CI/CD pipelines", "Webhooks"] },
    { group: "Product", items: ["Figma", "Framer", "GTM Planning", "Prototype Development", "User Research"] },
  ],
};

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="section-title-row">
      <span className="section-title">{title}</span>
      <span className="rule" />
    </div>
  );
}

export default function ResumePage() {
  const [theme, setTheme] = useState<ThemeId>("claude");
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

  // Load saved theme on mount, mark the document for print styling,
  // and clean up when navigating away so other routes aren't themed.
  useEffect(() => {
    let saved: ThemeId = "claude";
    try {
      const stored = localStorage.getItem("resume-theme");
      if (stored && THEMES.some((t) => t.id === stored)) saved = stored as ThemeId;
    } catch {
      /* localStorage unavailable */
    }
    setTheme(saved);
    document.documentElement.setAttribute("data-resume", "");
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-resume");
    };
  }, []);

  // Reflect the active theme on <html> and persist it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("resume-theme", theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  return (
    <>
      {/* Google Fonts — React 19 hoists these into <head> */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&family=Inconsolata:wght@500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div className="resume-root">
        <div className="toolbar">
          <span className="label">Style</span>
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
          <button onClick={() => window.print()}>Save PDF</button>
        </div>

        <main className="sheet" style={{ zoom }}>
          <header>
            <div className="name-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="name-mark" src="/claude-mark.svg" alt="" aria-hidden />
              <h1 className="name">{RESUME.name}</h1>
            </div>
            <div className="contact">
              {RESUME.contact.map((c, i) => {
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
            <p
              className="summary"
              dangerouslySetInnerHTML={{ __html: RESUME.summary }}
            />
          </header>

          <section>
            <SectionTitle title="Experience" />
            {RESUME.experience.map((e, i) => (
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
            <SectionTitle title="Education" />
            {RESUME.education.map((e, i) => (
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
            <SectionTitle title="Awards & Leaderships" />
            {RESUME.awards.map((a, i) => (
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
            <SectionTitle title="Skills" />
            <div className="skills-flow">
              {RESUME.skills.map((g, i) => (
                <React.Fragment key={i}>
                  <span className="group-label">{g.group}:</span>{" "}
                  {g.items.map((item, j) => (
                    <React.Fragment key={j}>
                      {item}
                      {j < g.items.length - 1 ? <span className="sep">·</span> : null}
                    </React.Fragment>
                  ))}
                  {i < RESUME.skills.length - 1 ? <>&nbsp; </> : null}
                </React.Fragment>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
