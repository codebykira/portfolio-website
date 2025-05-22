import React from "react";
import ProjectShowcase from "./project-showcase";

export const WaverlyShowcase = () => {
  const projectDetails = {
    title: "Waverly",
    logo: {
      src: "/waverly-logo.png",
      alt: "Waverly Logo",
      width: 48,
      height: 48,
    },
    description: [
      "Built an AI-powered social platform where anyone could create and join communities—just by using natural language. Backed by Betaworks, Greycroft, and Mozilla Ventures, it redefined how people connect online.",
      "To make it even more seamless, I developed smart content filtering and community matching, helping users find the right spaces effortlessly.",
      "Features on BBC News, Betakit, and Collision Conference brought major visibility, driving the platform to 10,000+ users and proving the demand for a more intuitive way to connect.",
    ],
    images: [
      {
        src: "/waverly1.png",
        alt: "Project Screenshot 1",
        width: 400,
        height: 500,
      },
      {
        src: "/waverly2.png",
        alt: "Project Screenshot 2",
        width: 300,
        height: 500,
      },
    ],
  };

  return <ProjectShowcase {...projectDetails} />;
};
