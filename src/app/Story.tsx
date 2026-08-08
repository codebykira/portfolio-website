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
              label={`I paint. Mostly portraits, often of strangers, which means spending a while looking closely at someone and trying to get them right.

That's more or less what I do at work too. I keep building products about how people find each other. An AI that plans your social life, a platform for finding your people, a marketplace that runs on who knows whom. Same question every time, different shape.

I got here sideways: finance, then the founding team at Waverly, then a CS master's at Penn so I could build things instead of describing them. Now I design the screens and write the code. Painting teaches you what to leave out, and product works the same way: most details don't matter, and the few that do, matter enormously.`}
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
