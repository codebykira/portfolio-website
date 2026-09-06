"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import ProjectShowcase from "../components/project-showcase";

/* ── Atrios media ─────────────────────────────────────────
 * Home and Inbox, one account, so they share one frame. Home sits behind at
 * the top-left, Inbox in front at the bottom-right, overlapping in the middle
 * like 2 windows left open. The pair is centred in the card. On hover they
 * ease apart a touch and darken so the overlay text reads.
 * ─────────────────────────────────────────────────────── */
const SHOT =
  "h-auto w-full rounded-2xl border border-white/10 drop-shadow-[0_0_40px_rgba(0,0,0,0.55)] transition-[filter] duration-300 ease-out group-hover:brightness-[0.55]";

function AtriosMedia() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 dot-grid-static"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(252, 247, 233, 0.18) 1px, transparent 1.1px)",
          backgroundSize: "14px 14px",
        }}
      />
      {/* The pair is one centred group: Home top-left, Inbox bottom-right,
          overlapping in the middle. The group is sized by aspect ratio so it
          scales with the card instead of cropping off the edges. */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <div
          className="relative"
          style={{ aspectRatio: "1.5 / 1", width: "min(100%, calc((72vh - 3rem) * 1.5))" }}
        >
          {/* Home, behind */}
          <div className="absolute left-0 top-0 w-[76%] transition-transform duration-500 ease-out group-hover:-translate-x-2 group-hover:-translate-y-2">
            <Image
              src="/atrios-home-v3.jpg"
              alt="The Atrios home: companies to introduce friends to"
              width={2000}
              height={1095}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={SHOT}
            />
          </div>
          {/* Inbox, in front */}
          <div className="absolute bottom-0 right-0 w-[76%] transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:translate-y-2">
            <Image
              src="/atrios-inbox-v3.jpg"
              alt="The Atrios Inbox: companies that want to meet you"
              width={2000}
              height={1093}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={SHOT}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkProps {
  onProjectEnter: () => void;
  onProjectLeave: () => void;
}

export default function Work({ onProjectEnter, onProjectLeave }: WorkProps) {
  return (
      <div
        id="work"
        className="w-full flex justify-center items-center flex-col"
      >

      <div className="w-full max-w-7xl px-4 space-y-6 flex flex-col">
        <Link
          href="/atrios"
          className="block w-full cursor-pointer"
          onMouseEnter={onProjectEnter}
          onMouseLeave={onProjectLeave}
        >
          <ProjectShowcase
            title="Atrios"
            description={[
              "The best products you use came from a friend, not an ad. Atrios is built on that instinct: you think about what your friends would actually want, curate a few, and get rewarded for the care. We're building the version that does, backed by a16z.",
              "I shape the Atrios experience. I designed every screen and write the code behind them, backend to frontend. Every screen, every line, every detail that makes it feel less like software.",
            ]}
            media={<AtriosMedia />}
            logo={{
              src: "/atrios-icon.png",
              alt: "Atrios Logo",
              width: 530,
              height: 506,
            }}
            gradientColor="#F3E6C4"
            heightClass="h-[72vh]"
            revealOnHover
          />
        </Link>

        <Link
          href="/blind-hangouts"
          className="block w-full cursor-pointer"
          onMouseEnter={onProjectEnter}
          onMouseLeave={onProjectLeave}
        >
          <ProjectShowcase
            title="Blind Hangouts"
            description={[
              "The people you want to see most are usually the ones you see least. Not because you don't care, but because caring costs coordination.",
              "I founded Blind Hangouts, backed by Founders Inc, to take the coordination off your plate. It learns what you and your friends like to do, finds a time that works for everyone, and books the plan. There's always a small surprise in it too.",
            ]}
            images={[
              {
                src: "/screenshots.png",
                alt: "Blind Hangouts app screenshots",
                width: 1920,
                height: 1080
              }
            ]}
            logo={{
              src: "/chillhangouts-logo.png",
              alt: "Blind Hangouts Logo",
              width: 48,
              height: 48
            }}
            gradientColor="#F7EED7"
            heightClass="h-[72vh]"
            revealOnHover
            mediaCenter
            mediaWidth="min(92%, calc((72vh - 1rem) / 0.5625))"
          />
        </Link>

        <div className="w-full">
          <ProjectShowcase
            title="Waverly"
            description={[
              "Waverly was my first real job in a startup. Employee #2, Betaworks-backed, an AI social platform for finding your people. We got to 10K users and were covered by BBC News, BetaKit, and Collision.",
              "My job was growth. What I actually did was fall in love with building. I kept asking why people weren't coming back, and every answer lived inside the product, so eventually I was in there designing and writing it. Everything I do now started there.",
              "We were trying to make recommendations out of language, before ChatGPT, before the models could really do it. We were right about language being the thing. I've been building on that bet ever since.",
            ]}
            images={[
              {
                src: "/waverly1.png",
                alt: "Waverly Screenshot 1",
                width: 400,
                height: 500
              },
              {
                src: "/waverly2.png",
                alt: "Waverly Screenshot 2",
                width: 300,
                height: 500
              }
            ]}
            logo={{
              src: "/waverly-logo.png",
              alt: "Waverly Logo",
              width: 48,
              height: 48
            }}
            gradientColor="#FEBA4F"
            heightClass="h-[72vh]"
            revealOnHover
            mediaCenter
            mediaWidth="70%"
            logoBgColor="#3D00BD"
          />
        </div>

      </div>
    </div>
  );
}