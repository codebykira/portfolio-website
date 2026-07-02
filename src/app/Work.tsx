"use client";
import React from "react";
import ProjectShowcase from "../components/project-showcase";


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
          className="cursor-none"
          onMouseEnter={onProjectEnter}
          onMouseLeave={onProjectLeave}
          onClick={() => window.location.href = '/atrios'}
        >
          <ProjectShowcase
            title="Atrios"
            description={[
              "Turning trust into a product — warm introductions booked straight into a company's calendar.",
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
            tags={[
              { emoji: "🎨", label: "Product Designer" },
              { emoji: "💻", label: "Full-Stack Developer" }
            ]}
          />
        </div>

        <div
          className="cursor-none"
          onMouseEnter={onProjectEnter}
          onMouseLeave={onProjectLeave}
          onClick={() => window.location.href = '/blind-hangouts'}
        >
          <ProjectShowcase
            title="Blind Hangouts"
            description={[
              "AI that plans your social life, built at Founders Inc.",
            ]}
            images={[
              {
                src: "/bh-1.png",
                alt: "Blind Hangouts App Screenshot 1",
                width: 300,
                height: 600
              },
              {
                src: "/bh-2.png",
                alt: "Blind Hangouts App Screenshot 2",
                width: 300,
                height: 600
              }
            ]}
            logo={{
              src: "/chillhangouts-logo.png",
              alt: "Blind Hangouts Logo",
              width: 48,
              height: 48
            }}
            gradientColor="#F7EED7"
            tags={[
              { emoji: "🧑‍💼", label: "Founder" },
              { emoji: "🎨", label: "Product Designer" },
              { emoji: "📱", label: "iOS Engineer" },
              { emoji: "💻", label: "Full-Stack Developer" }
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