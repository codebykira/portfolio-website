"use client";
import React from "react";
import Link from "next/link";
import ProjectShowcase from "../components/project-showcase";

interface WorkProps {
  onProjectEnter: () => void;
  onProjectLeave: () => void;
}

export default function Work({ onProjectEnter, onProjectLeave }: WorkProps) {
  return (
      <div
        id="work"
        className="min-h-screen w-full flex justify-center items-center flex-col"
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
            images={[
              {
                src: "/atrios-network-v2.png",
                alt: "Atrios — introductions for your network",
                width: 3006,
                height: 1652,
              },
            ]}
            logo={{
              src: "/atrios-icon.png",
              alt: "Atrios Logo",
              width: 530,
              height: 506,
            }}
            gradientColor="#F3E6C4"
            heightClass="h-[72vh]"
            revealOnHover
            mediaOffset
            mediaWidth="118%"
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