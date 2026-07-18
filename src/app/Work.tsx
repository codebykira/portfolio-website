"use client";
import React from "react";
import ProjectShowcase from "../components/project-showcase";

// Live demo of the Christmas card site.
const CHRISTMAS_CARD_DEMO_URL = "https://christmas-cards-web.vercel.app/";


interface WorkProps {
  onProjectEnter: () => void;
  onProjectLeave: () => void;
}

export default function Work({ onProjectEnter, onProjectLeave }: WorkProps) {
  return (
      <div
        id="work"
        className="min-h-screen mx-auto flex justify-center items-center flex-col"
      >

      <div className="space-y-6 flex flex-col items-center ">
        <div
          className="cursor-pointer"
          onClick={() => window.location.href = '/atrios'}
        >
          <ProjectShowcase
            title="Atrios"
            description={[
              "The best products you use came from a friend, not an ad. Atrios is built on that instinct: you think about what your friends would actually want, curate a few, and get rewarded for the care. They discover things worth their time. We're building the version that does.",
              "I shape the Atrios experience. I designed every screen and write the code behind them, backend to frontend. From the tastemaker's first onboarding question to the email that lands when a meeting books, it's one continuous surface, and I hold all of it. The best products feel like someone cared, and that's the part I don't compromise on.",
            ]}
            images={[
              {
                src: "/atrios-companies-v2.png",
                alt: "Atrios companies marketplace",
                width: 3024,
                height: 1654
              }
            ]}
            logo={{
              src: "/atrios-icon.png",
              alt: "Atrios Logo",
              width: 530,
              height: 506
            }}
            gradientColor="#F3E6C4"
            heightClass="h-auto"
            stacked
          />
        </div>

        <div
          className="cursor-pointer"
          onClick={() => window.location.href = '/blind-hangouts'}
        >
          <ProjectShowcase
            title="Blind Hangouts"
            description={[
              "The people you want to see most are usually the ones you see least. Not because you don't care, but because caring costs coordination.",
              "I founded Blind Hangouts to take the coordination off your plate. It learns what you and your friends like to do, finds a time that works for everyone, and books the plan. There's always a small surprise in it too.",
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
            heightClass="h-auto"
            stacked
            imageScale={1.3}
            mediaAspect="16/6"
          />
        </div>

        <div
          className="cursor-pointer"
          onClick={() => window.open(CHRISTMAS_CARD_DEMO_URL, "_blank", "noopener,noreferrer")}
        >
          <ProjectShowcase
            title="Christmas Card"
            description={[
              "An interactive 3D Christmas card you can personalize with a message and photos, then share as a link.",
            ]}
            images={[
              {
                src: "/christmas-card.png",
                alt: "3D ornament Christmas tree from the Christmas card site",
                width: 1040,
                height: 1600
              }
            ]}
            gradientColor="#C0392B"
            widthClass="max-w-md"
            tags={[
              { emoji: "🎄", label: "Creative Dev" },
              { emoji: "💻", label: "Three.js / WebGL" },
            ]}
          />
        </div>

        <div>
          <ProjectShowcase
            title="Waverly"
            description={[
              "AI social platform for effortless community creation and discovery, reaching 10K users and featured by BBC News, Betakit, and Collision Conference."
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
            tags={[
              { emoji: "🚀", label: "Founding Team" },
              { emoji: "🧠", label: "Product Strategy" },
              { emoji: "📈", label: "Growth" },
              { emoji: "💻", label: "Web Developer" },

            ]}
          />
        </div>

        <div>
          <ProjectShowcase
            title="Linkflo"
            description={[
              "Built an AI that improves GP–LP matchmaking at Included VC",
            ]}
            images={[
              {
                src: "/linkflo.png",
                alt: "Linkflo Screenshot 1",
                width: 1700,
                height: 1500
              }
            ]}
            logo={{
              src: "/linkflo-logo.jpg",
              alt: "Linkflo Logo",
              width: 48,
              height: 48
            }}
            tags={[
              { emoji: "🎨", label: "Product Design" },
              { emoji: "💻", label: "Web Developer" },

            ]}
          />
        </div>
      </div>
    </div>
  );
}