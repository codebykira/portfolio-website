import type { ParsedResume } from "../parsedResume";
import type { Block } from "./store";
import { newBlockId } from "./store";

/* Kira's résumé as canvas templates, one per target role (wire-safe
   ParsedResume shape). Contact / education / awards are shared; the summary,
   experience bullets, and skills change per role. Mirrors resumeData.ts. */

const CONTACT: ParsedResume["contact"] = [
  { type: "location", text: "Brooklyn, NY" },
  { type: "website", text: "kiracheung.space", href: "https://www.kiracheung.space/" },
  { type: "linkedin", text: "linkedin.com/in/kira-cheung", href: "https://www.linkedin.com/in/kira-cheung" },
  { type: "x", text: "x.com/CheungKira", href: "https://x.com/CheungKira" },
  { type: "email", text: "kiracheung0211@gmail.com", href: "mailto:kiracheung0211@gmail.com" },
];

const EDUCATION: ParsedResume["education"] = [
  { org: "University of Pennsylvania", date: "Sep 2022 – Dec 2024", detail: "Master of Applied Science in Computer Science — focus on Artificial Intelligence", points: [] },
  { org: "University of Toronto", date: "Sep 2018 – Apr 2022", detail: "BCom, Finance, minor in Economics (High Distinction)", points: [] },
];

const AWARDS: ParsedResume["awards"] = [
  { title: "Winner, Y Combinator Hackathon", date: "2025", detail: "Built a voice AI agent as a daily work assistant." },
  { title: "Included VC Fellowship (<2% acceptance)", date: "2023", detail: "Built a 0-to-1 GPT-4 matching platform that lifted match accuracy 35%." },
];

/** Shared job headers; only the bullets differ per role. */
const meta = {
  atrios: { org: "Atrios", role: "Head of Product, Tastemaker Experience", date: "Jan 2026 – Present", tagline: "B2B platform where sales teams turn warm introductions into qualified pipeline. Backed by a16z." },
  blind: { org: "Blind Hangouts", role: "Founder and CEO", date: "Jan 2025 – Jan 2026", tagline: "iOS app with an AI agent that plans your social life. Backed by Founders Inc." },
  waverly: { org: "Waverly", role: "Product and Growth Lead, Founding Team Member", date: "Nov 2021 – Aug 2024", tagline: "Mobile social network for interest-based communities, with AI matching. Backed by Betaworks." },
};

const PRODUCT: ParsedResume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary: "I love to build, and I build with care. Ship production-quality from early prototypes, simplify as products mature, iterate live for retention and fit.",
  experience: [
    { ...meta.atrios, points: [
      "Killed the original product on arrival and rebuilt the platform from scratch into a two-sided marketplace. Grew it from 0 to 2,000 users and $0 to $1M ARR in five months.",
      "Cut onboarding from a two-day, multi-page flow to a single 20-second page, dropping abandonment from 95% to 9%.",
      "Designed the two-sided incentive loop that makes the marketplace grow: tastemakers earn for sharing warm intros, companies get sales-cycle intelligence.",
    ] },
    { ...meta.blind, points: [
      "Grew to 1,200 users by shipping an AI agent that learns your behavior and books plans for your whole group. Built end-to-end solo.",
      "Engineered the multi-user coordination layer combining natural language with behavioral and contextual signals into a single booked plan.",
    ] },
    { ...meta.waverly, points: [
      "Closed 10 enterprise partnerships at Startupfest and drove 10K+ signups by winning BBC and CBC coverage.",
      "Rebuilt onboarding around a 'seed your community' flow and shipped an AI matching layer, lifting activation 40%.",
      "Cut time-to-value from 14 days to 3 with a daily curated card of 5 people; drove Day-30 retention to 85%.",
    ] },
  ],
  education: EDUCATION,
  awards: AWARDS,
  skills: [
    { group: "AI/ML", items: ["LLM APIs", "RAG systems", "Prompt Engineering", "Vector Databases"] },
    { group: "Data & Analytics", items: ["SQL", "Product Analytics", "A/B Testing"] },
    { group: "Product", items: ["Figma", "Framer", "GTM Planning", "User Research"] },
  ],
};

