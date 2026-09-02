/**
 * Design tokens for the Atrios essay.
 *
 * One source of truth for colour and type, consumed by both the page and the
 * diagrams. The page measures in CSS pixels; the diagrams measure in SVG user
 * units on a 992-wide viewBox, which scales to the column width. The two scales
 * are therefore kept separate rather than shared — an SVG "26" is not 26px on
 * screen, it is 26/992ths of the column.
 */

export const COLOR = {
  /** Page background. */
  paper: "#FBF4E4",
  /** Headings, emphasis, and anything that should read as full strength. */
  ink: "#3B3327",
  /** Body copy: ink at 86%, so paragraphs sit back from headings. */
  body: "rgba(59, 51, 39, 0.86)",
  /** Captions, hints, meta. */
  muted: "rgba(59, 51, 39, 0.55)",
  /** Hairlines and empty-slot borders. */
  rule: "rgba(59, 51, 39, 0.18)",
  slotBorder: "rgba(59, 51, 39, 0.30)",
  slotFill: "rgba(59, 51, 39, 0.035)",

  /** Diagram states. Red marks the cost, green the fixed path, violet the
   *  moment a friend becomes a tastemaker. */
  red: "#A8432C",
  redFill: "#F6E3DC",
  green: "#3F6B4F",
  greenFill: "#DFEBDF",
  violet: "#4B3F86",
  violetFill: "#E7E3F6",
  amber: "#C98A2E",
  amberFill: "#F6E4C8",
  neutralFill: "#F1E8D4",
  /** Before flows: grey, so the old product reads as the past next to the
   *  green after flows. */
  grey: "#6E675C",
  greyFill: "#E8E3D9",
  /** Diagram strokes and secondary labels. */
  diagramMuted: "#7A6E5C",
  /** Ballpoint ink: blue-black rather than the page's warm brown, because
   *  that is the colour a pen actually leaves on cream paper. */
  pen: "#2B3350",
} as const;

/** Page type scale, as Tailwind classes so line-height comes with the size. */
export const TYPE = {
  /** 18px. Instrument Serif runs light, so the body sits a step above the
   *  usual 16 to hold up at reading distance. */
  body: "text-lg leading-relaxed",
  /** Same size as body; the opening is set apart by ink, not scale. */
  lede: "text-lg leading-relaxed",
  /** 48/60px, Burgues Script. */
  title: "text-5xl leading-none sm:text-6xl",
  /** 30/36px. */
  h2: "text-3xl sm:text-4xl",
  /** 24px. */
  h3: "text-2xl",
  /** 20/24px, set at weight rather than with a rule. */
  emphasis: "text-xl leading-snug sm:text-2xl",
  /** 14px, letterspaced caps. */
  meta: "text-sm uppercase tracking-[0.14em]",
  /** 16px. Figure captions and slot hints. */
  caption: "text-base",
  /** 20px. The label inside an empty slot. */
  slotLabel: "text-xl",
} as const;

/** Weight for emphasis lines. Instrument Serif ships 400 only, so this is a
 *  synthesized bold — deliberate, and the reason emphasis also steps up in
 *  size rather than relying on weight alone. */
export const EMPHASIS_WEIGHT = 600;

/** Diagram type, in SVG user units on the 992-wide viewBox. */
export const DIAGRAM_TYPE = {
  heading: 24,
  boxTitle: 21,
  caption: 18,
  boxSub: 16,
} as const;

/** Diagram geometry, shared so the before and after flows stay comparable.
 *  The pen values below control how hand-drawn the strokes read. */
export const DIAGRAM = {
  strokeWidth: 2.4,
  boxStrokeWidth: 2.2,
  radius: 14,
  /** Nib width. Everything else scales off it. */
  penWidth: 2.1,
  /** How far a corner lands from where it was aimed. */
  jitter: 4,
  /** How far a stroke runs past the corner before the hand lifts. */
  overshoot: 5,
  /** How much a "straight" line bows off its own axis. */
  bow: 4,
  /** Length of each arrowhead wing. */
  arrowHead: 13,
} as const;
