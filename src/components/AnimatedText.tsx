"use client";
import React, { useState, useEffect } from "react";

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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 70); // Speed of typing (70ms per character)

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
    }
  }, [currentIndex, text, isComplete, isHydrated]);

  const renderText = () => {
    if (highlightText && displayText.includes(highlightText)) {
      const parts = displayText.split(highlightText);
      return (
        <>
          {parts[0]}
          <span className={highlightClassName}>{highlightText}</span>
          {parts[1]}
        </>
      );
    }
    return displayText;
  };

  if (!isHydrated) {
    return <span className={className}></span>;
  }

  return (
    <span className={className}>
      {renderText()}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default AnimatedText;