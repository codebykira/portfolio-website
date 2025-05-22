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
        <ChillHangouts />
        <WaverlyShowcase />
        <Linkflo />
      </div>
    </div>
  );
};

export default Work;
