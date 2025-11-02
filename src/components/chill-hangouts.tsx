import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProjectImage } from "./type";
import ProjectScreenshots from "./project-screenshot";

const ChillHangouts = () => {
  const images: ProjectImage[] = [
    {
      src: "/chillhangouts1.png",
      alt: "Project Screenshot 1",
      width: 400,
      height: 500,
    },
    {
      src: "/chillhangouts2.png",
      alt: "Project Screenshot 2",
      width: 300,
      height: 500,
    },
  ];

  const handleClick = () => {
    window.location.href = "/blind-hangouts";
  };

  return (
    <motion.div
      className="h-[85vh] max-w-7xl mx-auto overflow-hidden p-8 rounded-3xl bg-gray-100 max-sm:h-2/3 cursor-pointer"
      onClick={handleClick}
      initial={{
        background:
          "linear-gradient(45deg, #F5F5F5 0%, #F5F5F5 40%, #F5F5F5 100%)",
      }}
      whileHover={{
        background:
          "linear-gradient(45deg, transparent 0%, transparent 40%, #FEBA4F 100%)",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="mx-auto mb-8 max-sm:mb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 relative">
            <Image
              src="/chillhangouts-logo.png"
              alt="Chill Hangouts Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold">Blind Hangouts</h1>
        </div>
        <p>
          Too many hangouts start with &ldquo;We should catch up&rdquo;—but never happen.
        </p>
        <p>
          I solo-built Chill Hangouts, a social app that makes meeting up with
          friends in real life effortless.
        </p>
        <p>
          No more endless group chats or guessing who&apos;s around. Chill
          Hangouts shows you when your friends are free and picks a time and
          place that works for everyone. It turns a quick phone check into real
          plans.
        </p>
      </div>

      {/* Screenshots Section */}
      <ProjectScreenshots images={images} withShadow={true} />
    </motion.div>
  );
};

export default ChillHangouts;