const DESIGN: ParsedResume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary: "I design and build interfaces end-to-end, from Figma and motion prototypes to production React. I care about craft, feel, and the small details that make a product come alive.",
  experience: [
    { ...meta.atrios, points: [
      "Own the interface end-to-end: design flows in Figma, build them in React/Next.js, ship to production. Took release cadence from monthly to daily.",
      "Established the design language and component patterns the team builds on, so every surface stays consistent and on-brand.",
      "Prototype interactions and micro-animations to pin down feel before writing production code — motion, timing, and the loading/empty/error states most people skip.",
    ] },
    { ...meta.blind, points: [
      "Designed and built the entire iOS app solo, from UX and visual design through SwiftUI. Every screen, interaction, and animation shipped by one person.",
      "Crafted the multi-user coordination flow into a single clear, delightful path with real-time state and thoughtful transitions.",
    ] },
    { ...meta.waverly, points: [
      "Designed and prototyped the onboarding and matching experience, then paired with engineering to ship it — lifting activation 40%.",
      "Turned the ML team's model into a daily curated card of 5 people, cutting time-to-value from 14 days to 3. Drove Day-30 retention to 85%.",
    ] },
  ],
  education: EDUCATION,
  awards: AWARDS,
  skills: [
    { group: "Design", items: ["Figma", "Framer", "Prototyping", "Motion Design", "Design Systems"] },
    { group: "Frontend", items: ["React / Next.js", "TypeScript", "SwiftUI", "Framer Motion", "Tailwind"] },
    { group: "Engineering", items: ["PostgreSQL", "REST APIs", "FastAPI", "Docker", "CI/CD"] },
  ],
};

const AI: ParsedResume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary: "I build and deploy AI products end-to-end, from LLM pipelines and evals to the infrastructure that ships them. I move fast, measure what matters, and turn models into products people use.",
  experience: [
    { ...meta.atrios, role: "Head of Product", points: [
      "Shipped an end-to-end rebuild: a marketplace surface with AI-suggested introductions backed by GPT-4.1, LinkedIn sync gated behind a paid-value moment. 0 → 2,000 users and $0 → $1M ARR in five months.",
      "Migrated production off AWS Lambda (100+ functions, no tests) to a cleaner backend. Unblocked daily deploys and added CI + coverage from zero.",
      "Designed a progressive-gating architecture where API-cost-heavy AI recommendations require opt-in sync, cutting onboarding drop-off from 95% to 9% while bounding infra cost.",
    ] },
    { ...meta.blind, role: "Founder & Founding Engineer", points: [
      "Shipped the app solo: native iOS in Swift, a Python/FastAPI backend, and the LLM orchestration layer, with AI coding agents as my engineering team. 1,200 users in one year.",
      "Built the recommender as an LLM pipeline: prompt engineering, RAG over behavioral history, vector search over venues, and an eval framework run on every model change.",
    ] },
    { ...meta.waverly, role: "Founding Team Member", points: [
      "Owned the evaluation framework and experiment cadence for the ML recommendation team; redefined 'connection quality' as a two-way DM within 48 hours and A/B-tested every iteration against it.",
      "Partnered with ML engineering to ship an AI matching layer from conversation-pattern signals, lifting activation 40% and driving Day-30 retention to 85%.",
    ] },
  ],
  education: EDUCATION,
  awards: AWARDS,
  skills: [
    { group: "AI/ML", items: ["LLM APIs (OpenAI)", "RAG Systems", "Prompt Engineering", "Vector DBs", "Function Calling", "Evals"] },
    { group: "Development", items: ["Python", "React", "Swift", "FastAPI", "PostgreSQL", "Docker", "CI/CD"] },
    { group: "Data", items: ["SQL", "Product Analytics", "A/B Testing"] },
  ],
};

