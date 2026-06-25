"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { Globe, ArrowRight, Instagram, Twitter } from "lucide-react";
import "./hero.css";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

const FADE_DURATION = 500; // ms
const FADE_OUT_LEAD = 0.55; // seconds before end to start fading out

export default function HeroPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  // RAF-based opacity fade (no CSS transitions). Resumes from the current
  // opacity and cancels any in-flight animation so fades never compete.
  const fadeTo = useCallback((target: number, duration: number) => {
    const video = videoRef.current;
    if (!video) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const start = parseFloat(video.style.opacity || "0") || 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      video.style.opacity = String(start + (target - start) * t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const handleLoadedData = useCallback(() => {
    fadingOutRef.current = false;
    fadeTo(1, FADE_DURATION);
  }, [fadeTo]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const remaining = video.duration - video.currentTime;
    if (!fadingOutRef.current && remaining <= FADE_OUT_LEAD) {
      fadingOutRef.current = true;
      fadeTo(0, FADE_DURATION);
    }
  }, [fadeTo]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    video.style.opacity = "0";
    setTimeout(() => {
      video.currentTime = 0;
      void video.play();
      fadingOutRef.current = false;
      fadeTo(1, FADE_DURATION);
    }, 100);
  }, [fadeTo]);

  // Kick off muted autoplay and clean up any pending animation frame.
  useEffect(() => {
    const video = videoRef.current;
    if (video) void video.play();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Full-screen looping background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        style={{ opacity: 0 }}
        src={VIDEO_URL}
        muted
        autoPlay
        playsInline
        preload="auto"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Foreground */}
      <div className="relative flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="relative z-20 pl-6 pr-6 py-6">
          <div className="rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-white" />
                <span className="text-white font-semibold text-lg">Asme</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  About
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-white text-sm font-medium">Sign Up</button>
              <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Built for the curious
          </h1>

          <div className="max-w-xl w-full space-y-4">
            {/* Email input bar */}
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-transparent outline-none border-none text-white placeholder:text-white/40 text-base"
              />
              <button
                type="button"
                aria-label="Submit email"
                className="bg-white rounded-full p-3 text-black"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-white text-sm leading-relaxed px-4">
              Stay updated with the latest news and insights. Subscribe to our
              newsletter today and never miss out on exciting updates.
            </p>
          </div>

          {/* Manifesto button */}
          <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors mt-8">
            Read our manifesto
          </button>
        </div>

        {/* Social icons footer */}
        <div className="relative z-10 flex justify-center gap-4 pb-12">
          <button
            aria-label="Instagram"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Instagram size={20} />
          </button>
          <button
            aria-label="Twitter"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Twitter size={20} />
          </button>
          <button
            aria-label="Website"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Globe size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
