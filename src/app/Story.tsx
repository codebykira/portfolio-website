import React from "react";
import { motion } from "framer-motion";
import PhotoGallery from "../components/photo-gallery";
import SectionHeader from "../components/section-header";
import { textColorAnimation } from "../components/animations";

const Story = () => {
  return (
    <motion.div id="story" className="w-full" transition={{ duration: 0.3 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
        
        {/* Content */}
        <div className="mt-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Story Text */}
          <div className="lg:w-1/2 space-y-8 bg-gray-50 rounded-3xl p-8 shadow-sm">
            <div className="space-y-6">
              <motion.p className="text-lg leading-relaxed text-gray-500" initial={textColorAnimation.initial} whileInView={textColorAnimation.whileInView} transition={textColorAnimation.transition} viewport={textColorAnimation.viewport}>
                I&apos;m someone who can&apos;t stop exploring - whether it&apos;s
                wandering through 20+ countries or diving into new fields that
                spark my imagination. Through experiencing different cultures and
                perspectives, I discovered my love for combining creativity with
                technology to solve problems in unexpected ways.
              </motion.p>
              <motion.p className="text-lg leading-relaxed text-gray-500" initial={textColorAnimation.initial} whileInView={textColorAnimation.whileInView} transition={textColorAnimation.transition} viewport={textColorAnimation.viewport}>
                My startup journey pulled me away from my business studies at
                UofT, and building Waverly opened my eyes to the magic of AI.
                Working alongside top AI researchers really lit a fire in me, I
                couldn&apos;t resist diving deeper, so I headed to UPenn for an AI
                master&apos;s.
              </motion.p>
              <motion.p className="text-lg leading-relaxed text-gray-500" initial={textColorAnimation.initial} whileInView={textColorAnimation.whileInView} transition={textColorAnimation.transition} viewport={textColorAnimation.viewport}>
                These days, I&apos;m on a mission to use technology to bring
                people closer together (and maybe make the world a little less
                lonely while we&apos;re at it!).
              </motion.p>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="lg:w-1/2 flex-shrink-0">
            <div className="sticky top-24 h-[600px] lg:h-[700px] w-full rounded-3xl bg-gray-50 p-6 shadow-sm">
              <PhotoGallery />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Story;
