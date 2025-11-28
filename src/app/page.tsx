"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroLanyard from "@/components/HeroLanyard";
import Navigation from "@/components/tab-scroller";
import Work from "@/app/Work";
import ContactPage from "@/components/connect";
import Story from "@/app/Story";
import ClientOnly from "@/components/ClientOnly";
import SectionHeader from "../components/section-header";

export default function Home() {
  const [cursorText, setCursorText] = useState("");
  const [cursorVariant, setCursorVariant] = useState("default");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", updateMousePosition);
    
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const spring = {
    type: "tween" as const,
    duration: 0,
  };

  const variants = {
    default: {
      opacity: 1,
      height: 20,
      width: 20,
      fontSize: "16px",
      backgroundColor: "#f97316",
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
    },
    project: {
      opacity: 1,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      color: "#f97316",
      height: 50,
      width: 100,
      fontSize: "14px",
      x: mousePosition.x - 50,
      y: mousePosition.y - 25,
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      border: "1px solid #f97316",
    }
  };

  const handleProjectEnter = () => {
    setCursorText("click me");
    setCursorVariant("project");
  };

  const handleProjectLeave = () => {
    setCursorText("");
    setCursorVariant("default");
  };

  const handleRopeEnter = () => {
    setCursorText("click me");
    setCursorVariant("dragme");
  };

  const handleRopeLeave = () => {
    setCursorText("");
    setCursorVariant("default");
  };

  return (
    <main className="w-full mx-auto flex flex-col gap-6 pb-10">
      <ClientOnly>
        <Navigation />
      </ClientOnly>
      <div id="home">
        <ClientOnly>
          <HeroLanyard 
            onRopeEnter={handleRopeEnter}
            onRopeLeave={handleRopeLeave}
          />
        </ClientOnly>
      </div>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 justify-center">

        <SectionHeader title="Work" subtitle="Recent" />

        <Work 
          onProjectEnter={handleProjectEnter}
          onProjectLeave={handleProjectLeave}
        />
        {/* <Writing /> */}
        <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
        <Story />
        <ContactPage />
      </div>

      {/* Global Custom Cursor */}
      <motion.div
        variants={variants}
        className="fixed top-0 left-0 z-50 flex items-center justify-center pointer-events-none rounded-full text-white font-bold"
        animate={cursorVariant}
        transition={spring}
      >
        <span className="text-center">{cursorText}</span>
      </motion.div>
    </main>
  );
}
