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
            <p className="text-xl max-w-2xl mx-auto indie-flower-regular text-gray-500">
Hi, I'm Kira
              </p>
              <p>
              I've always been drawn to learning, especially at the intersection of people and technology.
              </p>
              <p>
              My journey started in finance, but my curiosity kept pulling me toward emerging tech. I explored blockchain at Blockchain Research Institute, then joined the founding team at Waverly, a social app backed by Betaworks and Mozilla. At Waverly, we experimented with how AI could create more meaningful conversations between people. It was during this experience that I realized I wanted to go deeper, so I pursued a Master's in Computer Science at UPenn.
              </p>

              <p>
              What really drives me is bringing people closer together in real life. That's why I built Blind Hangouts, an app that takes the work out of your social life by planning events with friends and family. I built it during my time at Founders Inc, and grew it to hundreds on the waitlist with 20k views on Instagram.
              </p>
              <p>
              Right now, I'm exploring what's next and looking for opportunities where I can keep building products that connect people.
              </p>
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
