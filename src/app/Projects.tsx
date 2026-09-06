"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedContent from "../components/AnimatedContent";
import ClientOnly from "../components/ClientOnly";
import ChristmasCardEmbed from "../components/christmas-card-embed";
import ResumeBuilderEmbed from "../components/resume-builder-embed";

const CHRISTMAS_CARD_URL = "https://christmas-cards-web.vercel.app/";

/* ── Shelf card ───────────────────────────────────────────
 * One card on the shelf. Media fills it, the title and a line or two of copy
 * sit on a scrim along the bottom, and the whole thing lifts and tilts a hair
 * on hover. `tilt` is the resting rotation in degrees so the shelf reads as a
 * pile of toys rather than a grid of tiles. Reduced motion turns it all off.
 * ─────────────────────────────────────────────────────── */
interface ShelfCardProps {
  title: string;
  blurb: string[];
  tag: string;
  media: React.ReactNode;
  className?: string;
  tilt?: number;
  /** Internal route. Rendered with next/link. */
  href?: string;
  /** External URL. Opens in a new tab. */
  external?: string;
  /** Always show the scrim copy instead of revealing it on hover. */
  alwaysShowCopy?: boolean;
}

function ShelfCard({
  title,
  blurb,
  tag,
  media,
  className = "",
  tilt = 0,
  href,
  external,
  alwaysShowCopy = false,
}: ShelfCardProps) {
  const reduceMotion = useReducedMotion();
  const interactive = Boolean(href || external);

  const scrimBase =
    "absolute inset-0 flex flex-col justify-end gap-1.5 p-5 md:p-6 bg-gradient-to-t from-black/90 via-black/55 to-transparent transition-opacity duration-300 ease-out";
  const scrimVisibility = alwaysShowCopy
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

  const card = (
    <motion.div
      initial={false}
      animate={{ rotate: reduceMotion ? 0 : tilt }}
      whileHover={
        reduceMotion
          ? undefined
          : { rotate: 0, y: -6, scale: 1.015, transition: { type: "spring", stiffness: 260, damping: 22 } }
      }
      whileTap={reduceMotion || !interactive ? undefined : { scale: 0.99 }}
      className="group relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-shadow duration-300 ease-out hover:shadow-[0_18px_48px_rgba(0,0,0,0.5)]"
    >
      <div className="absolute inset-0 transition-[filter] duration-300 ease-out group-hover:brightness-[0.6]">
        {media}
      </div>

      <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/70 backdrop-blur-md">
        {tag}
      </span>

      {external && (
        <span
          aria-hidden
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-md transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9L9 3M4 3h5v5" />
          </svg>
        </span>
      )}

      <div className={`${scrimBase} ${scrimVisibility}`}>
        <h3 className="ds-title text-xl font-bold leading-tight !text-white md:text-2xl">{title}</h3>
        {blurb.map((line, i) => (
          <p key={i} className="max-w-prose text-sm leading-snug text-white/75">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );

  const wrapperClass = `block h-full w-full ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${wrapperClass} cursor-pointer`} aria-label={title}>
        {card}
      </Link>
    );
  }
  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        className={`${wrapperClass} cursor-pointer`}
        aria-label={`${title} (opens in a new tab)`}
      >
        {card}
      </a>
    );
  }
  return <div className={wrapperClass}>{card}</div>;
}

/* ── Dead Letters media ───────────────────────────────────
 * The flat sheet at rest, the crumpled ball on hover. Same crossfade the real
 * thing does, just in two frames.
 * ─────────────────────────────────────────────────────── */
function DeadLettersMedia() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#141118]">
      <div className="dot-grid-static absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(65,45,21,0.55),transparent_65%)]" />
      <Image
        src="/dead-letters/sheet.webp"
        alt="A blank sheet of paper waiting for the thing you haven't said"
        width={880}
        height={887}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="absolute inset-0 h-full w-full object-contain p-6 transition-[opacity,transform] duration-500 ease-out group-hover:scale-[0.96] group-hover:opacity-0 md:p-10"
      />
      <Image
        src="/dead-letters/ball.webp"
        alt=""
        aria-hidden
        width={880}
        height={887}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition-[opacity,transform] duration-500 ease-out scale-[1.04] group-hover:scale-100 group-hover:opacity-100 md:p-10"
      />
    </div>
  );
}

/* ── Pixel cat ────────────────────────────────────────────
 * The menu bar cat, drawn with box-shadow so it is one element per layer.
 * Blinks and flicks its tail on cheap CSS keyframes. No canvas, no images.
 * ─────────────────────────────────────────────────────── */
