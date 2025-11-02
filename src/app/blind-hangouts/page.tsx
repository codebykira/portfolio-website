"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gloria_Hallelujah, Aladin, Caveat, Sora } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import FontCycleText from "../../components/FontCycleText";
import { yellowHighlightAnimation, textColorAnimation } from "../../components/animations";

const gloriaHallelujah = Gloria_Hallelujah({
  weight: "400",
  subsets: ["latin"],
});

const sora = Sora({
  weight: "400",
  subsets: ["latin"],
});

const aladin = Aladin({
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  weight: "400",
  subsets: ["latin"],
});


// Reusable handwritten text style
const handwrittenStyle = `text-base text-gray-600 ${caveat.className} -rotate-3`;



export default function BlindHangoutsPage() {
  const thisOrThatVideoRef = useRef<HTMLVideoElement>(null);
  const vibeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const thisOrThatVideo = thisOrThatVideoRef.current;
    const vibeVideo = vibeVideoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (thisOrThatVideo) observer.observe(thisOrThatVideo);
    if (vibeVideo) observer.observe(vibeVideo);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-[#F7EED7] via-[#F7EED7] to-white pt-16">
        <div className="max-w-4xl mx-auto px-8">
          {/* Logo and Title */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 relative">
              <Image
                src="/chillhangouts-logo.png"
                alt="Blind Hangouts Logo"
                width={48}
                height={48}
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-black">Blind Hangouts</h1>
          </div>

          {/* Hero Content */}
          <div className="text-center">
            <h2 className={`text-3xl font-bold text-black ${aladin.className}`}>
              Your next favorite hangout, planned for you.
            </h2>
            <p>
              We learn what you like, add a playful twist, and make the plan happen.
            </p>
            <p>
              So you can spend good times with the people who matter most.
            </p>
          </div>

          {/* Screenshots */}
          <div className="flex justify-center overflow-hidden">
            <Image
              src="/screenshots.png"
              alt="Blind Hangouts Screenshots"
              width={1800}
              height={650}
              className="object-cover scale-110"
              priority
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto px-8 lg:px-20 space-y-6 lg:space-y-2 my-20 ">

        {/* First Section - Problem Introduction */}

        <motion.p {...textColorAnimation}>
          Why does it feel so hard for our generation to truly <FontCycleText className="font-bold">connect</FontCycleText> in person?
        </motion.p>
        <motion.p {...textColorAnimation}>
          At first, I thought it was just logistics.<motion.span className="inline-block" {...yellowHighlightAnimation}><Image src="/calendar.svg" alt="calendar" width={30} height={20} className="inline object-contain" /></motion.span>The endless group chats, the back and forth of “when are you free?” It felt like we were all trapped in our calendars.

        </motion.p>

        <div className="flex flex-row items-center">
          <div className="flex-1 flex flex-col justify-center">

            <motion.p {...textColorAnimation}>
              So I built <strong>Chill Hangouts</strong>. An app that made scheduling effortless. Drop in your calendar, find the gaps, pick things to do, and boom <motion.span className="inline-block" {...yellowHighlightAnimation}><Image src="/boom.svg" alt="boom" width={40} height={20} className="inline object-contain" /></motion.span> plans are set.
            </motion.p>

            <motion.span className="absolute inset-0 -z-10" {...yellowHighlightAnimation}>
              <Image src="/yellow-highlight.svg" alt="highlight" width={60} height={25} className="object-contain w-full h-full" />
            </motion.span>

          </div>


          {/* Phone screenshots with arrow and text */}
          <div className="flex-1 relative flex justify-center">
            <div className="relative">

              {/* Bigger phone screenshot */}
              <div className="flex flex-row">
                <motion.div
                  initial={{ rotate: 0, x: 50 }}
                  whileInView={{ rotate: -1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <img
                    src="/ch-1.png"
                    alt="Chill Hangouts App Screenshot"
                    width={150}
                    height={300}
                  />
                </motion.div>
                <motion.div
                  initial={{ rotate: 0, x: -50 }}
                  whileInView={{ rotate: 6, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <img
                    src="/ch-2.png"
                    alt="Chill Hangouts App Screenshot"
                    width={140}
                    height={300}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Section - Realization */}


        <motion.p {...textColorAnimation}>
          But when I finally solved the when, I realized the real problem wasn’t time.
        </motion.p>

        <div className="flex flex-row gap-2 lg:gap-6">
          <img
            src="/alone.png"
            alt="Chill Hangouts App Screenshot"
            className="w-32 md:w-36 lg:w-44 aspect-auto object-contain"
          />
          <div className="flex flex-col  space-y-2">
            <div className="flex flex-col space-y-2">
              <motion.p {...textColorAnimation}>
                It was<span
                  className="relative inline-block px-2 py-1"
                  style={{
                    backgroundImage: 'url(/highlighter.png)',
                    backgroundSize: '120% 150%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                >
                  <strong>fear</strong>
                </span>.
              </motion.p>
              <motion.p {...textColorAnimation}>
                Fear of being the one who reaches out. Fear of picking the wrong place. Fear that no one will show up.
              </motion.p>
              <motion.p {...textColorAnimation}>
                We all want to feel close, but no one wants to risk being the one who tries first. <motion.span className="inline-block" {...yellowHighlightAnimation}><Image src="/sad.svg" alt="sad" width={30} height={20} className="inline object-contain" /></motion.span>
              </motion.p>
              <motion.p {...textColorAnimation}>
                That's the part no calendar could fix.
              </motion.p>
            </div>
          </div>
        </div>


        <p className={`text-xl text-gray-700 ${caveat.className}`}>
          {["So", "what", "if", "someone", "just", "planned", "it", "for", "you?"].map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3
              }}
              viewport={{ once: true, amount: 0.3, margin: "-25% 0px -25% 0px" }}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </p>
        <motion.p {...textColorAnimation}>
          That's how Blind Hangouts was born. An AI that actually gets you and makes the plan.
        </motion.p>


        {/* Third Section - Solution */}

        <div className="flex flex-col lg:-space-y-10">
          <div className="flex items-center justify-start relative">
            {/* This or That Game Video - Centered */}
            <div className="flex flex-row">
              <div className="w-48 h-[300px] md:w-56 md:h-[400px] lg:w-64 lg:h-[500px] overflow-hidden">
                <video
                  ref={thisOrThatVideoRef}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  src="/this-or-that.mp4"
                  style={{
                    aspectRatio: '9/16',
                    objectPosition: 'center center'
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <motion.div
                  className="absolute -top-6 lg:top-1 lg:right-1/2 -right-6"
                  {...yellowHighlightAnimation}
                >
                  <Image
                    src="/Highlight_10.svg"
                    alt="Highlight"
                    width={120}
                    height={80}
                    className="object-contain"
                  />
                </motion.div>
              </div>

              {/* Arrow and text - Absolutely positioned */}
              <div className="mt-0 md:mt-24 lg:mt-36 flex flex-row items-center gap-2 lg:gap-6">
                <motion.div className="flex items-center justify-start" {...yellowHighlightAnimation}>
                  <Image
                    src="/arrow16.svg"
                    alt="Arrow pointing to text"
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </motion.div>

                <div className="flex flex-col w-40 md:w-56 lg:w-56 gap-3">
                  <motion.p {...textColorAnimation}>
                    It starts with a mini game of <strong>This or That</strong> to learn what users like to do.
                  </motion.p>
                  <motion.p {...textColorAnimation}>
                    Instead of a typical onboarding survey, it's a fun, engaging way to learn about you.
                  </motion.p>
                </div>

              </div>
            </div>
          </div>

          <div className="flex items-center justify-end relative flex-row">
            {/* Choose Vibe */}



            {/* Arrow and text - Absolutely positioned */}
            <div className="top-1/2 left-1 flex flex-row items-center gap-2 lg:gap-6">


              <div className="flex flex-col w-48 gap-3">
                <motion.p {...textColorAnimation}>
                  Pick your friends, vibe, and time and we'll decide what happens in real life.
                </motion.p>
              </div>
              <motion.div className="flex items-center justify-start" {...yellowHighlightAnimation}>
                <Image
                  src="/arrow16.svg"
                  alt="Arrow pointing to text"
                  width={60}
                  height={60}
                  className="object-contain scale-x-[-1]"
                />
              </motion.div>
            </div>
            <div className="w-48 h-[300px] md:w-56 md:h-[400px] lg:w-64 lg:h-[500px] overflow-hidden">
              <video
                ref={vibeVideoRef}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                src="/vibe.mp4"
                style={{
                  aspectRatio: '9/16',
                  objectPosition: 'center center'
                }}
                onLoadedMetadata={() => {
                  if (vibeVideoRef.current) {
                    vibeVideoRef.current.currentTime = 2;
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
        {/* Fourth Section - AI Benefits */}

        <motion.p {...textColorAnimation}>
          The AI takes care of the planning and booking, so all you have to do is show up and enjoy time with people you love. <motion.span className="inline-block" {...yellowHighlightAnimation}><Image src="/heart.svg" alt="heart" width={30} height={20} className="inline object-contain" /></motion.span>
        </motion.p>
        <motion.p {...textColorAnimation}>
        I believe social networks should do more than keep us scrolling. They should bring us closer. Blind Hangouts is my way of bringing us back to what matters most.
        </motion.p>

<div className="relative inline-block">
<motion.p 
  className={`${caveat.className} text-xl -rotate-1 text-md text-gray-500`}
  initial={textColorAnimation.initial}
  whileInView={textColorAnimation.whileInView}
  transition={textColorAnimation.transition}
  viewport={textColorAnimation.viewport}
>
Real moments with real people.
</motion.p>

<motion.div 
  className="absolute w-full flex justify-start"
  {...yellowHighlightAnimation}
>
  <Image 
    src="/underline02.svg" 
    alt="underline" 
    width={250} 
    height={20} 
    className="object-contain" 
  />
</motion.div>
</div>

        {/* Navigation back */}
        <div className="pt-16 lg:pt-40 pb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}