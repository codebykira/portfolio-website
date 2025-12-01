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
      {/* Background text behind lanyard */}
      <div className="absolute inset-0 flex items-center justify-start z-[-1] px-16">
      <h1 className="uppercase text-9xl font-bold bg-gradient-to-t from-orange-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent opacity-60 select-none pointer-events-none text-start leading-none font-inter-tight">
  Founder<br/>Product builder<br/>Full-Stack Engineer
</h1>
      </div>
      
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