const CAT_ROWS = [
  "..X.....X...",
  "..XX...XX...",
  "..XXXXXXX...",
  ".XXXXXXXXX..",
  ".XXXXXXXXX..",
  "..XXXXXXX...",
  "..XXXXXXX...",
  "XXXXXXXXXX..",
  "XXXXXXXXXX..",
  ".XX.XXX.XX..",
];
const CAT_EYES = ["...X...X...."];
const EYE_ROW = 4;

function shadowsFor(rows: string[], px: number, rowOffset = 0, color = "#f3e6c4"): string {
  const out: string[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "X") out.push(`${x * px}px ${(y + rowOffset) * px}px 0 0 ${color}`);
    }
  });
  return out.join(", ");
}

function PixelCat({ px = 6 }: { px?: number }) {
  const body = shadowsFor(CAT_ROWS, px);
  const eyes = shadowsFor(CAT_EYES, px, EYE_ROW, "#0b0a0e");
  const w = 12 * px;
  const h = CAT_ROWS.length * px;
  return (
    <div className="relative" style={{ width: w + px * 3, height: h }} aria-hidden>
      <div className="absolute left-0 top-0" style={{ width: px, height: px, boxShadow: body }} />
      <div className="pixel-cat-eyes absolute left-0 top-0" style={{ width: px, height: px, boxShadow: eyes }} />
      <div
        className="pixel-cat-tail absolute"
        style={{
          left: w - px,
          top: h - px * 4,
          width: px,
          height: px,
          background: "#f3e6c4",
          boxShadow: `${px}px ${-px}px 0 0 #f3e6c4, ${px * 2}px ${-px * 2}px 0 0 #f3e6c4, ${px * 2}px ${-px * 3}px 0 0 #f3e6c4`,
          transformOrigin: `0 ${px}px`,
        }}
      />
    </div>
  );
}

