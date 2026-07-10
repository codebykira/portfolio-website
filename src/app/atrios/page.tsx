"use client";
import React from "react";
import Image from "next/image";
import { Nanum_Myeongjo } from "next/font/google";
import localFont from "next/font/local";
import { ArrowLeft } from "lucide-react";
import Grainient from "../../components/grainient/Grainient";
import "./atrios.css";

// Atrios brand fonts: Myeongjo (serif) for display, Aspekta (sans) for body.
const myeongjo = Nanum_Myeongjo({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const aspekta = localFont({
  src: "../../../public/fonts/AspektaVF.woff2",
  display: "swap",
});

// Atrios palette (matches the invite page Grainient + cream tokens)
const CREAM = "#FCF7E9";

export default function AtriosPage() {
  return (
    <div className={`atrios-page relative min-h-screen ${aspekta.className}`}>
      {/* Static grainient background (Atrios invite colors), fixed behind content */}
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#05483A"
          color2="#0E2723"
          color3="#021714"
          timeSpeed={0}
          colorBalance={0.32}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={0}
        />
      </div>

      {/* Header Section */}
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-8">
          {/* Logo top-left (matches /blind-hangouts) */}
          <div className="flex items-center mb-12">
            <Image
              src="/atrios-logo-light.png"
              alt="Atrios"
              width={146}
              height={49}
              priority
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Product screenshot — above the title */}
          <div className="mb-12 overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <Image
              src="/atrios-companies.png"
              alt="The Atrios companies marketplace I designed, with a company card hover state"
              width={2400}
              height={1273}
              className="w-full h-auto"
            />
          </div>

          {/* Hero Content */}
          <div className="text-center">
            <h2
              className={`text-3xl font-bold ${myeongjo.className}`}
              style={{ color: CREAM }}
            >
              Turning trust into a product.
            </h2>
            <p style={{ color: "rgba(252, 247, 233, 0.7)" }}>
              Warm introductions, booked straight into a company&apos;s calendar.
            </p>
            <p style={{ color: "rgba(252, 247, 233, 0.7)" }}>
              No cold outreach. Just trust, made real.
            </p>
          </div>

        </div>
      </div>

      {/* Content Sections */}
      <div
        className="max-w-3xl mx-auto px-8 lg:px-20 space-y-6 lg:space-y-4 my-20 "
        style={{ color: CREAM }}
      >

        {/* 1 — What I inherited */}

        <p>I joined a product that almost nobody was using.</p>
        <p>
          Five people. Ten thousand dollars in revenue. A right idea that hadn&apos;t found its shape yet.
        </p>
        <p>
          Atrios is built on the oldest move in business: someone you trust says you should meet this person. A warm introduction. We had a network of well-connected people — tastemakers — who could open their world, introducing friends to products they actually needed, and turning each intro into a booked meeting on a company&apos;s calendar. No cold outreach. Just trust, turned into a product.
        </p>

        {/* 2 — Founding ownership */}

        <p>
          The idea was right. The product wasn&apos;t. I took the whole thing, and rebuilt it.
        </p>
        <p>
          Within a month, every screen, every flow, every email was gone and remade — until the product told the truth about the one thing we were actually trying to do.
        </p>

        {/* 3 — The core product question */}

        <p>
          What does someone need before they&apos;ll put their name on an introduction?
        </p>

        <p>
          Because that&apos;s the quiet thing about this product. When a tastemaker makes an intro, they&apos;re not clicking a button. They&apos;re spending their reputation. They&apos;re saying trust me to two people at once. If the product made that feel heavy, or confusing, or risky, they just wouldn&apos;t do it. And for a while, they weren&apos;t.
        </p>

        {/* 4 — Diagnosis: built the data, found the truth */}

        <p>
          So I built our analytics from nothing. Instrumented every step. And the funnel showed me something quiet and sad: one in a hundred people who signed up ever made an introduction. We were losing them at the door and calling it something else.
        </p>

        {/* 5 — The reframe: design for the ten-second trust decision */}

        <p>
          That changed how I designed everything after. I stopped thinking in features and started thinking about one person, alone with their screen, deciding in ten seconds whether to trust us. Every screen had to earn that. If someone couldn&apos;t instantly see who they could help, what they&apos;d get, and why it mattered, it had failed.
        </p>

        {/* 6 — The cut */}

        <p>So I cut.</p>

        <p>
          My CEO&apos;s bet had been to sync every tastemaker&apos;s LinkedIn connections into our product, so we could recommend exactly who to intro. It made sense on paper. In practice, LinkedIn makes you request your connection list as a CSV that takes a full day to arrive — and then you re-upload it to us. We were asking people to wait 24 hours before they could see what the product even did. That was the door. That was where we were losing them.
        </p>
        <p>
          I killed the whole flow. In its place, one question: which of your close friends would be a great fit for the companies we&apos;re introducing? No sync. No CSV. No wait. Just the question the product was really about.
        </p>

        {/* 7 — Craft + leadership */}

        <p>
          I rewrote the emails word by word. I built the systems underneath so the whole thing held together. And I got the team to care about it the way I did — we spent a full afternoon arguing over one line in the invite email. Conversions doubled the week we shipped the new one.
        </p>

        {/* 8 — The outcome */}

        <p>Three months in, it worked.</p>

        <p>
          Ten thousand became one million in ARR. Five people became two thousand — all of them actively making real introductions, into real calendars, for real.
        </p>
        <p>
          I designed every screen they touch. I built the systems under them. But what I&apos;m proudest of isn&apos;t any single thing I shipped.
        </p>

        <p>
          I took something five people used, and made it something two thousand people trust.
        </p>

        {/* Navigation back */}
        <div className="pt-16 lg:pt-40 pb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10"
            style={{ color: "rgba(252, 247, 233, 0.6)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
