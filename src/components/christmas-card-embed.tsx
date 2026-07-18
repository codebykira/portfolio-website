"use client";

/**
 * Embeds the live christmas-cards-web site so the 3D tree spins in place.
 * The iframe is oversized and shifted so the visible window sits exactly on the
 * tree — cropping out the site's own text (the "Happy New Year" title above and
 * the message form below) with no gradient overlay. pointer-events are disabled
 * so a click falls through to the card's link. Pairs with a ~45vh card height.
 */
export default function ChristmasCardEmbed() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black pointer-events-none">
      <iframe
        src="https://christmas-cards-web.vercel.app/"
        title="Interactive 3D Christmas tree"
        loading="lazy"
        scrolling="no"
        className="absolute left-1/2 top-0 border-0"
        style={{ width: "520px", height: "760px", transform: "translate(-50%, -125px)" }}
      />
    </div>
  );
}
