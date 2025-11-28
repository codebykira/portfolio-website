"use client";
import React from "react";
import Lanyard from "./Lanyard";

interface HeroLanyardProps {
  onRopeEnter?: () => void;
  onRopeLeave?: () => void;
}

const HeroLanyard: React.FC<HeroLanyardProps> = ({ onRopeEnter, onRopeLeave }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <Lanyard 
          position={[0, 0, 12]} 
          gravity={[0, -40, 0]} 
          onRopeEnter={onRopeEnter}
          onRopeLeave={onRopeLeave}
        />
      </div>
    </div>
  );
};

export default HeroLanyard;