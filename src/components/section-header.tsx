import React from "react";
import { Kalam } from "next/font/google";
import AnimatedContent from "./AnimatedContent";

const kalam = Kalam({
  weight: "400",
  subsets: ["latin"],
});

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  color = "text-orange-500",
}) => {
  return (
    <AnimatedContent
      distance={150}
      direction="horizontal"
      reverse={false}
      duration={1.2}
      ease="easeOut"
      initialOpacity={0.2}
      animateOpacity
      scale={1.1}
      threshold={0.2}
      delay={0.3}
    >
      <div className="w-full max-w-4xl flex justify-start">

          <h1
            className={`text-8xl font-bold ${color} tracking-tighter text-left`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`left-4 bottom-4 -rotate-3 text-base text-gray-600 ${kalam.className}`}
            >
              {subtitle}
            </p>
          )}
        </div>
    </AnimatedContent>
  );
};

export default SectionHeader;
