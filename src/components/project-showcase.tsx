import React from "react";
import Image from "next/image";
import ProjectScreenshots from "./project-screenshot";

interface ProjectDetails {
  title: string;
  description: string[];
  images?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  /** Custom visual for the showcase slot (e.g. a 3D canvas); overrides `images`. */
  media?: React.ReactNode;
  gradientColor?: string;
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  tags?: Array<{emoji: string; label: string}> | string[];
  /** Override the card height (default "h-[45vh]"). Use "h-auto" to fit content. */
  heightClass?: string;
  /** Override the card max width (default "max-w-4xl"). */
  widthClass?: string;
  /** Stack the media below the text instead of beside it. */
  stacked?: boolean;
  /** Scale factor for a single stacked image (1 = full panel width). */
  imageScale?: number;
  /** Crop a single stacked image to this aspect ratio (e.g. "16/7") to trim
      transparent top/bottom margins. Omit to show the image uncropped. */
  mediaAspect?: string;
  /** Show only the media by default; reveal the text overlay on hover. */
  revealOnHover?: boolean;
}

const ProjectShowcase: React.FC<ProjectDetails> = ({
  title,
  description,
  images = [],
  media,
  gradientColor = "#FEBA4F",
  logo,
  tags = [],
  heightClass = "h-[45vh]",
  widthClass = "max-w-4xl",
  stacked = false,
  imageScale = 1,
  mediaAspect,
  revealOnHover = false,
}) => {
  const tagList = tags.length > 0 && (
    <div className="flex flex-wrap">
      {tags.map((tag, index) => (
        <span key={index} className="glass-tag">
          {typeof tag === "string" ? (
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
  );

  // Media fills the card; the logo stays visible, and title/description/tags
  // fade in over a scrim on hover.
  if (revealOnHover) {
    return (
      <div
        className={`group relative ${heightClass} ${widthClass} overflow-hidden rounded-3xl bg-white/5 text-white/70 project-card shadow-[0_8px_32px_rgba(0,0,0,0.37)]`}
      >
        {/* Media fills the card */}
        <div className="absolute inset-0">
          {media ? (
            media
          ) : images[0] ? (
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              sizes="900px"
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Persistent logo — always visible */}
        {logo && (
          <div className="absolute left-4 top-4 z-10 h-11 w-11 overflow-hidden rounded-xl border border-white/15 bg-black/25 backdrop-blur-sm">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width || 48}
              height={logo.height || 48}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Hover overlay: title + description + tags */}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {description.map((paragraph, index) => (
            <p key={index} className="text-sm">
              {paragraph}
            </p>
          ))}
          {tagList}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${heightClass} ${widthClass} overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md text-white/70 max-sm:h-2/3 project-card shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-colors duration-300 ease-out hover:bg-white/10`}
    >
      <div className={`flex gap-4 ${stacked ? "flex-col" : "flex-row h-full max-sm:flex-col items-center"}`}>
        {/* Header Section */}
        <div className={`${stacked ? "shrink-0" : "flex-1"} max-sm:mb-4 p-6 space-y-4`}>
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

        {/* Screenshots / custom media (e.g. a 3D canvas) */}
        {stacked && !media ? (
          // Stacked media flows below the text at natural height (no fixed band)
          // so the card grows and nothing overlaps. One wide image goes full
          // width; multiple (e.g. phone shots) sit in a centred row.
          <div className="w-full shrink-0 px-6 pb-6">
            {/* Static dot grid backdrop behind the screenshots */}
            <div className="dot-grid-static rounded-2xl p-4">
              {images.length > 1 ? (
                <div className="flex justify-center items-end gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        className="h-auto w-full max-w-[220px]"
                      />
                    </div>
                  ))}
                </div>
              ) : images[0] ? (
                <div
                  className="overflow-hidden rounded-xl"
                  style={{
                    ...(imageScale !== 1
                      ? { width: `${imageScale * 100}%`, marginLeft: `${-(imageScale - 1) * 50}%` }
                      : {}),
                    ...(mediaAspect ? { aspectRatio: mediaAspect } : {}),
                  }}
                >
                  <Image
                    src={images[0].src}
                    alt={images[0].alt}
                    width={images[0].width}
                    height={images[0].height}
                    className={mediaAspect ? "w-full h-full object-cover" : "w-full h-auto"}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={stacked ? "w-full h-[38vh] shrink-0 px-6 pb-6" : "flex-1 h-full"}>
            {media ?? <ProjectScreenshots images={images} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectShowcase;
