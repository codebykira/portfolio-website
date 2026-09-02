import {
  MapPin,
  Globe,
  LinkedinLogo,
  XLogo,
  EnvelopeSimple,
  type Icon,
} from "@phosphor-icons/react";

/* ============================================================
   RESUME DATA — shared types + per-role variants.
   Two versions share one contact block and layout; only the
   framing of summary / experience / skills changes.
   ============================================================ */

export type ContactItem = { text: string; href?: string; icon: Icon };

export type Experience = {
  org: string;
  role: string;
  date: string;
  tagline: string;
  link?: { text: string; href: string };
  points: string[];
};

export type Education = {
  org: string;
  date: string;
  detail: string;
  points: string[];
};

export type Award = { title: string; date: string; detail: string };

export type SkillGroup = { group: string; items: string[] };

export type CustomSection = { title: string; entries: Experience[] };

export type Resume = {
  name: string;
  contact: ContactItem[];
  summary: string;
  experience: Experience[];
  education: Education[];
  awards: Award[];
  skills: SkillGroup[];
  sections?: CustomSection[];
};

const CONTACT: ContactItem[] = [
  { text: "Brooklyn, NY", icon: MapPin },
  { text: "kiracheung.space", href: "https://www.kiracheung.space/", icon: Globe },
  { text: "linkedin.com/in/kira-cheung", href: "https://www.linkedin.com/in/kira-cheung", icon: LinkedinLogo },
  { text: "x.com/CheungKira", href: "https://x.com/CheungKira", icon: XLogo },
  { text: "kiracheung0211@gmail.com", href: "mailto:kiracheung0211@gmail.com", icon: EnvelopeSimple },
];

const EDUCATION: Education[] = [
  {
    org: "Penn Engineering, University of Pennsylvania",
    date: "Sep 2022 – Dec 2024",
    detail: "Master of Computer and Information Technology, focus on Artificial Intelligence",
    points: [],
  },
  {
    org: "Rotman Commerce, University of Toronto",
    date: "Sep 2018 – Apr 2022",
    detail: "Bachelor of Commerce, Finance, minor in Economics (graduated w/ High Distinction)",
    points: [],
  },
];

const AWARDS: Award[] = [
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
    detail: "Recognized among 4,000+ students for exceptional peer leadership and community impact.",
  },
  {
    title: "President, Rotman Commerce Student Association",
    date: "2021",
    detail:
      "Elected from 700+ students to lead 9 portfolios of 50 students. Launched first student-led scholarship ($25K) recognizing exceptional international student leaders.",
  },
];

/* ------------------------------------------------------------
   PRODUCT — the default resume (product / growth framing)
   ------------------------------------------------------------ */
