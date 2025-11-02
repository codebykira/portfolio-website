"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Indie_Flower, Reenie_Beanie, Homemade_Apple, Mansalva, Nanum_Pen_Script } from "next/font/google";

const nanumPenScript = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
});

const indieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

const reenieBeanie = Reenie_Beanie({
  weight: "400",
  subsets: ["latin"],
});

const homemadeApple = Homemade_Apple({
  weight: "400",
  subsets: ["latin"],
});

const mansalva = Mansalva({
  weight: "400",
  subsets: ["latin"],
});

interface FontCycleTextProps {
  children: React.ReactNode;
  className?: string;
}

const FontCycleText: React.FC<FontCycleTextProps> = ({ children, className = "" }) => {
  const fonts = [
    `${nanumPenScript.className}`,
    `${indieFlower.className}`,
    `${reenieBeanie.className}`,
    `${homemadeApple.className}`,
    `${mansalva.className}`
  ];
  
  const [currentFont, setCurrentFont] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFont((prev) => (prev + 1) % fonts.length);
    }, 300); // Change font every 300ms (faster)
    
    return () => clearInterval(interval);
  }, [fonts.length]);
  
  return (
    <span 
      className={`${className} inline-block relative`}
      style={{ 
        height: '1em',
        lineHeight: '1em',
        verticalAlign: 'baseline'
      }}
    >
      <motion.span 
        key={currentFont}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        className={`${fonts[currentFont]}`}
        style={{ 
          lineHeight: '1em',
          display: 'inline'
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default FontCycleText;