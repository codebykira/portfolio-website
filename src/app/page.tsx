"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeskHero from "@/app/DeskHero";
import Navigation from "@/components/tab-scroller";
import Work from "@/app/Work";
import Projects from "@/app/Projects";
import ContactPage from "@/components/connect";
import Story from "@/app/Story";
import ClientOnly from "@/components/ClientOnly";
import SectionHeader from "../components/section-header";
import AnimatedContent from "../components/AnimatedContent";
import StickerPeel from "../components/StickerPeel";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showClickMe, setShowClickMe] = useState(false);

  useEffect(() => {
    const update = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, []);

  return (
    <main className="ds-page w-full mx-auto flex flex-col gap-6 pb-10 bg-[var(--ds-bg)]">
      <ClientOnly>
        <Navigation />
      </ClientOnly>
      <ClientOnly>
        <DeskHero />
      </ClientOnly>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 justify-center">

        {/* Blurb bridging the hero into the work — section-header font (Playfair).
            Only the text fades in on scroll; the sticker stays full-opacity. */}
        <div className="relative mx-auto w-full max-w-4xl flex justify-center pt-6 pb-16 md:pt-8 md:pb-24">
          <AnimatedContent
            distance={120}
            direction="vertical"
            duration={1.2}
            ease="easeOut"
            initialOpacity={0}
            animateOpacity
            threshold={0.2}
            delay={0.1}
          >
            <h2 className="max-w-3xl text-center text-3xl md:text-5xl font-bold tracking-tighter leading-[1.15] text-balance">
              Builds with care.{" "}
              <span className="text-white/40">
                In the pixels, the pauses, the parts no one asked about.
              </span>
            </h2>
          </AnimatedContent>
          {/* Draggable, peelable cat sticker tucked into the corner. */}
          <ClientOnly>
            <StickerPeel
              imageSrc="/cat-sticker.png"
              width={190}
              rotate={-14}
              shadowIntensity={0.4}
              className="right-0 top-16 md:-right-8 md:top-24"
            />
          </ClientOnly>
        </div>

        <SectionHeader title="Work" subtitle="Recent" />

        <Work
          onProjectEnter={() => setShowClickMe(true)}
          onProjectLeave={() => setShowClickMe(false)}
        />
        {/* <Writing /> */}
        <div className="pt-16 md:pt-24">
          <SectionHeader title="Projects" subtitle="Made for fun 🐈" />
        </div>

        <Projects />

        <div className="pt-16 md:pt-24">
          <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
        </div>
        <Story />
        <ContactPage />
      </div>

      {/* "click me" pill — replaces the cursor while hovering a project card */}
      <motion.div
        className="fixed top-0 left-0 z-50 flex items-center justify-center pointer-events-none rounded-xl border border-white bg-white/10 font-bold text-white backdrop-blur-md"
        animate={{
          opacity: showClickMe ? 1 : 0,
          scale: showClickMe ? 1 : 0.6,
          x: mousePosition.x - 50,
          y: mousePosition.y - 25,
          width: 100,
          height: 50,
          fontSize: "14px",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 700, mass: 0.5 }}
      >
        click me
      </motion.div>
    </main>
  );
}
