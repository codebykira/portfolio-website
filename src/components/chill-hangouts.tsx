import React from "react";
import { motion } from "framer-motion";
import ProjectScreenshots from "./project-screenshot";

interface ProjectDetails {
  title: string;
  description?: string[];
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  gradientColor?: string;
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  onClick?: () => void;
}

const ChillHangouts: React.FC<ProjectDetails> = ({
  title,
  description = [],
  images,
  gradientColor = "#FEBA4F",
  logo,
  onClick,
}) => {
  return (
    <motion.div
      className={`h-[85vh] max-w-screen-xl overflow-hidden p-6 rounded-3xl bg-gray-100 max-sm:h-2/3 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      initial={{
        background:
          "linear-gradient(45deg, #F5F5F5 0%, #F5F5F5 40%, #F5F5F5 100%)",
      }}
      whileHover={{
        background: `linear-gradient(45deg, transparent 0%, transparent 40%, ${gradientColor} 100%)`,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Section */}
      <div className="mx-auto mb-8 max-sm:mb-0">
        <div className="flex items-center gap-4 mb-6">
          {logo && (
            <div className="w-12 h-12 relative">
              <img
                src={logo.src}
                alt={logo.alt}
                className="object-contain w-full h-full"
                width={logo.width}
                height={logo.height}
              />
            </div>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {description.map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Screenshots Section */}
      <ProjectScreenshots images={images} />
    </motion.div>
  );
};

export default ChillHangouts;
