"use client";

import React from "react";
import Image from "next/image";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface FeaturedImageGalleryProps {
  images: GalleryImage[];
  /** Where the thumbnail strip floats over the hero image. */
  thumbPosition?: "top-right" | "bottom";
}

/**
 * A featured-image gallery: one large hero image with a strip of selectable
 * thumbnails. Fills its parent (use inside a positioned container). The strip
 * sits above any hover scrim (z-30) and stops click propagation so it can live
 * inside a card that navigates on click without triggering that navigation.
 */
export default function FeaturedImageGallery({
  images,
  thumbPosition = "top-right",
}: FeaturedImageGalleryProps) {
  const [active, setActive] = React.useState(0);

  if (images.length === 0) return null;

  const activeImage = images[active] ?? images[0];

  const stripPositionClass =
    thumbPosition === "bottom"
      ? "bottom-4 left-1/2 -translate-x-1/2"
      : "right-4 top-4";

  return (
    <div className="relative h-full w-full p-3">
      {/* Hero image — inset a touch and lifted with a soft shadow */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.55)]">
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="1024px"
          className="object-cover"
        />
      </div>

      {/* Thumbnail strip — above the hover scrim so it stays visible/clickable */}
      {images.length > 1 && (
        <div className={`absolute z-30 flex gap-2 ${stripPositionClass}`}>
          {images.map((img, index) => (
            <button
              key={img.src}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive(index);
              }}
              aria-label={`Show ${img.alt}`}
              aria-pressed={index === active}
              className={`relative h-12 w-16 overflow-hidden rounded-lg border bg-black/25 backdrop-blur-sm transition-opacity ${
                index === active
                  ? "border-white/80 opacity-100"
                  : "border-white/20 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
