import React, { useRef } from "react";
import { motion } from "framer-motion";
import PhotoGallery from "../components/photo-gallery";
import VariableProximity from '../components/VariableProximity';

const Story = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <motion.div id="story" transition={{ duration: 0.3 }}>
      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Story Text */}
        <div className="lg:w-1/2 flex flex-col justify-center text-white/70 space-y-6">

          <div className="flex items-center gap-2">

            <p className="text-xl max-w-2xl indie-flower-regular">
              Hi, I&apos;m Kira
            </p>

            <motion.span
              className="text-3xl origin-bottom-right inline-block"
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
          <div ref={containerRef} style={{ position: 'relative' }}>
            <VariableProximity
              label={`I've always been interested in how people connect and how technology can make those moments easier. 

I started in finance, but curiosity led me into emerging tech, from blockchain at the Blockchain Research Institute to the founding team at Waverly, backed by Betaworks and Mozilla. That journey inspired me to pursue a Master's in Computer Science at UPenn.

I love building products that bring people together. At Founders Inc, I created Blind Hangouts, an AI that plans your social life, which grew to hundreds on the waitlist and 20k+ views on Instagram.`}
              className={'variable-proximity-demo'}
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef}
              radius={100}
              falloff='linear'
            />
          </div>

        </div>
        {/* Photo Gallery */}
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="sticky w-full">
            <PhotoGallery />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Story;
