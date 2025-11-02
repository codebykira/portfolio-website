import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const WaverlyShowcase = () => {
  return (
    <motion.div
      className="h-[70vh] max-w-screen-xl overflow-hidden p-8 rounded-3xl bg-gray-100 max-sm:h-2/3"
      initial={{
        background:
          "linear-gradient(45deg, #F5F5F5 0%, #F5F5F5 40%, #F5F5F5 100%)",
      }}
      whileHover={{
        background:
          "linear-gradient(45deg, transparent 0%, transparent 40%, #FEBA4F 100%)",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="mx-auto mb-8 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-xl font-bold">Linkflo</h1>
        </div>

        <p>
          At Included VC, I built Linkflo to make investor matchmaking smarter.
          Using GPT-4 and custom LLMs, it analyzed investment theses and AUM
          requirements to pair GPs and LPs more accurately.
        </p>
        <p>
          In the first month, it improved matching by 35% and led to five
          successful introductions—seeing AI make real connections was
          incredible!
        </p>
      </div>

      {/* Screenshots Section */}
      <motion.div
        className="max-w-6xl mx-auto relative cursor-pointer"
        whileHover={{ y: -60, scale: 1.05 }}
      >
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-row justify-between py-20 overflow-visible max-sm:flex-col max-sm:justify-center max-sm:py-0">
            {/* First Screenshot */}
            <motion.div
              className="transform -rotate-12 overflow-hidden rounded-xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src="/linkflo1.png"
                alt="Waverly Community Feed"
                className="w-full h-auto"
                width={1500}
                height={1200}
              />
            </motion.div>

            {/* Second Screenshot */}
            <motion.div
              className="overflow-hidden transform rotate-3 shadow-sm rounded-xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src="/linkflo2.png"
                alt="Waverly Community Feed"
                className="w-full  h-auto"
                width={1500}
                height={1200}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WaverlyShowcase;