// Full-Stack Engineer résumé tailored for an Anthropic/Claude engineering role.
// Bracketed values ([N], [mechanism], [users], [group size]) are intentional
// placeholders for Kira to fill — never invent them.
const FULLSTACK: ParsedResume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary:
    "I design, build, and instrument consumer interfaces end to end. Figma, to production React, to the dashboards that say whether it worked. Founding engineer twice over; currently lead a team of three shipping daily. AI products since 2021. React, Next.js, TypeScript, Node.",
  experience: [
    { ...meta.atrios, role: "Founding Engineer, Product & Design", tagline: "Consumer product on a B2B model: turning warm introductions into qualified pipeline. Backed by a16z.", points: [
      "Lead 3 engineers and set technical direction across the stack. Took Atrios from prototype to $1M ARR and 2,000 users in five months, and established the design language and component patterns the team ships on.",
      "Collapsed a multi-day manual review into one inline qualification session, cutting time from signup to a user's first booked meeting from 5 days to 7 min.",
      "Built the measurement layer the team decides against: 200+ typed product events feeding funnel, retention, and cohort dashboards reviewed daily — including outlier checks that surface abuse patterns like self-dealt introductions and repeated intake-gate attempts.",
      "Replaced a 100+ AWS Lambda backend that gated every deploy and had zero test coverage with one typed Node service on ECS. Stood up CI, tests, and preview deploys from nothing, taking releases from monthly to daily.",
    ] },
    { ...meta.blind, role: "Founder & Full-Stack Engineer", tagline: "Consumer app with an AI agent that plans your social life. Backed by Founders Inc.", points: [
      "Built the real-time coordination layer that turns streaming group input into a live updating plan, reconciling conflicting availability across groups of 5 without the UI ever showing a stale or half-applied state. Cut social planning from days to minutes.",
      "Took the product from zero to launch in one month, owning UX and visual design, the client, and the AI agent layer.",
    ] },
    { ...meta.waverly, role: "Founding Engineer", tagline: "Consumer social network for interest-based communities, with AI matching. Web and iOS. Backed by Betaworks.", points: [
      "Turned the ML team's recommendation model into a daily curated card of five people to meet, replacing an overwhelming open feed. Time to value dropped from 14 days to 3, and Day-30 retention rose to 48%.",
      "Rebuilt onboarding on the web client around a 'seed your community' flow that landed builders straight into value, lifting activation 40%. Designed and prototyped it, then shipped it in React. Also built the A/B experimentation platform the team ran it against, covering assignment, exposure logging, and readout.",
    ] },
  ],
  education: [
    { org: "University of Pennsylvania, Penn Engineering", date: "Sep 2022 – Dec 2024", detail: "Master of Applied Science in Computer Science, focus on Artificial Intelligence (completed alongside, then following, Waverly)", points: [] },
    { org: "University of Toronto, Rotman Commerce", date: "Sep 2018 – Apr 2022", detail: "BCom, Finance, minor in Economics (High Distinction)", points: [] },
  ],
  awards: [
    { title: "Winner, Y Combinator Hackathon", date: "2025", detail: "Built a voice AI agent as a daily work assistant handling email, messages, and scheduling through natural conversation." },
    { title: "Included VC Fellowship", date: "2023", detail: "Under 2% acceptance; backed by BITKRAFT, Seedcamp, and HSBC Ventures." },
  ],
  skills: [
    { group: "Frontend", items: ["TypeScript", "React / Next.js", "Tailwind CSS", "Framer Motion", "Web Vitals & performance profiling", "Responsive, accessible UI"] },
    { group: "Design", items: ["Figma", "Prototyping", "Interaction & motion design", "Design systems"] },
    { group: "Backend", items: ["Node", "Python", "PostgreSQL", "Redis", "REST"] },
    { group: "Infra", items: ["AWS (ECS, RDS, CDK)", "Docker", "CI/CD", "Vercel", "PostHog"] },
    { group: "AI", items: ["Anthropic API", "Claude Code", "MCP", "RAG", "Evals"] },
  ],
};

/** All role templates, keyed by role id (matches ResumeDoc Variant). */
export const KIRA_TEMPLATES: Record<string, ParsedResume> = {
  product: PRODUCT,
  design: DESIGN,
  ai: AI,
  fullstack: FULLSTACK,
};

/** Blank résumé per role (same empty shape for each). */
export function blankByRole(name = ""): Record<string, ParsedResume> {
  const blank = (): ParsedResume => ({ name, contact: [], summary: "", experience: [], education: [], awards: [], skills: [] });
  return { product: blank(), design: blank(), ai: blank(), fullstack: blank() };
}

/** Seed the shared blocks panel from a résumé's experience bullets. */
export function blocksFromResume(resume: ParsedResume): Block[] {
  return resume.experience.flatMap((e) =>
    e.points.map((p) => ({ id: newBlockId(), text: p, tags: [e.org] })),
  );
}
