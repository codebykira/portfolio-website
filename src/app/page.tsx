"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeskHero from "@/app/DeskHero";
import Navigation from "@/components/tab-scroller";
import Work from "@/app/Work";
import ContactPage from "@/components/connect";
import Story from "@/app/Story";
import ClientOnly from "@/components/ClientOnly";
import SectionHeader from "../components/section-header";

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
      <div className="max-w-4xl mx-auto flex flex-col gap-6 justify-center">

        <SectionHeader title="Work" subtitle="Recent" />

        <Work
          onProjectEnter={() => setShowClickMe(true)}
          onProjectLeave={() => setShowClickMe(false)}
        />
        {/* <Writing /> */}
        <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
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
