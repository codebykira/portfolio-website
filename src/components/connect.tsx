"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Linkedin } from "lucide-react";

const EMAIL = "kiracheung0211@gmail.com";
const X_URL = "https://x.com/CheungKira";
const LINKEDIN_URL = "https://linkedin.com/in/kira-cheung";

const XMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M17.6 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.7 3h6.4l4.4 5.9L17.6 3zm-1.1 16.2h1.7L7 4.7H5.2l11.3 14.5z" />
  </svg>
);

/* ── The thread ───────────────────────────────────────────
 * A short iMessage-style exchange. Grey on the left is me, blue on the
 * right is the visitor. Bubbles pop in one at a time once the section scrolls into
 * view, and the last two "messages" are the actual buttons. Casual on
 * purpose: this is the end of the page, not a form.
 * ─────────────────────────────────────────────────────── */
type Msg = { from: "you" | "me"; text: string };

const THREAD: Msg[] = [
  { from: "me", text: "hey. you made it to the bottom." },
  { from: "you", text: "ok that was kinda fun" },
  { from: "me", text: "want to build something together? or just say hi. both good." },
  { from: "me", text: "big buttons below. pick one." },
];

const STEP = 0.55; // seconds between bubbles

function Bubble({ msg, index, reduceMotion }: { msg: Msg; index: number; reduceMotion: boolean | null }) {
  const mine = msg.from === "you";
  const anim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.6, y: 12 },
        whileInView: { opacity: 1, scale: 1, y: 0 },
        viewport: { once: true, amount: 0.6 },
        transition: { type: "spring" as const, stiffness: 420, damping: 26, delay: index * STEP },
      };
  return (
    <motion.div
      className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
      style={{ transformOrigin: mine ? "bottom right" : "bottom left" }}
      {...anim}
    >
      <p
        className={`max-w-[85%] rounded-[1.6rem] px-5 py-3 text-base leading-snug sm:max-w-[70%] sm:text-lg ${
          mine
            ? "rounded-br-md bg-[#2f7bff] text-white shadow-[0_6px_24px_rgba(47,123,255,0.35)]"
            : "rounded-bl-md bg-[#2c2c30] text-white/90"
        }`}
      >
        {msg.text}
      </p>
    </motion.div>
  );
}

const Connect = () => {
  const reduceMotion = useReducedMotion();
  const pill =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 motion-reduce:transition-none sm:text-lg";

  return (
    <section
      id="connect"
      aria-labelledby="connect-heading"
      className="w-full px-4 pb-16 pt-16 sm:px-6 sm:pb-20 md:pt-24 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2 id="connect-heading" className="sr-only">
          Contact
        </h2>

        <div className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col gap-3">
            {THREAD.map((msg, i) => (
              <Bubble key={i} msg={msg} index={i} reduceMotion={reduceMotion} />
            ))}
          </div>

          {/* the buttons, always there */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className={`${pill} bg-[#2f7bff] text-white shadow-[0_10px_30px_rgba(47,123,255,0.45)] hover:bg-[#3d86ff]`}
            >
              Email me
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${pill} border border-white/15 bg-white/10 text-white/85 hover:bg-white/15`}
            >
              <XMark className="h-4 w-4" />
              DM me
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${pill} border border-white/15 bg-white/10 text-white/85 hover:bg-white/15`}
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Connect;
