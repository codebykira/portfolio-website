"use client";
import React from "react";
import { Shadows_Into_Light } from "next/font/google";
import { COLOR, DIAGRAM_TYPE } from "./tokens";
import { PenRect, PenArrow, PenLoop, PenDot, PenUnderline } from "./pen";

/**
 * The case-study diagrams, drawn in code with the ballpoint primitives in
 * pen.tsx rather than exported as images.
 *
 * Drawing them here keeps them sharp at any size, lets the palette follow the
 * page, and means the before and after flows can share geometry so they stay
 * comparable across sections.
 */

// Chart labels are handwritten, while the essay around them stays in
// Instrument Serif — the diagrams read as something sketched beside the text.
const hand = Shadows_Into_Light({ weight: "400", subsets: ["latin"] });

const PEN = COLOR.pen;
const MUTED = COLOR.diagramMuted;

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  className: `h-auto w-full ${hand.className}`,
  role: "img",
} as const;

type Step = {
  title: string;
  sub?: string;
  fill?: string;
  text?: string;
  /** Colour for the sub line; defaults to muted. */
  subText?: string;
  /** Underline the sub line, for the delays the reader should feel. */
  underline?: boolean;
  /** An icon drawn inside the box, top right. */
  icon?: string;
  /** Outline colour; defaults to pen ink. */
  stroke?: string;
};

function Box({ x, y, w, h, seed, step }: { x: number; y: number; w: number; h: number; seed: number; step: Step }) {
  return (
    <g>
      <PenRect x={x} y={y} w={w} h={h} seed={seed} fill={step.fill} color={step.stroke} />
      <text
        x={x + w / 2}
        y={step.sub ? y + h / 2 - 4 : y + h / 2 + 8}
        textAnchor="middle"
        fontSize={DIAGRAM_TYPE.boxTitle}
        fill={step.text ?? PEN}
      >
        {step.title}
      </text>
      {step.sub && (
        <text x={x + w / 2} y={y + h / 2 + 26} textAnchor="middle" fontSize={DIAGRAM_TYPE.boxSub} fill={step.subText ?? MUTED}>
          {step.sub}
        </text>
      )}
      {step.sub && step.underline && (
        <PenUnderline
          x1={x + w / 2 - step.sub.length * 3.6}
          x2={x + w / 2 + step.sub.length * 3.6}
          y={y + h / 2 + 32}
          seed={seed + 3}
          color={step.subText ?? step.text ?? PEN}
        />
      )}
      {step.icon && <image href={step.icon} x={x + w - 34} y={y + 8} width={24} height={24} opacity={0.85} />}
    </g>
  );
}

function Note({ x, y, children, anchor = "start" }: { x: number; y: number; children: string; anchor?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={DIAGRAM_TYPE.caption} fill={MUTED}>
      {children}
    </text>
  );
}

function Heading({ x, y, children, color = PEN }: { x: number; y: number; children: string; color?: string }) {
  return (
    <text x={x} y={y} fontSize={DIAGRAM_TYPE.heading} fill={color}>
      {children}
    </text>
  );
}

/** A row of boxes joined by arrows. Shared so every flow reads at one scale. */
function Row({
  steps,
  y,
  seed,
  // A four-box row has to fit the 992-unit viewBox: 4 boxes + 3 gaps + both
  // margins. 4(206) + 3(38) + 48 = 986. Overrun this and the last box is
  // clipped at the right edge.
  boxW = 206,
  gap = 38,
  left = 24,
  ink,
}: {
  steps: Step[];
  y: number;
  seed: number;
  boxW?: number;
  gap?: number;
  left?: number;
  /** Outline and arrow colour for the whole row. Before flows pass grey. */
  ink?: string;
}) {
  const xs = steps.map((_, i) => left + i * (boxW + gap));
  return (
    <g>
      {steps.map((s, i) => (
        <Box key={s.title} x={xs[i]} y={y} w={boxW} h={96} seed={seed + i * 7} step={{ stroke: ink, ...s }} />
      ))}
      {xs.slice(0, -1).map((x, i) => (
        <PenArrow key={x} x1={x + boxW + 8} y1={y + 48} x2={x + boxW + gap - 8} y2={y + 48} seed={seed + 100 + i} color={ink} />
      ))}
    </g>
  );
}

