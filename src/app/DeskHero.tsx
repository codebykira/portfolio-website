"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import NotebookDraw from "@/components/NotebookDraw";
import SpotifyPlayer, { type SpotifyPlayerHandle } from "@/components/SpotifyPlayer";
import { playKeyboardSound } from "@/lib/keyboardSound";

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

// Every desk item shares this one delay so they all enter together,
// just after the mat has faded in.
const ENTER_DELAY = 0.15;

const enter = (delay: number = ENTER_DELAY): Variants => ({
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

// Shared hover effect for every desk item: an immediate, snappy grow.
const HOVER = { scale: 1.08, transition: { duration: 0.1, ease: "easeOut" as const } };

// Snacks the user can cycle through by clicking (each click → next one).
const SNACKS = [
  {
    src: "/hero/kancho-open.png",
    alt: "Kancho choco biscuit snack, biscuits spilling out",
    width: 842,
    height: 500,
    style: { width: "16%", top: "44%", right: "22%", rotate: "-3deg" },
  },
  {
    src: "/hero/turtle-chips-v2.png",
    alt: "Orion Turtle Chips, flamin' lime flavor",
    width: 649,
    height: 927,
    style: { width: "10%", top: "36%", right: "25%", rotate: "13deg" },
  },
  {
    src: "/hero/cheetos-v2.png",
    alt: "Cheetos Flamin' Hot Crunchy",
    width: 650,
    height: 935,
    style: { width: "9.9%", top: "36%", right: "25%", rotate: "22deg" },
  },
] as const;

export default function DeskHero() {
  const [lit, setLit] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [snackIdx, setSnackIdx] = useState(0);
  const [airpodsOpen, setAirpodsOpen] = useState(false);
  const matRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SpotifyPlayerHandle>(null);
  const playlistId = "29hKafNXqqmRYjLYSJwR3n";

  const toggleAirpods = () => {
    const next = !airpodsOpen;
    setAirpodsOpen(next);
    // Call play/pause synchronously within the click so autoplay isn't blocked.
    if (next) playerRef.current?.play();
    else playerRef.current?.pause();
  };

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
      <div className="relative z-10 mx-auto aspect-[1583/675] w-[94%] max-w-[1550px]">
        {/* ── Leather desk mat: behind everything; fills the centred stage ── */}
        <motion.div
          ref={matRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-[1]"
        >
          <Image
            src="/hero/desk-mat-v3.png"
            alt=""
            width={1583}
            height={675}
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
          variants={enter()}
          initial="hidden"
          animate="show"
          className="absolute z-30 w-[22%]"
          style={{ top: "-20%", left: "4%" }}
        >
          <motion.button
            type="button"
            onClick={() => setLit((v) => !v)}
            whileHover={HOVER}
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

        {/* ── Social mugs, scattered on the right (LinkedIn & X link out) ── */}
        {[
          {
            src: "/hero/mug-linkedin.png",
            alt: "LinkedIn-branded coffee mug",
            width: 817,
            height: 740,
            href: "https://www.linkedin.com/in/kira-cheung/",
            aria: "Visit my LinkedIn profile",
            style: { width: "9%", top: "5%", right: "15%", rotate: "-7deg" },
          },
          {
            src: "/hero/mug-x-v2.png",
            alt: "X-branded coffee mug",
            width: 832,
            height: 761,
            href: "https://x.com/CheungKira",
            aria: "Visit my X profile",
            style: { width: "9.5%", top: "1%", right: "2%", rotate: "8deg" },
          },
          {
            src: "/hero/mug-instagram-v3.png",
            alt: "Instagram-branded coffee mug",
            width: 797,
            height: 721,
            href: "https://www.instagram.com/kkiracheungg/",
            aria: "Visit my Instagram profile",
            style: { width: "8.5%", top: "21%", right: "8%", rotate: "-3deg" },
          },
        ].map((mug, i) => {
          const img = (
            <Image
              src={mug.src}
              alt={mug.alt}
              width={mug.width}
              height={mug.height}
              className="h-auto w-full brightness-[0.85] drop-shadow-[8px_18px_16px_rgba(0,0,0,0.6)]"
            />
          );
          const entrance = {
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: ENTER_DELAY, ease: [0.22, 1, 0.36, 1] as const },
          };
          return mug.href ? (
            <motion.a
              key={mug.src}
              href={mug.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={mug.aria}
              whileHover={{ ...HOVER, zIndex: 25 }}
              whileTap={{ scale: 0.99 }}
              {...entrance}
              className="absolute z-20 block cursor-pointer"
              style={mug.style}
            >
              {img}
            </motion.a>
          ) : (
            <motion.div
              key={mug.src}
              {...entrance}
              className="absolute z-20 block"
              style={mug.style}
            >
              {img}
            </motion.div>
          );
        })}

        {/* ── Cat photo frame (top, left of centre) ── */}
        <motion.div
          variants={enter()}
          initial="hidden"
          animate="show"
          whileHover={HOVER}
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
          variants={enter()}
          initial="hidden"
          animate="show"
          className="absolute z-[15] w-[22%]"
          style={{ bottom: "8%", left: "9%" }}
        >
          {!drawing && (
            <motion.button
              layoutId="notebook-card"
              type="button"
              onClick={() => setDrawing(true)}
              whileHover={HOVER}
              whileTap={{ scale: 0.99 }}
              aria-label="Open the notebook to draw on it"
              className="relative block w-full cursor-pointer focus:outline-none"
            >
              <Image
                src="/hero/notebook-v2.png"
                alt="Open notebook that says 'leave me a note'"
                width={910}
                height={693}
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
          variants={enter()}
          initial="hidden"
          animate="show"
          whileHover={HOVER}
          whileTap={{ scale: 0.99 }}
          onClick={playKeyboardSound}
          className="absolute z-20 w-[33%] cursor-pointer"
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

        {/* ── AirPods case (click to pop the earbuds out) ── */}
        <motion.button
          type="button"
          onClick={toggleAirpods}
          variants={enter()}
          initial="hidden"
          animate="show"
          whileHover={HOVER}
          whileTap={{ scale: 0.97 }}
          aria-label={airpodsOpen ? "Put the AirPods back" : "Take the AirPods out"}
          aria-pressed={airpodsOpen}
          className="absolute z-[14] block w-[7%] cursor-pointer focus:outline-none"
          style={{ top: "71%", left: "37%", rotate: "2deg" }}
        >
          <motion.div
            animate={{ opacity: airpodsOpen ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Image
              src="/hero/airpods.png"
              alt="AirPods Pro case with a memoji engraving"
              width={794}
              height={613}
              className="h-auto w-full drop-shadow-[4px_16px_16px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 top-0"
            animate={{ opacity: airpodsOpen ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Image
              src="/hero/airpods-open.png"
              alt=""
              width={715}
              height={872}
              className="h-auto w-full drop-shadow-[4px_16px_16px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.button>

        {/* ── Sticky note — drag it anywhere on the desk mat ── */}
        <motion.div
          drag
          dragConstraints={matRef}
          dragElastic={0.1}
          dragMomentum={false}
          whileHover={HOVER}
          whileDrag={{ scale: 1.08, rotate: 3 }}
          initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 6 }}
          transition={{ duration: 0.7, delay: ENTER_DELAY, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-30 w-[7%] cursor-grab touch-none active:cursor-grabbing"
          style={{ top: "calc(2% + 209px)", left: "calc(55% - 15px)" }}
        >
          <Image
            src="/hero/sticky-v3.png"
            alt="Sticky note: ship the good stuff"
            width={903}
            height={978}
            draggable={false}
            className="pointer-events-none h-auto w-full drop-shadow-[0_12px_18px_rgba(40,22,8,0.45)]"
          />
        </motion.div>

        {/* ── Snack (right) — click to cycle through snacks ── */}
        {SNACKS.map((snack, i) => {
          const active = i === snackIdx;
          return (
            <motion.button
              key={snack.src}
              type="button"
              onClick={() => setSnackIdx((p) => (p + 1) % SNACKS.length)}
              whileHover={HOVER}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              aria-label="Show the next snack"
              className="absolute z-20 block cursor-pointer focus:outline-none"
              style={{ ...snack.style, pointerEvents: active ? "auto" : "none" }}
            >
              <Image
                src={snack.src}
                alt={snack.alt}
                width={snack.width}
                height={snack.height}
                className="h-auto w-full drop-shadow-[0_22px_30px_rgba(40,22,8,0.55)]"
              />
            </motion.button>
          );
        })}
      </div>

      {/* Soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-[40]"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Spotify player — kept mounted (so it's ready to play instantly),
          shown when the AirPods are taken out */}
      <motion.div
        initial={false}
        animate={
          airpodsOpen
            ? { opacity: 1, y: 0, pointerEvents: "auto" }
            : { opacity: 0, y: 24, pointerEvents: "none" }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute bottom-6 right-6 z-50 h-[152px] w-[360px] overflow-hidden rounded-xl shadow-2xl max-sm:left-3 max-sm:right-3 max-sm:w-auto"
      >
        <SpotifyPlayer ref={playerRef} uri={`spotify:playlist:${playlistId}`} height={152} />
      </motion.div>
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
