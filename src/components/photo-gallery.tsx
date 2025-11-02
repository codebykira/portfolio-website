import React, { useRef, useEffect, useState } from "react";
import { Kalam } from "next/font/google";
import Image from "next/image";
import { motion, useAnimationControls } from "framer-motion";
import { useCallback } from "react";
import { textColorAnimation } from "./animations";

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

const PhotoGallery = () => {
  const controls = useAnimationControls();
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use a percentage of viewport width instead of fixed pixels
  const photoGap = 50;
  const maxPhotoWidth = 416;

  // Calculate totalWidth based on current viewport
  const getTotalWidth = () => {
    // Use min to cap at 416px on larger screens
    const width = Math.min(maxPhotoWidth, window.innerWidth * 0.8);
    return width + photoGap;
  };

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

  const scrollToNext = useCallback(async () => {
    const nextIndex = (currentIndex + 1) % photos.length;
    const currentTotalWidth = getTotalWidth();

    await controls.start({
      x: -currentTotalWidth * nextIndex,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    });

    setCurrentIndex(nextIndex);
  }, [currentIndex, controls, photos.length]);

  useEffect(() => {
    const interval = setInterval(scrollToNext, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, scrollToNext]);

  return (
    <div className="overflow-hidden w-full" ref={containerRef}>
      <motion.div
        className="flex"
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
              width: "min(416px, 80vw)",
            }}
          >
            {/* Image */}
            <div className="relative overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.title}
                width={400}
                height={450}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Caption */}
            <motion.p
              className={`${kalam.className} text-center mt-4`}
              {...textColorAnimation}
            >
              {photo.title}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoGallery;
