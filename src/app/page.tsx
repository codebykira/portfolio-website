"use client";
import DeskHero from "@/app/DeskHero";
import Navigation from "@/components/tab-scroller";
import Work from "@/app/Work";
import Projects from "@/app/Projects";
import ContactPage from "@/components/connect";
import Story from "@/app/Story";
import ClientOnly from "@/components/ClientOnly";
import SectionHeader from "../components/section-header";
import AnimatedContent from "../components/AnimatedContent";
import StickerPeel from "../components/StickerPeel";
import RotateHint from "../components/RotateHint";

export default function Home() {
  return (
    <main className="ds-page w-full mx-auto flex flex-col gap-6 pb-10 bg-[var(--ds-bg)]">
      <ClientOnly>
        <Navigation />
      </ClientOnly>
      <ClientOnly>
        <DeskHero />
      </ClientOnly>
      <RotateHint />
      <div className="max-w-7xl mx-auto flex flex-col gap-6 justify-center">

        {/* Blurb bridging the hero into the work — section-header font (Playfair).
            Only the text fades in on scroll; the sticker stays full-opacity. */}
        <div className="relative mx-auto w-full max-w-4xl flex justify-center px-4 pt-6 pb-24 md:px-0 md:pt-8 md:pb-24">
          {/* The blurb is hidden on a phone: the vertical desk already fills
              the screen, and the line under it just pushed the work further
              down. The sticker stays. */}
          <AnimatedContent
            className="max-sm:hidden"
            distance={120}
            direction="vertical"
            duration={1.2}
            ease="easeOut"
            initialOpacity={0}
            animateOpacity
            threshold={0.2}
            delay={0.1}
          >
            <h2 className="max-w-3xl text-center text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter leading-[1.15] text-balance">
              Builds with care.{" "}
              <span className="text-white/40">
                In the pixels, the pauses, the parts no one asked about.
              </span>
            </h2>
          </AnimatedContent>
          {/* Draggable, peelable cat sticker tucked into the corner. */}
          <ClientOnly>
            <StickerPeel
              imageSrc="/cat-sticker.png"
              width={190}
              rotate={-14}
              shadowIntensity={0.4}
              className="sticker-compact -right-1 top-auto -bottom-4 md:-right-8 md:top-24 md:bottom-auto"
            />
          </ClientOnly>
        </div>

        <SectionHeader title="Work" subtitle="Recent" />

        <Work />
        {/* <Writing /> */}
        <div className="pt-16 md:pt-24">
          <SectionHeader title="Projects" subtitle="Made for fun 🐈" />
        </div>

        <Projects />

        <div className="pt-16 md:pt-24">
          <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
        </div>
        <Story />
        <ContactPage />
      </div>
    </main>
  );
}
