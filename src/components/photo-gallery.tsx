'use client';

import { useRef, useEffect, useState, useCallback } from "react";
import { Kalam } from "next/font/google";
import Image from "next/image";
import { motion, useAnimationControls } from "framer-motion";

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

// Define photos array outside of component to avoid reference issues
const photos = [
  {
    id: 1,
    src: "/mikey.png",
    title: "Meet Mikey, my best friend who brings sunshine to every day.",
    icon: "🐱",
  },
  {
    id: 2,
    src: "/north-korea.png",
    title:
      "I love traveling, and North Korea stands out as my most surreal adventure.",
    icon: "🇰🇵",
  },
  {
    id: 3,
    src: "/kenya.png",
    title:
      "Kenya was unforgettable! A month of volunteering and experiencing a culture so different from my own.",
    icon: "🦒",
  },
  {
    id: 4,
    src: "/food.png",
    title:
      "My adventures are driven by food, always searching for the next amazing meal.",
    icon: "😋",
  },
  {
    id: 5,
    src: "/painting.png",
    title:
      "This is my very first oil painting when I was 14 years old. Still very proud of it!",
    icon: "🎨",
  },
  {
    id: 6,
    src: "/haiway.png",
    title:
      "Adventuring through KaoHsiung, Taiwan with my partner-in-crime, Haiway! 🚀 Need recos for next stop! ",
    icon: "🎨",
  },
];

const PhotoGallery = () => {
  // Define all hooks at the top level in the same order for every render
  const [mounted, setMounted] = useState(false);
  const controls = useAnimationControls();
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Constants
  const photoGap = 50;
  const maxPhotoWidth = 416;

  // Safe window access
  const getTotalWidth = useCallback(() => {
    if (typeof window === 'undefined') return maxPhotoWidth + photoGap;
    const width = Math.min(maxPhotoWidth, window.innerWidth * 0.8);
    return width + photoGap;
  }, []);

  // Handle auto-scrolling
  const scrollToNext = useCallback(() => {
    if (!mounted) return;
    
    const nextIndex = (currentIndex + 1) % photos.length;
    const currentTotalWidth = getTotalWidth();

    controls.start({
      x: -currentTotalWidth * nextIndex,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    });

    setCurrentIndex(nextIndex);
  }, [currentIndex, controls, mounted, getTotalWidth]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up auto-scroll interval
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(scrollToNext, 3000);
    return () => clearInterval(interval);
  }, [scrollToNext, mounted]);

  // Don't render during SSR to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={containerRef}>
      <motion.div
        className="flex h-full items-center"
        animate={controls}
        drag="x"
        dragConstraints={containerRef}
        style={{
          paddingLeft: "50%",
          marginLeft: `calc(-1 * min(${maxPhotoWidth}px, 80vw) / 2)`,
          gap: `${photoGap}px`,
        }}
        onDragEnd={(_, info) => {
          const dragDistance = info.offset.x;
          const currentTotalWidth = getTotalWidth();

          if (Math.abs(dragDistance) > currentTotalWidth / 5) {
            const direction = dragDistance > 0 ? -1 : 1;
            const nextIndex =
              (currentIndex + direction + photos.length) % photos.length;
            setCurrentIndex(nextIndex);
            controls.start({
              x: -currentTotalWidth * nextIndex,
              transition: { duration: 0.5, ease: "easeOut" },
            });
          } else {
            controls.start({
              x: -currentTotalWidth * currentIndex,
              transition: { duration: 0.5, ease: "easeOut" },
            });
          }
        }}
      >
        {[...photos, ...photos].map((photo, index) => (
          <motion.div
            key={`${photo.id}-${index}`}
            className={`relative flex-shrink-0 bg-white rounded-sm shadow-lg h-fit  ${
              index % 2 === 0 ? "rotate-2" : "-rotate-2"
            }`}
            style={{
              padding: "12px 12px 20px 12px",
              width: "min(400px, 80vw)",
            }}
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '3/4' }}>
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
                priority={index < 3} // Only preload first few images
              />
            </div>

            {/* Caption */}
            <p
              className={`${kalam.className} text-center mt-4 text-md text-gray-800`}
            >
              {photo.title}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoGallery;
