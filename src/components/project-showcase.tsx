import React from "react";
import Image from "next/image";
import ProjectScreenshots from "./project-screenshot";

interface ProjectDetails {
  title: string;
  description: string[];
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
  tags?: Array<{emoji: string; label: string}> | string[];
}

const ProjectShowcase: React.FC<ProjectDetails> = ({
  title,
  description,
  images,
  gradientColor = "#FEBA4F",
  logo,
  tags = [],
}) => {
  return (
    <div
      className="h-[45vh] max-w-4xl overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-white/70 max-sm:h-2/3 project-card"
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)' }}
    >
      <div className="flex flex-row gap-4 h-full max-sm:flex-col items-center">
        {/* Header Section */}
        <div className="flex-1 max-sm:mb-4 p-6 space-y-4">
          <div className="flex items-center gap-4">
            {logo && (
              <div className="w-12 h-12 relative overflow-hidden rounded-xl">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  className="object-contain w-full h-full"
                  width={logo.width || 48}
                  height={logo.height || 48}
                />
              </div>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
          </div>

          {description.map((paragraph, index) => (
            <p key={index} className="last:mb-0">
              {paragraph}
            </p>
          ))}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap">
              {tags.map((tag, index) => (
                <span key={index} className="glass-tag">
                  {typeof tag === 'string' ? (
                    tag
                  ) : (
                    <>
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Screenshots Section */}
        <div className="flex-1">
          <ProjectScreenshots images={images} />
        </div>
      </div>
    </div>
  );
};

export default ProjectShowcase;
