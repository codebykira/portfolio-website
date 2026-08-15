import React from "react";
import Image from "next/image";

interface ProjectHoverCardProps {
  title: string;
  description: string[];
  /** Visual filling the card, usually an embedded live preview. */
  media: React.ReactNode;
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  /** Override the card height (default "h-[42vh]"). */
  heightClass?: string;
}

/**
 * Compact project card for the side-by-side slots: the media fills the card
 * and the text rides over a scrim on hover. Type is a size down from the full
 * -width ProjectShowcase cards so it still fits at half width.
 */
const ProjectHoverCard: React.FC<ProjectHoverCardProps> = ({
  title,
  description,
  media,
  logo,
  heightClass = "h-[42vh]",
}) => (
  <div
    className={`group relative ${heightClass} w-full overflow-hidden rounded-3xl bg-white/5 text-white/70 project-card shadow-[0_8px_32px_rgba(0,0,0,0.37)]`}
  >
    <div className="absolute inset-0 transition-[filter] duration-300 ease-out group-hover:brightness-[0.55]">
      {media}
    </div>

    <div className="absolute inset-0 flex flex-col justify-end gap-1 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
      <div className="-mb-1 flex items-center gap-2.5">
        {logo && (
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/25 backdrop-blur-sm">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width || 48}
              height={logo.height || 48}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {description.map((paragraph, index) => (
        <p key={index} className="text-sm leading-snug">
          {paragraph}
        </p>
      ))}
    </div>
  </div>
);

export default ProjectHoverCard;
