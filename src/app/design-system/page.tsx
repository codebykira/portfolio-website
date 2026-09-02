"use client";
import React from "react";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { ArrowLeft } from "lucide-react";
import { COLOR, TYPE, DIAGRAM, DIAGRAM_TYPE, EMPHASIS_WEIGHT } from "../atrios/tokens";
import { DIAGRAMS } from "../atrios/Diagrams";
import "../atrios/atrios.css";

/**
 * A rendered view of the tokens the essay is built from.
 *
 * Everything on this page reads from the same tokens.ts the essay does, so it
 * cannot drift: change a token and this page changes with it. That is the
 * point of it existing rather than being a written spec.
 */

const instrument = Instrument_Serif({ weight: "400", subsets: ["latin"] });
const burgues = localFont({ src: "../../../public/fonts/BurguesScript-Regular.otf", display: "swap" });

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <h2 className={`${TYPE.h2} ${instrument.className}`} style={{ color: COLOR.ink }}>
        {title}
      </h2>
      {note && (
        <p className={`max-w-2xl pt-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
          {note}
        </p>
      )}
      <div className="pt-6">{children}</div>
    </section>
  );
}

function Swatch({ name, value, note }: { name: string; value: string; note?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-14 w-14 shrink-0 rounded-lg border"
        style={{ background: value, borderColor: COLOR.slotBorder }}
      />
      <div className="min-w-0">
        <div style={{ color: COLOR.ink }}>{name}</div>
        <div className={TYPE.caption} style={{ color: COLOR.muted }}>
          {value}
        </div>
        {note && (
          <div className={TYPE.caption} style={{ color: COLOR.muted }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders a type token at its real size, with the class that produces it. */
function TypeRow({ token, cls, sample, style, className }: {
  token: string;
  cls: string;
  sample: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className="border-t py-5" style={{ borderColor: COLOR.rule }}>
      <div className={`pb-2 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
        {token} · {cls}
      </div>
      <div className={className} style={{ color: COLOR.ink, ...style }}>
        {sample}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div
      className={`atrios-page min-h-screen ${instrument.className}`}
      style={{ background: COLOR.paper }}
    >
      <div className="mx-auto max-w-3xl px-8 py-16">
        <h1 className={`${TYPE.title} ${burgues.className}`} style={{ color: COLOR.ink }}>
          Design system
        </h1>
        <p className={`pt-1 ${TYPE.meta}`} style={{ color: COLOR.muted }}>
          Tokens behind the Atrios essay
        </p>
        <p className={`max-w-2xl pt-6 ${TYPE.body}`} style={{ color: COLOR.body }}>
          Every value here is imported from the same file the essay uses, so this page cannot fall out
          of date. Change a token and both change together.
        </p>

        <Section
          title="Colour"
          note="Ink at three strengths carries the hierarchy: full for headings and emphasis, 86% for body, 55% for anything secondary."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Swatch name="paper" value={COLOR.paper} note="Page background" />
            <Swatch name="ink" value={COLOR.ink} note="Headings, emphasis" />
            <Swatch name="body" value={COLOR.body} note="Paragraphs" />
            <Swatch name="muted" value={COLOR.muted} note="Captions, meta, hints" />
            <Swatch name="rule" value={COLOR.rule} note="Hairlines" />
            <Swatch name="slotBorder" value={COLOR.slotBorder} note="Empty frames" />
          </div>
        </Section>

        <Section
          title="Diagram states"
          note="Three states do all the work: red is the cost, green is the path that replaced it, violet is the moment a friend becomes a tastemaker."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Swatch name="red / redFill" value={COLOR.red} note="The wait, the retry loop" />
            <Swatch name="green / greenFill" value={COLOR.green} note="The flow after" />
            <Swatch name="violet / violetFill" value={COLOR.violet} note="Becomes a tastemaker" />
            <Swatch name="amber / amberFill" value={COLOR.amber} note="The fast, gameable payout" />
            <Swatch name="neutralFill" value={COLOR.neutralFill} note="Unremarkable steps" />
            <Swatch name="diagramMuted" value={COLOR.diagramMuted} note="Strokes, sub-labels" />
          </div>
        </Section>

        <Section
          title="Type"
          note="Instrument Serif throughout, with Burgues Script reserved for the title and the initial capital of each heading. Body is 16px; everything else is measured against it."
        >
          <TypeRow
            token="title"
            cls={TYPE.title}
            sample="Atrios"
            className={`${TYPE.title} ${burgues.className}`}
          />
          <TypeRow token="h2" cls={TYPE.h2} sample="The product I inherited" className={TYPE.h2} />
          <TypeRow token="h3" cls={TYPE.h3} sample="What it cost" className={TYPE.h3} />
          <TypeRow
            token="emphasis"
            cls={`${TYPE.emphasis} · weight ${EMPHASIS_WEIGHT}`}
            sample="Gaming is not a character problem in your users."
            className={TYPE.emphasis}
            style={{ fontWeight: EMPHASIS_WEIGHT }}
          />
          <TypeRow
            token="body"
            cls={TYPE.body}
            sample="Anything you put in front of the first turn of the loop is a tax you charge people for a value they have not yet experienced."
            className={TYPE.body}
          />
          <TypeRow token="meta" cls={TYPE.meta} sample="2025 to present · Product, Design, Engineering" className={TYPE.meta} />
          <TypeRow token="caption" cls={TYPE.caption} sample="Figure 1 — Sign up, export contacts, wait, upload." className={TYPE.caption} />
        </Section>

        <Section
          title="Diagrams"
          note="Drawn in code with ballpoint primitives: corners overshoot, edges are traced twice where the hand pressed again, and stroke weight varies with pressure. All jitter is seeded, never random, so the server and the browser draw the identical line."
        >
          <div className="space-y-10">
            <DIAGRAMS.onboardingBefore />
            <DIAGRAMS.onboardingAfter />
          </div>
          <dl className={`grid grid-cols-2 gap-x-8 gap-y-2 pt-8 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
            {[
              ["pen width", DIAGRAM.penWidth],
              ["corner jitter", DIAGRAM.jitter],
              ["overshoot", DIAGRAM.overshoot],
              ["line bow", DIAGRAM.bow],
              ["arrowhead", DIAGRAM.arrowHead],
              ["heading", DIAGRAM_TYPE.heading],
              ["box title", DIAGRAM_TYPE.boxTitle],
              ["box sub", DIAGRAM_TYPE.boxSub],
              ["caption", DIAGRAM_TYPE.caption],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between border-t pt-2" style={{ borderColor: COLOR.rule }}>
                <dt>{k}</dt>
                <dd style={{ color: COLOR.ink }}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className={`pt-4 ${TYPE.caption}`} style={{ color: COLOR.muted }}>
            Diagram sizes are SVG user units on a 992-wide viewBox, not pixels — they scale with the
            column.
          </p>
        </Section>

        <Section title="Empty frames" note="Unfilled artwork slots are deliberately visible, so a gap reads as unfinished rather than as a design choice.">
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center"
            style={{ aspectRatio: "16 / 6", borderColor: COLOR.slotBorder, background: COLOR.slotFill }}
          >
            <span className={TYPE.slotLabel} style={{ color: COLOR.ink }}>
              The Inbox
            </span>
            <span className={`max-w-sm ${TYPE.caption}`} style={{ color: COLOR.muted }}>
              Full width, with real companies in it.
            </span>
          </div>
        </Section>

        <div className="flex gap-4 pt-10">
          <Link
            href="/atrios"
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-black/5"
            style={{ color: COLOR.muted }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the essay
          </Link>
        </div>
      </div>
    </div>
  );
}