export const productResume: Resume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary:
    "I love to build, and I build with care. Ship production-quality from early prototypes, simplify as products mature, iterate live for retention and fit.",
  experience: [
    {
      org: "Atrios",
      role: "Head of Product, Tastemaker Experience",
      date: "Jan 2026 – Present",
      tagline: "B2B platform where sales teams turn warm introductions into qualified pipeline. Backed by a16z.",
      link: { text: "link", href: "https://atrios.com" },
      points: [
        "Killed the original product on arrival and rebuilt the platform from scratch. The old version forced a LinkedIn CSV upload across a two-day onboarding, then returned seven bad matches. I rebuilt it as a two-sided marketplace: companies on the homepage, AI-suggested intros alongside them, LinkedIn sync moved behind a paid-value moment. Grew it from 0 to 2,000 users and $0 to $1M ARR in five months.",
        "Cut onboarding from a two-day, multi-page flow to a single 20-second page, dropping abandonment from 95% to 9%. Chose Unipile for the LinkedIn integration to make it work without runaway infrastructure cost, and set the core model: browsing companies and making intros is free, AI recommendations require sync. The progressive gating drove the growth, not just a cleaner UX.",
        "Designed the two-sided incentive loop that makes the marketplace grow: tastemakers earn for sharing warm intros, their contacts earn for structured feedback on the company, and the company gets sales-cycle intelligence it can't get elsewhere. Every meeting turns into a conversion or an ICP signal, instead of going nowhere.",
        "Ran discovery with the sales teams who buy the product to decide what to build next, and defined the metrics that matter. Built the analytics infrastructure the team runs on, revisited monthly to keep everyone focused on what moves the business, not what's easiest to measure.",
      ],
    },
    {
      org: "Blind Hangouts",
      role: "Founder and CEO",
      date: "Jan 2025 – Jan 2026",
      tagline: "iOS app with an AI agent that plans your social life. Backed by Founders Inc.",
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
      link: {
        text: "link",
        href: "https://betakit.com/element-ai-co-founder-launches-waverly-to-fix-the-internet-by-changing-the-way-people-consume-content/",
      },
      points: [
        "Closed 10 enterprise partnerships at Startupfest as the founding team's GTM lead. Ran buyer discovery, turned their feedback into roadmap changes, and drove 10K+ signups by pitching and winning BBC and CBC coverage.",
        'Identified community builders as the segment that actually stuck through customer interviews, then rebuilt the product\'s information architecture around them. Replaced generic onboarding with a "seed your community" flow (pick a shared interest, invite 5 to 10 members), and shipped an AI matching layer that suggested new joiners based on each community\'s conversation patterns. Lifted activation 40%.',
        'Cut time-to-value from 14 days to 3 by reshaping how the ML team\'s recommendation model reached users. Replaced the overwhelming open feed with a daily curated card of 5 people, redefined "connection quality" as a two-way DM within 48 hours rather than a follow, and owned the experiment cadence that validated each model iteration. Drove Day-30 retention to 85%.',
      ],
    },
  ],
  education: EDUCATION,
  awards: AWARDS,
  skills: [
    { group: "AI/ML", items: ["Large Language Model APIs", "RAG systems", "Prompt Engineering", "Vector Databases", "Model Customization"] },
    { group: "Data & Analytics", items: ["Python", "SQL", "Pandas/NumPy", "Product Analytics (Mixpanel, Amplitude)", "A/B Testing", "Data Visualization"] },
    { group: "Development", items: ["React/JavaScript", "Swift", "Flutter", "PostgreSQL", "APIs", "Redis", "Web scraping", "FastAPI / Flask", "Docker", "Cloud", "CI/CD pipelines", "Webhooks"] },
    { group: "Product", items: ["Figma", "Framer", "GTM Planning", "Prototype Development", "User Research"] },
  ],
};

/* ------------------------------------------------------------
   DESIGN ENGINEER — same history, reframed around design + build
   craft: prototyping, interface implementation, motion, systems.
   ------------------------------------------------------------ */
