"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import NotebookDraw from "@/components/NotebookDraw";

/**
 * Dark, full-viewport "desk scene" hero, arranged top-down like a real desk:
 *   - Lit lamp top-left (tap to toggle on/off; casts a warm glow)
 *   - Cat photo frame top, left of centre
 *   - Open notebook bottom-left
 *   - Laptop centred, with the sticky note on the screen's top-right
 *   - Kancho snack box on the right
 * Empty spots from the reference (pencil, headphones, mouse, app icons) are left out.
 * All assets are background-removed PNGs in /public/hero.
 */

const enter = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

export default function DeskHero() {
  const [lit, setLit] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [chip, setChip] = useState(false);
  const matRef = useRef<HTMLDivElement>(null);

  return (
    <>
    <section
      id="home"
      className="relative flex h-screen min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#0b0a0e] max-sm:h-auto max-sm:min-h-0 max-sm:py-16"
    >
      {/* Ambient dark base */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, #15131a 0%, #0a090d 70%)",
        }}
      />

      {/* ── Desk stage = the mat's footprint, centred in the viewport ── */}
      <div className="relative z-10 mx-auto aspect-[1582/670] w-[94%] max-w-[1550px]">
        {/* ── Leather desk mat: behind everything; fills the centred stage ── */}
        <motion.div
          ref={matRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-[1]"
        >
          <Image
            src="/hero/desk-mat.png"
            alt=""
            width={1582}
            height={670}
            priority
            className="h-full w-full object-cover drop-shadow-[0_50px_90px_rgba(0,0,0,0.7)]"
          />
        </motion.div>

        {/* ── Warm light pool cast by the lamp (only when lit) ── */}
        <motion.div
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen"
          style={{
            background:
              "radial-gradient(42% 58% at 14% 42%, rgba(255,168,92,0.6) 0%, rgba(255,140,70,0.28) 38%, rgba(255,120,55,0.07) 62%, rgba(0,0,0,0) 78%)",
          }}
        />

        {/* ── Lamp (top-left, tap to toggle) ── */}
        <motion.div
          variants={enter(0.1)}
          initial="hidden"
          animate="show"
          className="absolute z-30 w-[22%]"
          style={{ top: "-20%", left: "4%" }}
        >
          <motion.button
            type="button"
            onClick={() => setLit((v) => !v)}
            whileTap={{ scale: 0.96 }}
            aria-label={lit ? "Turn the lamp off" : "Turn the lamp on"}
            aria-pressed={lit}
            className="relative block w-full cursor-pointer focus:outline-none"
          >
            <Image
              src="/hero/lamp-off.png"
              alt="Desk lamp"
              width={588}
              height={681}
              priority
              className="h-auto w-full drop-shadow-[0_30px_40px_rgba(40,22,8,0.55)]"
            />
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: lit ? 1 : 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Image
                src="/hero/lamp.png"
                alt=""
                width={588}
                height={681}
                priority
                className="h-auto w-full drop-shadow-[0_30px_40px_rgba(40,22,8,0.55)]"
              />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* ── Cat photo frame (top, left of centre) ── */}
        <motion.div
          variants={enter(0.25)}
          initial="hidden"
          animate="show"
          className="absolute z-20 w-[10%]"
          style={{ top: "1%", left: "64%" }}
        >
          <Image
            src="/hero/frame.png"
            alt="Photo of me and my cat with a 'keep going' note"
            width={694}
            height={907}
            className="h-auto w-full drop-shadow-[28px_14px_26px_rgba(40,22,8,0.55)]"
          />
        </motion.div>

        {/* ── Notebook (bottom-left) — click to zoom in and draw on it ── */}
        <motion.div
          variants={enter(0.35)}
          initial="hidden"
          animate="show"
          className="absolute z-[15] w-[44%]"
          style={{ bottom: "6%", left: "10%" }}
        >
          {!drawing && (
            <motion.button
              layoutId="notebook-card"
              type="button"
              onClick={() => setDrawing(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              aria-label="Open the notebook to draw on it"
              className="relative block w-full cursor-pointer focus:outline-none"
            >
              <Image
                src="/hero/notebook.png"
                alt="Open notebook that says welcome"
                width={780}
                height={420}
                className="h-auto w-full drop-shadow-[-26px_18px_30px_rgba(40,22,8,0.5)]"
              />
              {drawingData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drawingData}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full select-none"
                />
              )}
            </motion.button>
          )}
        </motion.div>

        {/* ── Laptop (centre) with sticky note on the screen ── */}
        <motion.div
          variants={enter(0.2)}
          initial="hidden"
          animate="show"
          className="absolute z-20 w-[33%]"
          style={{ top: "6%", left: "30%" }}
        >
          <Image
            src="/hero/laptop.png"
            alt="Open laptop"
            width={809}
            height={644}
            priority
            className="h-auto w-full drop-shadow-[0_22px_34px_rgba(40,22,8,0.45)]"
          />
        </motion.div>

        {/* ── Sticky note — drag it anywhere on the desk mat ── */}
        <motion.div
          drag
          dragConstraints={matRef}
          dragElastic={0.1}
          dragMomentum={false}
          whileHover={{ scale: 1.04 }}
          whileDrag={{ scale: 1.08, rotate: 3 }}
          initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 6 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-30 w-[10%] cursor-grab touch-none active:cursor-grabbing"
          style={{ top: "2%", left: "55%" }}
        >
          <Image
            src="/hero/sticky.png"
            alt="Sticky note: ship the good stuff"
            width={240}
            height={236}
            draggable={false}
            className="pointer-events-none h-auto w-full drop-shadow-[0_12px_18px_rgba(40,22,8,0.45)]"
          />
        </motion.div>

        {/* ── Snack (right) — click to swap between Kancho and Turtle Chips ── */}
        <motion.button
          type="button"
          onClick={() => setChip((c) => !c)}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: chip ? 0 : 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          aria-label="Swap the snack"
          className="absolute z-20 block w-[23%] cursor-pointer focus:outline-none"
          style={{ top: "44%", right: "9%", rotate: "-3deg", pointerEvents: chip ? "none" : "auto" }}
        >
          <Image
            src="/hero/kancho-open.png"
            alt="Kancho choco biscuit snack, biscuits spilling out"
            width={842}
            height={500}
            className="h-auto w-full drop-shadow-[0_22px_30px_rgba(40,22,8,0.55)]"
          />
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setChip((c) => !c)}
          initial={{ opacity: 0 }}
          animate={{ opacity: chip ? 1 : 0, scale: chip ? 1 : 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          aria-label="Swap the snack"
          className="absolute z-20 block w-[15%] cursor-pointer focus:outline-none"
          style={{ top: "35%", right: "12%", rotate: "13deg", pointerEvents: chip ? "auto" : "none" }}
        >
          <Image
            src="/hero/turtle-chips.png"
            alt="Orion Turtle Chips, flamin' lime flavor"
            width={494}
            height={700}
            className="h-auto w-full drop-shadow-[16px_26px_30px_rgba(40,22,8,0.6)]"
          />
        </motion.button>
      </div>

      {/* Soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-[40]"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </section>

    <NotebookDraw
      open={drawing}
      onClose={() => setDrawing(false)}
      initialDrawing={drawingData}
      onSave={setDrawingData}
    />
    </>
  );
}
