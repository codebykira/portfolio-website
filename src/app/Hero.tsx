import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlightText?: string;
  highlightClassName?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = "",
  delay = 0,
  highlightText = "",
  highlightClassName = "",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 70); // Speed of typing (70ms per character)

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
    }
  }, [currentIndex, text, isComplete]);

  // Reset animation when text changes
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Function to check if current character is part of the highlight text
  const shouldHighlight = (index: number) => {
    if (!highlightText) return false;
    const startIndex = text.indexOf(highlightText);
    return (
      startIndex !== -1 &&
      index >= startIndex &&
      index < startIndex + highlightText.length
    );
  };

  return (
    <span className={`inline-block ${className}`}>
      {displayText.split("").map((char, index) => {
        const isHighlighted = shouldHighlight(index);
        return (
          <motion.span
            key={index}
            className={isHighlighted ? highlightClassName : ""}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: delay + index * 0.07, // Stagger the animation of each character
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  // Smooth the scroll progress with faster response
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 200, // Increased stiffness for faster response
    damping: 30,
    restDelta: 0.001,
  });

  enum Position {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left",
  }

  const roles = [
    {
      id: "fullstack",
      image: "/FullStack.png",
      position: Position.Right,
      rotate: 5,
      size: "w-64 max-sm:w-52",
    },
    {
      id: "engineer",
      image: "/Engineer.png",
      position: Position.Top,
      rotate: -5,
      size: "w-72 max-sm:w-56",
    },
    {
      id: "builder",
      image: "/Builder.png",
      position: Position.Left,
      rotate: -8,
      size: "w-80 max-sm:w-64",
    },
    {
      id: "growth",
      image: "/Growth.png",
      position: Position.Bottom,
      rotate: 5,
      size: "w-60 max-sm:w-52",
    },
  ];

  // Calculate viewport width for responsive movement
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const movementFactor = Math.min(viewportWidth * 0.4, 400); // Cap at 400px

  const positionStyles = {
    // Engineer - Top Right (moves up and right)
    top: {
      x: useTransform(smoothScrollProgress, [0, 1], [0, movementFactor * 0.8]), // Right
      y: useTransform(smoothScrollProgress, [0, 1], [0, -movementFactor * 1.2]), // Up
      className: "top-[90%] left-[40%] max-sm:top-[42%] max-sm:left-[50%] ",
    },
    // Fullstack - Right (moves right)
    right: {
      x: useTransform(smoothScrollProgress, [0, 1], [0, movementFactor]), // Right
      className: "top-[65%] right-[15%] max-sm:top-[50%] max-sm:right-[0%]",
    },
    // Builder - Left (moves left)
    left: {
      x: useTransform(smoothScrollProgress, [0, 1], [0, -movementFactor]), // Left
      className: "top-[75%] left-[30%] max-sm:top-[75%] max-sm:left-[10%]",
    },
    // Growth - Bottom (moves down)
    bottom: {
      y: useTransform(smoothScrollProgress, [0, 1], [0, movementFactor * 0.8]), // Down
      className: "bottom-[10%] left-[50%] max-sm:bottom-[5%] max-sm:left-[50%]",
    },
  };

  return (
    <div
      ref={ref}
      id="home"
      className="h-screen flex relative w-full overflow-hidden bg-[#EAE7DC]"
    >
      {/* Text */}
      <div className="flex flex-col items-center text-center pt-28 gap-0 max-w-screen-md mx-auto z-40 max-sm:pt-60">
        {/* Welcome + hand */}
        <div className="flex items-center gap-">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center z-40"
          >
            <h1 className="text-5xl font-bold max-sm:text-3xl indie-flower-regular flex flex-wrap justify-center">
              <AnimatedText text="Welcome to my playground" />
            </h1>
          </motion.div>
          {/* Hand */}
          <motion.span
            className="text-6xl origin-bottom-right inline-block max-sm:text-4xl"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{
              duration: 2.5,
              repeat: 3,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            👋
          </motion.span>
        </div>

        <motion.p
          className="text-2xl text-gray-600 z-50 w-full max-sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          I build software with heart, craft, and intent
        </motion.p>
      </div>

      {/* Image + Roles*/}
      <div className="">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20 max-sm:left-0 max-sm:-translate-x-0">
          <Image
            src="/kira-headshot.png"
            alt="kira headshot"
            width={600}
            height={600}
            className="w-[600px] max-h-[60vh] h-auto max-sm:w-fit object-contain"
            priority
          />
        </div>

        {/* Roles */}
        {roles.map((role) => (
          <motion.div
            key={role.id}
            className={`absolute flex items-center z-30 ${
              positionStyles[role.position].className || ""
            }`}
            style={{
              ...positionStyles[role.position],
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={`${role.size} h-auto relative`}
              whileHover={{
                scale: 1.15,
                rotate: role.rotate + 5,
                zIndex: 50,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                },
              }}
              whileTap={{
                scale: 1.1,
                transition: { duration: 0.1 },
              }}
              initial={{ rotate: role.rotate }}
            >
              <Image
                src={role.image}
                alt={role.image.replace(/^\//, "").replace(".png", "")}
                width={200}
                height={100}
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* background circle */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-52 w-[80vw] max-w-[800px] aspect-square z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
          <defs>
            <radialGradient
              id="radiatingGlow"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#EAE7DC" />
              <stop offset="45%" stopColor="#FFD5BA" />
              <stop offset="75%" stopColor="#FFCAA3" />
              <stop offset="100%" stopColor="#EAE7DC" />
            </radialGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width="800"
            height="800"
            fill="url(#radiatingGlow)"
            opacity="50%"
          />
        </svg>
      </div>
    </div>
  );
}