function MenuBarCatMedia() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#121016]">
      <style>{`
        @keyframes pixel-cat-blink { 0%, 92%, 100% { opacity: 1; } 94%, 98% { opacity: 0; } }
        @keyframes pixel-cat-tail { 0%, 70%, 100% { transform: rotate(0deg); } 78% { transform: rotate(-22deg); } 86% { transform: rotate(10deg); } }
        @keyframes pixel-cat-dot { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        .pixel-cat-eyes { animation: pixel-cat-blink 4.3s steps(1) infinite; }
        .pixel-cat-tail { animation: pixel-cat-tail 3.1s ease-in-out infinite; }
        .pixel-cat-dot { animation: pixel-cat-dot 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pixel-cat-eyes, .pixel-cat-tail, .pixel-cat-dot { animation: none; }
        }
      `}</style>

      {/* a fake macOS menu bar */}
      <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 text-[11px] text-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80"></span>
          <span className="font-semibold text-white/80">Terminal</span>
          <span className="hidden sm:inline">File</span>
          <span className="hidden sm:inline">Edit</span>
          <span className="hidden sm:inline">View</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-1.5 py-0.5">
            <span className="pixel-cat-dot inline-block h-1.5 w-1.5 rounded-full bg-[#7ee787]" />
            <PixelCat px={2} />
          </span>
          <span className="hidden sm:inline">Tue 4:12 PM</span>
        </div>
      </div>

      {/* the cat, big, sitting on a little log line */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pt-9">
        <div className="scale-100 sm:scale-110">
          <PixelCat px={7} />
        </div>
        <div className="flex flex-col items-center gap-1 font-mono text-[11px] text-white/45">
          <span>~/.cat-state/events.jsonl</span>
          <span className="text-white/60">
            <span className="text-[#7ee787]">run finished</span> · feature/shelf · 2m 14s
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Scatter ──────────────────────────────────────────────
 * The cards are not on a grid. On desktop each one gets a spot on a canvas
 * (percent left / top, percent width, fixed height), a resting tilt, and a
 * slow idle drift so the whole thing reads as things left on a table rather
 * than tiles in a box. Edges overlap a little on purpose. On mobile it is a
 * single column with the tilts kept, so it still feels loose.
 * ─────────────────────────────────────────────────────── */
interface Spot {
  left: number; // % of canvas width
  top: number; // px from canvas top
  width: number; // % of canvas width
  height: number; // px
  tilt: number; // deg at rest
  drift: number; // px of vertical idle float
  duration: number; // s per float cycle
  delay: number; // s
  z: number;
}

function Floating({ spot, children }: { spot: Spot; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="md:absolute"
      style={{
        left: `${spot.left}%`,
        top: spot.top,
        width: `${spot.width}%`,
        height: spot.height,
        zIndex: spot.z,
      }}
      animate={reduceMotion ? undefined : { y: [0, -spot.drift, 0] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: spot.duration, delay: spot.delay, repeat: Infinity, ease: "easeInOut" }
      }
      whileHover={{ zIndex: 50 }}
    >
      {children}
    </motion.div>
  );
}

const CANVAS_HEIGHT = 600;

/* Percentages are of the full viewport width, not the content column: the
   canvas breaks out of the page's max-width so cards can sit loose across
   the whole screen. Small on purpose: these are toys, not the main work. */
const SPOTS: Record<string, Spot> = {
  deadLetters: { left: 4, top: 40, width: 28, height: 340, tilt: -2.2, drift: 10, duration: 7.5, delay: 0, z: 10 },
  cat: { left: 38, top: 0, width: 22, height: 250, tilt: 2.6, drift: 8, duration: 6.2, delay: 1.1, z: 20 },
  resume: { left: 64, top: 60, width: 26, height: 260, tilt: -1.8, drift: 7, duration: 6.9, delay: 1.7, z: 20 },
  christmas: { left: 30, top: 320, width: 24, height: 240, tilt: 1.4, drift: 9, duration: 8.1, delay: 0.6, z: 30 },
};

export default function Projects() {
  return (
    <div id="projects" className="w-full flex flex-col items-center pt-6">
      {/* Full-bleed: escape the page's max-w-7xl column so the scatter can use
          the whole viewport. overflow-x-clip stops the poked-out cards from
          adding a horizontal scrollbar while leaving vertical lifts unclipped. */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip px-4 md:px-0">
        <AnimatedContent
          direction="vertical"
          reverse
          distance={60}
          duration={0.9}
          initialOpacity={0}
          scale={1}
          threshold={0.1}
          delay={0.1}
        >
          <div
            className="scatter relative flex flex-col gap-6 md:block md:h-[var(--canvas-h)]"
            style={{ ["--canvas-h" as string]: `${CANVAS_HEIGHT}px` }}
          >
            <style>{`
              @media (max-width: 767px) {
                .scatter > * { position: relative !important; left: auto !important; top: auto !important; width: 100% !important; }
                .scatter > *:nth-child(1) { height: 48vh !important; min-height: 18rem; }
                .scatter > *:nth-child(n+2) { height: 34vh !important; min-height: 13rem; }
              }
            `}</style>

            <Floating spot={SPOTS.deadLetters}>
              <ShelfCard
                href="/dead-letters"
                title="Dead Letters"
                tag="web · webcam"
                tilt={SPOTS.deadLetters.tilt}
                media={<DeadLettersMedia />}
                blurb={[
                  "An anonymous note exchange, one in and one out. You type the thing you haven't said onto real paper, crumple it onto the table, and uncrumple a stranger's in return.",
                  "Nothing is stored, nothing is signed. The paper is real chroma-keyed footage. Squeeze your hand at the webcam to crumple it.",
                ]}
              />
            </Floating>

            <Floating spot={SPOTS.cat}>
              <ShelfCard
                title="Menu Bar Cat"
                tag="macOS app"
                tilt={SPOTS.cat.tilt}
                alwaysShowCopy
                media={<MenuBarCatMedia />}
                blurb={[
                  "A SwiftUI menu bar app. The pixel cat mirrors what my Claude Code agents are doing across git worktrees. When a run finishes, the cat tells you, like a pet getting your attention instead of a notification you dismiss.",
                ]}
              />
            </Floating>

            <Floating spot={SPOTS.christmas}>
              <ShelfCard
                external={CHRISTMAS_CARD_URL}
                title="Christmas Card"
                tag="web · 3d"
                tilt={SPOTS.christmas.tilt}
                media={
                  <ClientOnly fallback={<div className="h-full w-full bg-black" />}>
                    <ChristmasCardEmbed />
                  </ClientOnly>
                }
                blurb={[
                  "An interactive 3D card you personalize with a message and photos, then share as a link.",
                ]}
              />
            </Floating>

            <Floating spot={SPOTS.resume}>
              <ShelfCard
                href="/resume"
                title="Résumé Builder"
                tag="web · tool"
                tilt={SPOTS.resume.tilt}
                media={
                  <ClientOnly fallback={<div className="h-full w-full bg-[#EDEFF3]" />}>
                    <ResumeBuilderEmbed />
                  </ClientOnly>
                }
                blurb={[
                  "Drop in any résumé, PDF or DOCX. It gets parsed and re-rendered in a clean ATS-friendly template in seconds.",
                ]}
              />
            </Floating>
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
