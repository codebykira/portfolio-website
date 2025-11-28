"use client";
import React from "react";
import { motion } from "framer-motion";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 150,
  direction = "horizontal",
  reverse = false,
  duration = 1.2,
  ease = "easeOut",
  initialOpacity = 0.2,
  animateOpacity = true,
  scale = 1.1,
  threshold = 0.2,
  delay = 0.3,
}) => {
  const getInitialTransform = () => {
    if (direction === "horizontal") {
      return reverse ? distance : -distance;
    } else {
      return reverse ? distance : -distance;
    }
  };

  const initial = {
    x: direction === "horizontal" ? getInitialTransform() : 0,
    y: direction === "vertical" ? getInitialTransform() : 0,
    opacity: animateOpacity ? initialOpacity : 1,
    scale: scale,
  };

  const animate = {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      transition={{
        duration,
        delay,
      }}
      viewport={{
        once: true,
        amount: threshold,
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContent;