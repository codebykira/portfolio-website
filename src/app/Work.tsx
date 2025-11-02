import React from "react";
import ChillHangouts from "../components/chill-hangouts";
import { WaverlyShowcase } from "../components/waverly1";
import Linkflo from "../components/linkflo";
import SectionHeader from "../components/section-header";

const Work = () => {
  return (
    <div id="work" className="min-h-screen">
      {/* Header */}
      <div className="max-sm:px-2 md:px-8 ">
        <SectionHeader title="Work" />
      </div>
      <div className="space-y-6 flex flex-col items-center px-4 md:px-8 max-sm:px-2">
        <ChillHangouts 
          title="Blind Hangouts"
          description={[
            "Forget the “what should we do?” group chat that goes nowhere.",
            "The awkward “coffee or something?” first dates.",
            "The reunion that’s been stuck on venue talk for months.",
            "I’m building Blind Hangouts, an AI that plans your social life for you.",
            "No more endless texting or decision fatigue. Just show up and enjoy time with people who matter. Dinner, adventure, or chill night, the app figures it out based on what you love."
          ]}
          images={[
            {
              src: "/bh-1.png",
              alt: "Blind Hangouts App Screenshot 1",
              width: 300,
              height: 600
            },
            {
              src: "/bh-2.png", 
              alt: "Blind Hangouts App Screenshot 2",
              width: 300,
              height: 600
            }
          ]}
          logo={{
            src: "/chillhangouts-logo.png",
            alt: "Blind Hangouts Logo",
            width: 48,
            height: 48
          }}
          gradientColor="#F7EED7"
          onClick={() => window.location.href = '/blind-hangouts'}
        />
        <WaverlyShowcase />
        <Linkflo />
      </div>
    </div>
  );
};

export default Work;
