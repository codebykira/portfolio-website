"use client";
import { useEffect, useState } from "react";

/**
 * Suggests landscape on a phone, where the desk scene finally has room to be
 * read. In portrait the desk is locked to a 1583/675 stage roughly 170px tall,
 * so the lamp, the notebook and the snack are too small to make out.
 *
 * A suggestion, not a lock. screen.orientation.lock() is unavailable in iOS
 * Safari outside fullscreen/standalone, and many people browse with rotation
 * locked at the OS level, so a blocking "please rotate" screen would simply
 * strand them. This dismisses itself on rotation, on tap, and on a timer.
 */
export default function RotateHint() {
  // starts false on both server and client, so there is nothing to mismatch
  const [show, setShow] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("rotate-hint") === "gone") {
      setGone(true);
      return;
    }
    // coarse pointer keeps this off laptops with a narrow window
    const mq = window.matchMedia("(orientation: portrait) and (pointer: coarse)");
    const sync = () => setShow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    // say it once; a hint that will not leave is an annoyance
    const t = setTimeout(() => setGone(true), 7000);
    return () => {
      mq.removeEventListener("change", sync);
      clearTimeout(t);
    };
  }, []);

  if (gone || !show) return null;

  const dismiss = () => {
    sessionStorage.setItem("rotate-hint", "gone");
    setGone(true);
  };

  return (
    <button
      type="button"
      onClick={dismiss}
      className="indie-flower-regular fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/70 whitespace-nowrap px-4 py-2 text-sm text-white/85 shadow-lg shadow-black/30 backdrop-blur-xl"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* an upright phone, with an arc showing the turn */}
        <rect x="9" y="3" width="6.5" height="11" rx="1.6" />
        <path d="M4 15.5a8.5 8.5 0 0 0 16 1.5" />
        <path d="M17.2 17.6l2.9.9.7-2.9" />
      </svg>
      Rotate for the full desk
    </button>
  );
}
