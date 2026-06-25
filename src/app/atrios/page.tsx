"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

// Atrios palette (matches the invite page Grainient + cream/gold tokens)
const CREAM = "#FCF7E9";
const GOLD = "#C9A96E";

// Clean reveal for a dark background: each block fades up and brightens
// from faint cream to full cream as it scrolls into view.
const revealAnimation = {
  initial: { color: "rgba(252, 247, 233, 0.35)", opacity: 0, y: 14 },
  whileInView: { color: CREAM, opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.3, margin: "-15% 0px -15% 0px" },
};

export default function AtriosPage() {
  return (
    <div className={`atrios-page relative min-h-screen ${aspekta.className}`}>
      {/* Animated grainient background (Atrios invite colors), fixed behind content */}
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#05483A"
          color2="#0E2723"
          color3="#021714"
          timeSpeed={0.25}
          colorBalance={0.32}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
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
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="mb-12 overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <Image
              src="/atrios-companies.png"
              alt="The Atrios companies marketplace I designed, with a company card hover state"
              width={2400}
              height={1273}
              className="w-full h-auto"
            />
          </motion.div>

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
      <div className="max-w-3xl mx-auto px-8 lg:px-20 space-y-6 lg:space-y-4 my-20 ">

        {/* First Section - The starting point */}

        <motion.p {...revealAnimation}>
          I joined a product that almost nobody was using.
        </motion.p>
        <motion.p {...revealAnimation}>
          Five people. That was it. Five active users, ten thousand dollars in revenue, and an idea that hadn&apos;t found its shape yet.
        </motion.p>
        <motion.p {...revealAnimation}>
          Atrios is built on the oldest move in business: someone you trust says you should meet this person. A warm introduction. We have a network of well-connected people, tastemakers, who open their world and book real customers straight into a company&apos;s calendar. No cold outreach. Just trust, turned into a product.
        </motion.p>

        <motion.p {...revealAnimation}>
          The idea was right. The product wasn&apos;t. So I rebuilt all of it.
        </motion.p>
        <motion.p {...revealAnimation}>
          Within my first month, every screen, every flow, every email, gone and remade. To make it true to the one thing we were actually trying to do.
        </motion.p>

        {/* Second Section - The question */}

        <p className={`text-xl ${myeongjo.className}`} style={{ color: GOLD }}>
          {["What", "does", "someone", "need", "before", "they'll", "put", "their", "name", "on", "an", "introduction?"].map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3
              }}
              viewport={{ once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </p>

        <motion.p {...revealAnimation}>
          Because that&apos;s the quiet thing about this product. When a tastemaker makes an intro, they&apos;re not clicking a button. They&apos;re spending their reputation.
        </motion.p>
        <motion.p {...revealAnimation}>
          They&apos;re saying trust me to two people at once. If the product made that feel heavy, or confusing, or risky, they just wouldn&apos;t do it. And for a while, they weren&apos;t.
        </motion.p>

        {/* Third Section - The data */}

        <motion.p {...revealAnimation}>
          So I went looking for where we were losing them. I built the analytics from nothing, just so I could see.
        </motion.p>
        <motion.p {...revealAnimation}>
          And the screens showed me something quiet and sad: people would sync their whole network, get right up to the moment of value, and leave. They never saw what they&apos;d built. We were losing them at the door and calling it something else.
        </motion.p>

        {/* Fourth Section - The redesign */}

        <motion.p {...revealAnimation}>
          That changed how I designed everything after. I stopped thinking in features and started thinking about the person, alone with their screen, deciding in ten seconds whether to trust us.
        </motion.p>
        <motion.p {...revealAnimation}>
          Every screen had to earn that. If someone couldn&apos;t instantly see who they could help, what they&apos;d get, and why it mattered, it didn&apos;t matter how good it looked. It had failed.
        </motion.p>

        <motion.p {...revealAnimation}>
          I cut a lot. I rebuilt the intro flow until it felt less like a form and more like vouching for a friend. I rewrote emails word by word.
        </motion.p>
        <motion.p {...revealAnimation}>
          And I got the whole team to care about it the way I did, to argue over one sentence, to kill things that didn&apos;t work, to treat one user&apos;s experience like the whole thing depended on it. Because it did.
        </motion.p>

        {/* Fifth Section - The outcome */}

        <p className={`text-xl ${myeongjo.className}`} style={{ color: GOLD }}>
          {["Three", "months", "in,", "it", "worked."].map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3
              }}
              viewport={{ once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </p>

        <motion.p {...revealAnimation}>
          Ten thousand became one million in ARR. Five people became two thousand, all of them actively making real introductions, into real calendars, for real.
        </motion.p>
        <motion.p {...revealAnimation}>
          I designed every screen they touch. I built the systems under them. But what I&apos;m proudest of isn&apos;t any single thing I shipped.
        </motion.p>

        <motion.p {...revealAnimation}>
          I took something five people used, and made it something two thousand people trust.
        </motion.p>

        {/* Navigation back */}
        <div className="pt-16 lg:pt-40 pb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/10"
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