export const designResume: Resume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary:
    "I design and build interfaces end-to-end, from Figma and motion prototypes to production React. I care about craft, feel, and the small details that make a product come alive.",
  experience: [
    {
      org: "Atrios",
      role: "Head of Product, Tastemaker Experience",
      date: "Jan 2026 – Present",
      tagline: "B2B platform where sales teams turn warm introductions into qualified pipeline. Backed by a16z.",
      link: { text: "link", href: "https://atrios.com" },
      points: [
        "Own the interface end-to-end: design flows in Figma, build them in React/Next.js, and ship to production. Rebuilt the core marketplace experience into one cohesive, polished system and took release cadence from monthly to daily by migrating off the AWS Lambda architecture that gated every deploy.",
        "Established the design language and component patterns the team builds on, so every new surface stays consistent and on-brand without slowing anyone down.",
        "Prototype interactions and micro-animations to pin down feel before writing production code, then implement them faithfully — motion, timing, responsive behavior, and the loading, empty, and error states most people skip.",
      ],
    },
    {
      org: "Blind Hangouts",
      role: "Founder and CEO",
      date: "Jan 2025 – Jan 2026",
      tagline: "iOS app with an AI agent that plans your social life. Backed by Founders Inc.",
      link: { text: "link", href: "https://www.kiracheung.space/blind-hangouts" },
      points: [
        "Designed and built the entire iOS app solo, from UX and visual design through SwiftUI implementation. Every screen, interaction, and animation shipped by one person, cutting social planning from days to minutes.",
        "Crafted the multi-user coordination flow: turned a messy group-planning problem into a single clear, delightful path with real-time state and thoughtful transitions, driven by inputs that blend natural language with contextual signals (location, weather, pricing, calendar).",
      ],
    },
    {
      org: "Waverly",
      role: "Product and Growth Lead, Founding Team Member",
      date: "Nov 2021 – Aug 2024",
      tagline:
        "Mobile social network for interest-based communities, with AI matching to the people you'd actually click with. Backed by Betaworks.",
      link: {
        text: "link",
        href: "https://betakit.com/element-ai-co-founder-launches-waverly-to-fix-the-internet-by-changing-the-way-people-consume-content/",
      },
      points: [
        'Designed and prototyped the onboarding and matching experience, then paired with engineering to ship it: rebuilt onboarding around a "seed your community" flow that landed builders straight into value and lifted activation 40%.',
        "Turned the ML team's recommendation model into a daily curated card of 5 people you might click with, replacing an overwhelming open feed and cutting time-to-value from 14 days to 3. Drove Day-30 retention to 85%.",
        'Ran the design iterations and experiments that defined "connection quality" as a two-way DM within 48 hours of a match, and shipped the interface changes that moved it.',
      ],
    },
  ],
  education: EDUCATION,
  awards: AWARDS,
  skills: [
    { group: "Design", items: ["Figma", "Framer", "Prototyping", "Interaction & Motion Design", "Design Systems", "User Research"] },
    { group: "Frontend", items: ["React / Next.js", "TypeScript", "SwiftUI", "Flutter", "Framer Motion", "Tailwind CSS", "HTML/CSS"] },
    { group: "Engineering", items: ["PostgreSQL", "REST APIs", "Redis", "FastAPI / Flask", "Docker", "CI/CD", "Webhooks"] },
    { group: "AI/ML", items: ["Large Language Model APIs", "RAG systems", "Prompt Engineering", "Vector Databases"] },
  ],
};

/* ------------------------------------------------------------
   AI DEPLOYMENT ENGINEER — same history, framed around building
   and deploying AI/LLM systems: infra, evals, pipelines, ownership.
   Tailored for an OpenAI-style deployment-engineer role.
   ------------------------------------------------------------ */
const DEPLOY_AWARDS: Award[] = [
  {
    title: "Winner, Y Combinator Hackathon",
    date: "2025",
    detail:
      "Built a voice AI agent (OpenAI Realtime API, Whisper, and function calling) serving as a daily work assistant, handling email replies, message responses, and appointment scheduling through natural conversation.",
  },
  {
    title: "Included VC Fellowship (<2% acceptance)",
    date: "2023",
    detail:
      "Built a 0-to-1 GPT-4 matching platform (embeddings, vector search, and prompt engineering) that lifted match accuracy 35% and validated PMF across 5 beta partnerships. Global program backed by BITKRAFT, Seedcamp, and HSBC Ventures.",
  },
];

