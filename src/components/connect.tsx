"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Github, Instagram, Linkedin } from "lucide-react";
import { textColorAnimation } from "./animations";

const EMAIL = "kiracheung0211@gmail.com";

const XMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M17.6 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.7 3h6.4l4.4 5.9L17.6 3zm-1.1 16.2h1.7L7 4.7H5.2l11.3 14.5z" />
  </svg>
);

const socials = [
  { label: "GitHub", href: "https://github.com/kiracheung0211", Icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/kira-cheung", Icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com/kkiracheungg", Icon: Instagram },
  { label: "X", href: "https://x.com/CheungKira", Icon: XMark },
];

const Connect = () => {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked. The mailto link next to it still works.
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  // The site-wide dim-to-70% reveal, skipped when the visitor asked for less motion.
  const reveal = reduceMotion
    ? {}
    : {
        initial: textColorAnimation.initial,
        whileInView: textColorAnimation.whileInView,
        viewport: textColorAnimation.viewport,
        transition: { duration: 0.9 },
      };

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7, delay, ease: "easeOut" as const },
        };

  return (
    <section
      id="connect"
      aria-labelledby="connect-heading"
      className="w-full px-4 pb-24 pt-36 sm:px-6 sm:pb-28 sm:pt-48 lg:px-8 lg:pt-56"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 h-px w-full bg-white/10" />

        <motion.p
          className="indie-flower-regular mb-10 text-lg text-white/50 sm:text-xl"
          {...rise(0)}
        >
          Last thing.
        </motion.p>

        <motion.h2
          id="connect-heading"
          className="ds-title max-w-[14ch] text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.98] tracking-tight"
          {...reveal}
        >
          You read the whole page. Now write to me.
        </motion.h2>

        <motion.div className="mt-14 sm:mt-20" {...rise(0.15)}>
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
            One address, no form
          </p>

          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
            <a
              href={`mailto:${EMAIL}`}
              className="group relative inline-block break-all text-[clamp(1.35rem,4.2vw,3.5rem)] font-medium leading-tight text-white/85 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none motion-reduce:transition-none"
            >
              {EMAIL}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 bg-[#412D15] transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none sm:-bottom-2 sm:h-1"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 bg-white/60 transition-transform delay-100 duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none sm:-bottom-2 sm:h-1"
              />
            </a>

            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? "Email copied" : "Copy email address"}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm backdrop-blur-md transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none ${
                copied
                  ? "border-[#412D15] bg-[#412D15] text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
              }`}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <p className="mt-3 text-sm text-white/40" aria-live="polite">
            {copied
              ? "It is on your clipboard. Paste it wherever you write."
              : "Click to open your mail app, or copy it for later."}
          </p>
        </motion.div>

        <motion.div
          className="mt-24 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/40 sm:mt-32 sm:flex-row sm:items-center sm:justify-between"
          {...rise(0.3)}
        >
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/50 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none motion-reduce:transition-none"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p>
            <span className="indie-flower-regular text-base text-white/50">
              Made by Kira.
            </span>{" "}
            <span className="text-white/30">{new Date().getFullYear()}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Connect;