/** The same steps stacked vertically, for sitting beside a screenshot.
 *  Narrow viewBox so the boxes stay readable at half the column width. */
function Column({ heading, note, steps, ink, seed }: { heading: string; note: string; steps: Step[]; ink?: string; seed: number }) {
  const boxW = 272;
  const h = 72;
  const gap = 30;
  const left = 14;
  const top = 52;
  const height = top + steps.length * h + (steps.length - 1) * gap + 12;
  const mid = left + boxW / 2;
  return (
    <svg {...svgProps} viewBox={`0 0 300 ${height}`} aria-label={`${heading}: ${steps.map((s) => s.title).join(", ")}. ${note}`}>
      <Heading x={left} y={30} color={ink}>{heading}</Heading>
      <Note x={left + boxW} y={30} anchor="end">{note}</Note>
      {steps.map((step, i) => {
        const y = top + i * (h + gap);
        return (
          <g key={step.title}>
            <Box x={left} y={y} w={boxW} h={h} seed={seed + i * 7} step={{ stroke: ink, ...step }} />
            {i < steps.length - 1 && (
              <PenArrow x1={mid} y1={y + h + 6} x2={mid} y2={y + h + gap - 6} seed={seed + 100 + i} color={ink} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const ONBOARDING_BEFORE: Step[] = [
  { title: "Sign up", sub: "Name, role", fill: COLOR.greyFill, text: COLOR.grey },
  { title: "Export contacts", sub: "Request from LinkedIn", fill: COLOR.greyFill, text: COLOR.grey },
  { title: "The wait", sub: "2 to 10 hours", fill: COLOR.redFill, text: COLOR.red, subText: COLOR.red, underline: true },
  { title: "Upload the file", sub: "Then wait to hear back", fill: COLOR.greyFill, text: COLOR.grey },
];

/** The old intro flow as a U: down the left column, across, up the right,
 *  so the payout ends top right. Compact enough to sit beside a screenshot. */
export function IntroFlowCompact() {
  const boxW = 236;
  const h = 72;
  const gap = 30;
  const left = 14;
  const top = 52;
  const colGap = 52;
  const xA = left;
  const xB = left + boxW + colGap;
  const width = xB + boxW + 14;
  const rows = 4;
  const height = top + rows * h + (rows - 1) * gap + 12;
  const yAt = (i: number) => top + i * (h + gap);
  const ink = COLOR.grey;
  const down: Step[] = [
    { title: "Open the platform", sub: "Who could you introduce?", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "Email the person", sub: "CEO on cc, or it does not count", icon: "/icon-email.png", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We ask the vendor", sub: "A second thread, by hand", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "They book a time", sub: "By email, either way", fill: COLOR.greyFill, text: COLOR.grey },
  ];
  // Bottom to top on the right, so the reader follows the U.
  const up: Step[] = [
    { title: "We confirm with both", sub: "Did it actually happen?", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We invoice the vendor", sub: "This takes a while", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We pay you", sub: "2 to 3 months later", fill: COLOR.redFill, text: COLOR.red, subText: COLOR.red, underline: true, icon: "/icon-devastated.png" },
  ];
  return (
    <svg
      {...svgProps}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Before: open the platform, email the person with the CEO on cc, we ask the vendor, they book a time by email, we confirm with both, we invoice the vendor, and 2 to 3 months later we pay you"
    >
      <Heading x={left} y={30} color={ink}>Before</Heading>
      <Note x={xB + boxW} y={30} anchor="end">{"< 1% ever paid for an intro"}</Note>
      {down.map((step, i) => (
        <g key={step.title}>
          <Box x={xA} y={yAt(i)} w={boxW} h={h} seed={53 + i * 7} step={{ stroke: ink, ...step }} />
          {i < down.length - 1 && (
            <PenArrow x1={xA + boxW / 2} y1={yAt(i) + h + 6} x2={xA + boxW / 2} y2={yAt(i + 1) - 6} seed={153 + i} color={ink} />
          )}
        </g>
      ))}
      <PenArrow x1={xA + boxW + 8} y1={yAt(3) + h / 2} x2={xB - 8} y2={yAt(3) + h / 2} seed={161} color={ink} />
      {up.map((step, i) => {
        const row = 3 - i;
        return (
          <g key={step.title}>
            <Box x={xB} y={yAt(row)} w={boxW} h={h} seed={167 + i * 7} step={{ stroke: ink, ...step }} />
            {i < up.length - 1 && (
              <PenArrow x1={xB + boxW / 2} y1={yAt(row) - 6} x2={xB + boxW / 2} y2={yAt(row - 1) + h + 6} seed={181 + i} color={ink} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function OnboardingBeforeColumn() {
  return <Column heading="Before" note="5% completed" steps={ONBOARDING_BEFORE} ink={COLOR.grey} seed={11} />;
}

/** Figures 1 and 3 — the onboarding flows, at one scale so they compare. */
function Flow({ id, heading, note, steps, ink }: { id: number; heading: string; note: string; steps: Step[]; ink?: string }) {
  return (
    <svg {...svgProps} viewBox="0 0 992 168" aria-label={`${heading}: ${steps.map((s) => s.title).join(", ")}. ${note}`}>
      <Heading x={24} y={34} color={ink}>{heading}</Heading>
      <Note x={150} y={34}>{note}</Note>
      <Row steps={steps} y={54} seed={id} ink={ink} />
    </svg>
  );
}

export function OnboardingBefore() {
  return (
    <Flow
      id={11}
      heading="Before"
      note="5% completed"
      ink={COLOR.grey}
      steps={[
        { title: "Sign up", sub: "Name, role", fill: COLOR.greyFill, text: COLOR.grey },
        { title: "Export contacts", sub: "Request from LinkedIn", fill: COLOR.greyFill, text: COLOR.grey },
        { title: "The wait", sub: "2 to 10 hours", fill: COLOR.redFill, text: COLOR.red, subText: COLOR.red, underline: true },
        { title: "Upload the file", sub: "Then wait to hear back", fill: COLOR.greyFill, text: COLOR.grey },
      ]}
    />
  );
}

export function OnboardingAfter() {
  return (
    <Flow
      id={29}
      heading="After"
      note="70% completed"
      steps={[
        { title: "Paste URL", sub: "One field", fill: COLOR.greenFill, text: COLOR.green },
        { title: "Auto-filled", sub: "Via Unipile", fill: COLOR.greenFill, text: COLOR.green },
        { title: "In", sub: "Value first", fill: COLOR.greenFill, text: COLOR.green },
        { title: "Connect", sub: "Optional, later" },
      ]}
    />
  );
}

/** How an introduction used to travel, end to end.
 *
 *  Seven steps will not fit one row at a readable size, so the flow snakes:
 *  left to right across the top, down at the far end, then right to left along
 *  the bottom. The reversal puts the payout underneath the intro that earned
 *  it. Notes sit outside the boxes, where the mess actually lived. */
export function IntroFlow() {
  const boxW = 206;
  const gap = 38;
  const left = 24;
  const h = 92;
  const topY = 62;
  const bottomY = 240;
  const xs = [0, 1, 2, 3].map((i) => left + i * (boxW + gap));
  const mid = (x: number) => x + boxW / 2;

  const top: Step[] = [
    { title: "Open the platform", sub: "Who could you introduce?", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "Email the person", sub: "The one we recommend", icon: "/icon-email.png", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We ask the vendor", sub: "Do they want the lead?", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "They book a time", sub: "By email, either way", fill: COLOR.greyFill, text: COLOR.grey },
  ];
  const bottom: Step[] = [
    { title: "We confirm with both", sub: "Did it actually happen?", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We invoice the vendor", sub: "This takes a while", fill: COLOR.greyFill, text: COLOR.grey },
    { title: "We pay you", sub: "2 to 3 months later", fill: COLOR.redFill, text: COLOR.red, subText: COLOR.red, underline: true, icon: "/icon-devastated.png" },
  ];
  const bottomX = [xs[3], xs[2], xs[1]];

  return (
    <svg
      {...svgProps}
      viewBox="-8 0 1012 410"
      aria-label="How an introduction used to work: open the platform to see who you could introduce, email the person we recommend with the CEO on cc, we ask the vendor whether they want the lead, they book a time by email, we confirm with both that the meeting happened, we invoice the vendor, and two to three months later we pay you"
    >
      <Heading x={24} y={34} color={COLOR.grey}>Before</Heading>
      {top.map((step, i) => (
        <Box key={step.title} x={xs[i]} y={topY} w={boxW} h={h} seed={53 + i * 7} step={{ stroke: COLOR.grey, ...step }} />
      ))}
      {xs.slice(0, 3).map((x, i) => (
        <PenArrow key={x} x1={x + boxW + 8} y1={topY + h / 2} x2={x + boxW + gap - 8} y2={topY + h / 2} seed={153 + i} color={COLOR.grey} />
      ))}

      {/* The notes live outside the boxes, because so did the work. */}
      <Note x={mid(xs[1])} y={34} anchor="middle">CEO on cc, or it does not count</Note>
      <Note x={mid(xs[2])} y={44} anchor="middle">a second thread, by hand</Note>
      <Note x={mid(xs[3])} y={44} anchor="middle">and a third</Note>

      <PenArrow x1={mid(xs[3])} y1={topY + h + 8} x2={mid(xs[3])} y2={bottomY - 8} seed={161} color={COLOR.grey} />
      <Note x={mid(xs[3]) - 18} y={topY + h + 52} anchor="end">nothing is tracked</Note>

      {bottom.map((step, i) => (
        <Box key={step.title} x={bottomX[i]} y={bottomY} w={boxW} h={h} seed={167 + i * 7} step={{ stroke: COLOR.grey, ...step }} />
      ))}
      {bottomX.slice(0, 2).map((x, i) => (
        <PenArrow key={x} x1={x - 8} y1={bottomY + h / 2} x2={x - gap + 8} y2={bottomY + h / 2} seed={181 + i} color={COLOR.grey} />
      ))}

      <Note x={bottomX[0] + boxW} y={bottomY + h + 34} anchor="end">we chase both sides</Note>
      <Note x={mid(bottomX[1])} y={bottomY + h + 34} anchor="middle">invoices take weeks</Note>
    </svg>
  );
}

/** Figure 4 — the qualification retry loop that fed itself. */
export function RetryLoop() {
  const steps: Step[] = [
    { title: "Fails the check", sub: "Wrong answer given", fill: COLOR.redFill, text: COLOR.red },
    { title: "Retries", sub: "Just over half do", fill: COLOR.redFill, text: COLOR.red },
    { title: "Fails again", sub: "Most of them", fill: COLOR.redFill, text: COLOR.red },
  ];
  const boxW = 252;
  const left = 30;
  const gap = 88;
  const first = left + boxW / 2;
  const last = left + 2 * (boxW + gap) + boxW / 2;
  return (
    <svg {...svgProps} viewBox="0 0 992 292" aria-label="Before: a loop where a user fails the qualification check, retries, and fails again, each attempt revealing more about the expected answer">
      <Heading x={30} y={34} color={COLOR.grey}>Before</Heading>
      <Row steps={steps} y={54} seed={71} boxW={boxW} gap={gap} left={left} ink={COLOR.grey} />
      <PenLoop from={[last, 156]} to={[first, 160]} depth={192} seed={83} color={COLOR.grey} />
      <Note x={496} y={264} anchor="middle">Each attempt revealed more about the expected answer. Some reached 7.</Note>
    </svg>
  );
}

/** The qualification check after: one answer, checked, no way back round. */
export function QualificationAfter() {
  const steps: Step[] = [
    { title: "Answers once", sub: "No reroll", fill: COLOR.greenFill, text: COLOR.green },
    { title: "Checked", sub: "Against the open web", fill: COLOR.greenFill, text: COLOR.green },
    { title: "In, or out", sub: "An answer is an answer", fill: COLOR.greenFill, text: COLOR.green },
  ];
  const boxW = 252;
  const left = 30;
  const gap = 88;
  return (
    <svg {...svgProps} viewBox="0 0 992 168" aria-label="After: the user answers once, the answer is checked against the open web, and the result stands">
      <Heading x={30} y={34}>After</Heading>
      <Row steps={steps} y={54} seed={77} boxW={boxW} gap={gap} left={left} />
    </svg>
  );
}

/** Figure 5 — paying on the meeting against paying on closed won. */
export function RewardCycles() {
  return (
    <svg {...svgProps} viewBox="0 0 992 380" aria-label="Two timelines. Old: paid on the meeting, one payout to both the referrer and the friend who took it, fast and gameable. New: small payouts at the intro and the meeting, then a large payout months later when the friend becomes a customer">
      <Heading x={30} y={44}>Old: paid on the meeting</Heading>
      <PenArrow x1={40} y1={96} x2={950} y2={96} seed={91} />
      <PenDot cx={80} cy={96} radius={12} seed={92} fill={COLOR.paper} />
      <PenDot cx={230} cy={96} radius={16} seed={93} fill={COLOR.amberFill} />
      <Note x={80} y={136} anchor="middle">Intro</Note>
      <Note x={230} y={136} anchor="middle">Meeting, payout</Note>
      <Note x={230} y={158} anchor="middle">to referrer and friend</Note>
      <Note x={590} y={86} anchor="middle">Fast, and gameable. The meeting is the goal.</Note>

      <Heading x={30} y={230}>New: paid on closed won</Heading>
      <PenArrow x1={40} y1={282} x2={950} y2={282} seed={94} />
      <PenDot cx={80} cy={282} radius={9} seed={95} fill={COLOR.amberFill} />
      <PenDot cx={230} cy={282} radius={9} seed={96} fill={COLOR.amberFill} />
      <PenDot cx={800} cy={282} radius={18} seed={97} fill={COLOR.greenFill} />
      <Note x={80} y={322} anchor="middle">Intro</Note>
      <Note x={80} y={344} anchor="middle">small payout</Note>
      <Note x={230} y={322} anchor="middle">Meeting</Note>
      <Note x={230} y={344} anchor="middle">small payout</Note>
      <Note x={800} y={322} anchor="middle">Customer</Note>
      <Note x={800} y={344} anchor="middle">big payout</Note>
      <Note x={515} y={272} anchor="middle">Months. The customer is the goal.</Note>
    </svg>
  );
}

/** Figure 7 — the friend who received an intro becomes the one who makes it. */
export function FriendLoop() {
  const steps: Step[] = [
    { title: "Intro sent", sub: "By a tastemaker", fill: COLOR.greenFill, text: COLOR.green },
    { title: "Inbox", sub: "Learns the model", fill: COLOR.greenFill, text: COLOR.green },
    { title: "Books meeting", sub: "With a company", fill: COLOR.greenFill, text: COLOR.green },
    { title: "Becomes one", sub: "One tab away", fill: COLOR.violetFill, text: COLOR.violet },
  ];
  const boxW = 214;
  const left = 26;
  const gap = 30;
  const first = left + boxW / 2;
  const last = left + 3 * (boxW + gap) + boxW / 2;
  return (
    <svg {...svgProps} viewBox="0 0 992 270" aria-label="A loop: a tastemaker sends an intro, the friend lands in an inbox, books a meeting, and becomes a tastemaker themselves">
      <Row steps={steps} y={30} seed={41} boxW={boxW} gap={gap} left={left} />
      <PenLoop from={[last, 132]} to={[first, 136]} depth={196} seed={47} />
      <Note x={496} y={244} anchor="middle">The person who received an intro is the best candidate to make one.</Note>
    </svg>
  );
}

/** A handwritten note with an arrow, for pointing at a screenshot or recording
 *  from just outside its frame. Sized to sit above the top-right corner. */
export function Annotation({ text }: { text: string }) {
  const w = Math.max(240, text.length * 11 + 60);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={hand.className}
      viewBox={`0 0 ${w} 72`}
      width={w}
      height={72}
      role="img"
      aria-label={text}
    >
      <text x={w - 8} y={24} textAnchor="end" fontSize={22} fill={PEN}>
        {text}
      </text>
      <PenArrow x1={w - 40} y1={34} x2={w - 60} y2={68} seed={211} />
    </svg>
  );
}

export const DIAGRAMS = {
  onboardingBefore: OnboardingBefore,
  onboardingBeforeColumn: OnboardingBeforeColumn,
  onboardingAfter: OnboardingAfter,
  introFlow: IntroFlow,
  introFlowCompact: IntroFlowCompact,
  qualification: RetryLoop,
  qualificationAfter: QualificationAfter,
  incentives: RewardCycles,
  loop: FriendLoop,
} as const;

export type DiagramKey = keyof typeof DIAGRAMS;
