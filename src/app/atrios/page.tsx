"use client";
import React from "react";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { ArrowLeft } from "lucide-react";
import { BLOCKS, type Block, type ImageSpec } from "./blocks";
import { DIAGRAMS, Annotation } from "./Diagrams";
import { COLOR, TYPE, EMPHASIS_WEIGHT } from "./tokens";
import "./atrios.css";

// Instrument Serif throughout the essay; Burgues Script only for initials.
const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
});

// Aspekta, the product's own sans, for the small tags under the logo.
const aspekta = localFont({
  src: "../../../public/fonts/AspektaVF.woff2",
  display: "swap",
});

// Burgues Script, used only for the initial capital of a title.
const burgues = localFont({
  src: "../../../public/fonts/BurguesScript-Regular.otf",
  display: "swap",
});

/** Sets a title's first character in Burgues Script, the rest in Playfair. */
function Initial({ text }: { text: string }) {
  return (
    <>
      <span className={burgues.className} style={{ fontSize: "1.7em", lineHeight: 0.7 }}>
        {text.charAt(0)}
      </span>
      {text.slice(1)}
    </>
  );
}


/** A diagram drawn in code, sitting directly on the page's paper. */
function Figure({ name, caption }: { name: keyof typeof DIAGRAMS; caption: string }) {
  const Drawing = DIAGRAMS[name];
  return (
    // Wider than the reading column, but never wider than the viewport minus
    // its gutters — otherwise the right-hand end of a flow is clipped.
    <figure className="relative left-1/2 my-14 w-[min(920px,calc(100vw-4rem))] -translate-x-1/2">
      <Drawing />
      {caption && (
        <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A screenshot, set in the wide figure column like the diagrams. */
function Shot({ src, alt, width, height, caption, size }: { src: string; alt: string; width: number; height: number; caption?: string; size?: "small" }) {
  const frame =
    size === "small"
      ? "mx-auto my-10 w-full max-w-md"
      : "relative left-1/2 my-14 w-[min(920px,calc(100vw-4rem))] -translate-x-1/2";
  return (
    <figure className={frame}>
      <div className="overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(90,70,40,0.18)]" style={{ borderColor: COLOR.rule }}>
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      </div>
      {caption && (
        <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** React does not always write the muted attribute into the DOM, and without
 *  it browsers refuse to autoplay. Setting the properties by hand and calling
 *  play() makes the loop reliable, and onEnded is a fallback for browsers that
 *  drop the loop flag. */
function LoopingVideo({ src, poster }: { src: string; poster: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    v.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onEnded={(e) => {
        const v = e.currentTarget;
        v.currentTime = 0;
        v.play().catch(() => {});
      }}
      className="h-full w-full object-cover"
    />
  );
}

/** A muted, looping screen recording with a handwritten note pointing at it. */
function Clip({ src, poster, width, height, note, caption }: { src: string; poster: string; width: number; height: number; note?: string; caption?: string }) {
  return (
    <figure className="relative left-1/2 my-14 w-[min(920px,calc(100vw-4rem))] -translate-x-1/2">
      {note && (
        <div className="mb-1 flex justify-end pr-6">
          <Annotation text={note} />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(90,70,40,0.18)]" style={{ borderColor: COLOR.rule, aspectRatio: `${width} / ${height}` }}>
        <LoopingVideo src={src} poster={poster} />
      </div>
      {caption && (
        <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A screenshot beside a diagram, vertically centred on each other. */
function ShotFigure({ image, figure, caption, stat, wide }: { image: ImageSpec; figure: keyof typeof DIAGRAMS; caption?: string; stat?: string; wide?: boolean }) {
  const Drawing = DIAGRAMS[figure];
  // Both diagrams render at the same scale (0.8px per SVG unit): the
  // two-column flow (632 units) gets 506px, the single column (300 units)
  // gets 240px, so headings, box text and notes match across figures.
  const cols = wide ? "sm:grid-cols-[45fr_55fr]" : "sm:grid-cols-[3fr_2fr]";
  return (
    <figure className="relative left-1/2 my-14 w-[min(920px,calc(100vw-4rem))] -translate-x-1/2">
      <div className={`grid items-center gap-8 ${cols}`}>
        <div>
          <div className="overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(90,70,40,0.18)]" style={{ borderColor: COLOR.rule }}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className="h-auto w-full" />
          </div>
          {stat && (
            <p className={`pt-3 text-center ${TYPE.body}`} style={{ color: COLOR.ink, fontWeight: EMPHASIS_WEIGHT }}>
              {stat}
            </p>
          )}
        </div>
        <div className={wide ? "w-full max-w-[506px] justify-self-center" : "w-full max-w-[240px] justify-self-center"}>
          <Drawing />
        </div>
      </div>
      {caption && (
        <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Two screenshots side by side, in the wide figure column. */
function ShotPair({ images, caption }: { images: [ImageSpec, ImageSpec]; caption?: string }) {
  return (
    <figure className="relative left-1/2 my-14 w-[min(920px,calc(100vw-4rem))] -translate-x-1/2">
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((img) => (
          <div key={img.src} className="overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(90,70,40,0.18)]" style={{ borderColor: COLOR.rule }}>
            <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="h-auto w-full" />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** An empty frame waiting for artwork. Deliberately visible, so an unfilled
 *  slot reads as unfinished rather than as a design choice. */
function Slot({ label, hint, ratio = "16 / 10" }: { label: string; hint: string; ratio?: string }) {
  return (
    <figure className="my-12">
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center"
        style={{ aspectRatio: ratio, borderColor: COLOR.slotBorder, background: COLOR.slotFill }}
      >
        <span className={TYPE.slotLabel} style={{ color: COLOR.ink }}>
          {label}
        </span>
        <span className={`max-w-sm ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {hint}
        </span>
      </div>
    </figure>
  );
}

/** Two frames side by side for a before/after pair. */
function SlotPair({ label, beforeHint, afterHint }: { label: string; beforeHint: string; afterHint: string }) {
  return (
    <figure className="my-12">
      <div className="grid gap-4 sm:grid-cols-2">
        {[beforeHint, afterHint].map((hint) => (
          <div
            key={hint}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 text-center"
            style={{ aspectRatio: "4 / 3", borderColor: COLOR.slotBorder, background: COLOR.slotFill }}
          >
            <span className="text-base" style={{ color: COLOR.ink }}>
              {hint}
            </span>
          </div>
        ))}
      </div>
      <figcaption className={`pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
        {label}
      </figcaption>
    </figure>
  );
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case "h2":
      return (
        <h2
          key={i}
          className={`pt-10 ${TYPE.h2} ${instrument.className}`}
          style={{ color: COLOR.ink }}
        >
          <Initial text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className={`pt-6 ${TYPE.h3} ${instrument.className}`} style={{ color: COLOR.ink }}>
          <Initial text={block.text} />
        </h3>
      );
    case "lede":
      // Same size as body copy; the opening is set apart by ink, not scale.
      return (
        <p key={i} className={TYPE.body} style={{ color: COLOR.ink }}>
          {block.text}
        </p>
      );
    case "p":
      return (
        <p key={i} className={TYPE.body} style={{ color: COLOR.body }}>
          {block.text}
        </p>
      );
    case "pull":
      // Emphasis carried by the handwriting face at weight, not by a rule.
      return (
        <p
          key={i}
          className={`my-7 ${TYPE.body}`}
          style={{ color: COLOR.ink, fontWeight: EMPHASIS_WEIGHT }}
        >
          {block.text}
        </p>
      );
    case "aside":
      return (
        <p key={i} className={`ml-auto max-w-sm ${TYPE.caption} leading-relaxed`} style={{ color: COLOR.muted }}>
          {block.text}
        </p>
      );
    case "stat":
      return (
        <p
          key={i}
          className={`mx-auto -mt-11 mb-10 max-w-xl text-center ${TYPE.body}`}
          style={{ color: COLOR.ink, fontWeight: EMPHASIS_WEIGHT }}
        >
          {block.text}
        </p>
      );
    case "rule":
      return <hr key={i} className="my-12 border-0 border-t" style={{ borderColor: COLOR.rule }} />;
    case "figure":
      return <Figure key={i} name={block.name} caption={block.caption} />;
    case "image":
      return <Shot key={i} {...block} />;
    case "video":
      return <Clip key={i} {...block} />;
    case "imageFigure":
      return <ShotFigure key={i} {...block} />;
    case "imagePair":
      return <ShotPair key={i} {...block} />;
    case "slot":
      return <Slot key={i} {...block} />;
    case "slotPair":
      return <SlotPair key={i} {...block} />;
  }
}

export default function AtriosPage() {
  return (
    <div
      className={`atrios-page relative min-h-screen ${instrument.className}`}
      style={{ backgroundColor: COLOR.paper }}
    >
      <div className="mx-auto max-w-3xl space-y-5 px-8 pb-16 pt-20">
        <Image
          src="/atrios-logo.png"
          alt="Atrios"
          width={146}
          height={49}
          priority
          className="h-9 w-auto object-contain"
        />
        <ul className={`flex flex-wrap gap-2 pb-6 pt-1 text-sm ${aspekta.className}`} aria-label="Role">
          {["2025 to present", "Founding team", "Head of Product"].map((tag) => (
            <li
              key={tag}
              className="rounded-md border px-2.5 py-1"
              style={{ borderColor: COLOR.rule, color: COLOR.muted, fontWeight: 450 }}
            >
              {tag}
            </li>
          ))}
        </ul>

        {BLOCKS.map(renderBlock)}

        {/* Still to write (the draft's [NEEDS YOU] notes, kept off the page):
            — The story: the first refusal is written. Name the others, and
              what each one was refusing.
            — Onboarding: the experiment log. What changed, what happened,
              whether it stayed, including the rollbacks.
            — Incentives: the CEO's actual objection, what he was protecting,
              and what finally moved him.
            — What changed: separate what you observed from what people told
              you, given they are polite to the person who designed it.
            — What I don't know: the failure condition, with a date, written
              now rather than after the data.
            — Speed: what caused the half-day deploy, what it is now, and what
              you stopped trying because of it. */}

        <div className="pb-8 pt-16 lg:pt-32">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-black/5"
            style={{ color: COLOR.muted }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
