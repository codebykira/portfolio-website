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
  /** Override the card max width (default "w-full" — fills its container). */
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
  /** Nudge the reveal-on-hover image right/down (pl-8 / pb-8 style) so it
      crops off the bottom-right corner of the card. */
  mediaOffset?: boolean;
  /** Centre the reveal-on-hover image instead of bleeding it off the right. */
  mediaCenter?: boolean;
  /** Fill behind the logo tile (defaults to the translucent black). */
  logoBgColor?: string;
  /** Width of the reveal-on-hover image relative to the card (default "97%",
      or "130%" when centred). Values over 100% crop against the card edges. */
  mediaWidth?: string;
  /** Frame a stacked image with a translucent white border instead of the dot grid. */
  bordered?: boolean;
  /** Lay the header out as title-left / description-right (title sized to content). */
  splitHeader?: boolean;
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
  widthClass = "w-full",
  stacked = false,
  imageScale = 1,
  mediaAspect,
  revealOnHover = false,
  mediaOffset = false,
  mediaCenter = false,
  mediaWidth,
  logoBgColor,
  bordered = false,
  splitHeader = false,
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

  // drop-shadow (not box-shadow) so the glow traces the image's alpha — the
  // phone silhouettes — rather than its bounding box.
  const revealMediaFilter =
    "transition-[filter] duration-300 ease-out drop-shadow-[0_0_40px_rgba(0,0,0,0.55)] group-hover:brightness-[0.55]";

  // Media fills the card; the logo stays visible, and title/description/tags
  // fade in over a scrim on hover.
  if (revealOnHover) {
    return (
      <div
        className={`group relative ${heightClass} ${widthClass} overflow-hidden rounded-3xl bg-white/5 text-white/70 project-card shadow-[0_8px_32px_rgba(0,0,0,0.37)]`}
      >
        {/* Media fills the card; with mediaOffset it shifts right/down so the
            bottom-right corner crops off the card edge. The image darkens on
            hover so the overlay text stays readable. */}
        <div className="absolute inset-0">
          {!media && images[0] && (mediaOffset || mediaCenter) ? (
            /* Natural-aspect screenshot over a dot grid, anchored to the
               bottom-right and bleeding off the right/bottom card edges. */
            <>
              <div
                className="absolute inset-0 dot-grid-static"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(252, 247, 233, 0.18) 1px, transparent 1.1px)",
                  backgroundSize: "14px 14px",
                }}
              />
              {/* Lifts and grows a touch on hover, anchored at the bottom so
                  the screenshot rises out of the card rather than drifting. */}
              <div
                className={`absolute bottom-0 max-w-none origin-bottom transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-[1.03] ${
                  mediaCenter ? "left-1/2 -translate-x-1/2" : "-right-24"
                }`}
                style={{ width: mediaWidth ?? (mediaCenter ? "130%" : "97%") }}
              >
                {images.length > 1 ? (
                  // Multiple shots (e.g. phone screens) sit in a centred row.
                  <div className="mb-[8vh] flex items-end justify-center gap-6">
                    {images.map((img, i) => (
                      <Image
                        key={i}
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes="450px"
                        className={`h-[56vh] w-auto rounded-2xl ${revealMediaFilter}`}
                      />
                    ))}
                  </div>
                ) : (
                  <Image
                    src={images[0].src}
                    alt={images[0].alt}
                    width={images[0].width}
                    height={images[0].height}
                    sizes="900px"
                    className={`h-auto w-full rounded-2xl ${revealMediaFilter}`}
                  />
                )}
              </div>
            </>
          ) : media ? (
            media
          ) : images[0] ? (
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              sizes="900px"
              className="object-cover transition-[filter] duration-300 ease-out group-hover:brightness-[0.55]"
            />
          ) : null}
        </div>

        {/* Hover overlay: logo + title + description + tags */}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          {/* Negative margin pulls the description up to the title without
              closing the gaps between paragraphs and tags. */}
          <div className="-mb-2 flex items-center gap-3">
            {logo && (
              <div
                className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/25 backdrop-blur-sm"
                style={logoBgColor ? { backgroundColor: logoBgColor } : undefined}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 48}
                  height={logo.height || 48}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          {description.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed">
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
        <div className={`${stacked ? "shrink-0" : "flex-1"} max-sm:mb-4 p-6`}>
          <div
            className={
              splitHeader
                ? "flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10"
                : "space-y-4"
            }
          >
            {/* Title (logo + name) — sized to its content in split mode */}
            <div className="flex items-center gap-4 shrink-0">
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

            {/* Description + tags — capped width on the right in split mode */}
            <div className={`space-y-4 ${splitHeader ? "sm:max-w-2xl" : ""}`}>
              {description.map((paragraph, index) => (
                <p key={index} className="last:mb-0">
                  {paragraph}
                </p>
              ))}

              {tags.length > 0 && (
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
              )}
            </div>
          </div>
        </div>

        {/* Screenshots / custom media (e.g. a 3D canvas) */}
        {stacked && !media ? (
          // Stacked media flows below the text at natural height (no fixed band)
          // so the card grows and nothing overlaps. One wide image goes full
          // width; multiple (e.g. phone shots) sit in a centred row.
          <div className="w-full shrink-0 px-6 pb-6">
            {/* Backdrop: translucent white frame, or the static dot grid */}
            <div
              className={
                bordered
                  ? "overflow-hidden rounded-2xl border-4 border-white/25"
                  : "dot-grid-static rounded-2xl p-4"
              }
            >
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
