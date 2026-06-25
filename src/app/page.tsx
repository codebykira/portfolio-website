"use client";
import DeskHero from "@/app/DeskHero";
import Navigation from "@/components/tab-scroller";
import Work from "@/app/Work";
import ContactPage from "@/components/connect";
import Story from "@/app/Story";
import ClientOnly from "@/components/ClientOnly";
import SectionHeader from "../components/section-header";

export default function Home() {
  const noop = () => {};

  return (
    <main className="ds-page w-full mx-auto flex flex-col gap-6 pb-10 bg-[var(--ds-bg)]">
      <ClientOnly>
        <Navigation />
      </ClientOnly>
      <ClientOnly>
        <DeskHero />
      </ClientOnly>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 justify-center">

        <SectionHeader title="Work" subtitle="Recent" />

        <Work
          onProjectEnter={noop}
          onProjectLeave={noop}
        />
        {/* <Writing /> */}
        <SectionHeader title="Story" subtitle="Artist on the Move 🌍" />
        <Story />
        <ContactPage />
      </div>
    </main>
  );
}