export const deployResume: Resume = {
  name: "Kira Cheung",
  contact: CONTACT,
  summary:
    "I build and deploy AI products end-to-end, from LLM pipelines and evals to the infrastructure that ships them. I move fast, measure what matters, and turn models into products people actually use.",
  experience: [
    {
      org: "Atrios",
      role: "Head of Product",
      date: "Jan 2026 – Present",
      tagline: "B2B platform where sales teams turn warm intros into qualified pipeline. Backed by a16z.",
      link: { text: "link", href: "https://atrios.com" },
      points: [
        "Shipped an end-to-end rebuild on arrival. Replaced a broken LinkedIn-CSV matching flow with a marketplace surface: companies on the homepage, AI-suggested introductions backed by OpenAI's GPT-4.1, LinkedIn sync gated behind a paid-value moment. Took it from effectively 0 users and $0 ARR to 2,000 users and $1M ARR in five months.",
        "Migrated production infrastructure off AWS Lambda (100+ functions, no test coverage) to a cleaner backend. Unblocked daily deploys from a monthly cadence, added CI and test coverage from zero, and swapped the broken AWS SES email pipeline for Customer.io.",
        "Integrated Unipile as the LinkedIn sync provider to replace CSV upload, then designed a progressive-gating architecture where basic value (browse and intro) is free and API-cost-heavy AI recommendations require opt-in sync. Cut onboarding drop-off from 95% to 9% while keeping infrastructure costs bounded.",
      ],
    },
    {
      org: "Blind Hangouts",
      role: "Founder & Founding Engineer",
      date: "Jan 2025 – Jan 2026",
      tagline: "iOS app with an AI agent that plans your social life. Backed by Founders Inc.",
      link: { text: "link", href: "https://www.kiracheung.space/blind-hangouts" },
      points: [
        "Shipped the app end-to-end solo: native iOS in Swift, a Python/FastAPI backend, and the LLM orchestration layer, with an army of AI coding agents as my engineering team shipping features I reviewed. Grew to 1,200 users in one year.",
        "Built the recommendation system as an LLM pipeline: prompt engineering, retrieval-augmented generation (RAG) over each user's behavioral history, and vector search over venues and activities, with an eval framework I ran against a hand-labeled quality set on every model change. It returned grounded suggestions with reasoning attached, not black-box match scores.",
        "Engineered the multi-user coordination layer that resolved conflicting group preferences into a single booked plan, combining natural-language input, behavioral history, and contextual signals (location, weather, pricing, calendar) into one LLM-driven decision layer.",
      ],
    },
    {
      org: "Waverly",
      role: "Founding Team Member",
      date: "Nov 2021 – Aug 2024",
      tagline:
        "Mobile social network for interest-based communities, with AI matching to the people you'd actually click with. Backed by Betaworks.",
      link: {
        text: "link",
        href: "https://betakit.com/element-ai-co-founder-launches-waverly-to-fix-the-internet-by-changing-the-way-people-consume-content/",
      },
      points: [
        'Owned the evaluation framework and experiment cadence for the ML recommendation team. Rejected follows as the industry-standard vanity metric and redefined "connection quality" as a two-way DM within 48 hours of a match, a harder bar to clear but far more predictive of real value. Designed the A/B experiments that validated every model iteration against it, and shipped the daily curated card of 5 people that replaced the overwhelming open feed. Drove Day-30 retention to 85% and cut time-to-value from 14 days to 3.',
        'Partnered with the ML engineering team to ship an AI matching layer that suggested new joiners for each community from conversation-pattern signals, then rebuilt onboarding around the "community builder" persona from 30+ user interviews (pick a shared interest, invite 5 to 10 members). Lifted activation 40%.',
        "Closed 10 enterprise partnerships at Startupfest as the founding team's GTM lead. Ran technical discovery with enterprise buyers, drove 10K+ signups through BBC and CBC coverage, and shipped in every direction a founding team needs to.",
      ],
    },
  ],
  education: EDUCATION,
  awards: DEPLOY_AWARDS,
  skills: [
    { group: "AI/ML", items: ["Large Language Model APIs (OpenAI)", "RAG Systems", "Prompt Engineering", "Vector Databases", "Function Calling & Structured Outputs", "Model Customization", "Evals"] },
    { group: "Development", items: ["Python", "JavaScript/React", "Swift", "FastAPI/Flask", "PostgreSQL", "Redis", "Docker", "CI/CD"] },
    { group: "Data & Analytics", items: ["SQL", "Pandas/NumPy", "Product Analytics (Mixpanel, Amplitude)", "A/B Testing"] },
  ],
};
