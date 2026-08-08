"use client";

/**
 * Live preview of the résumé builder for the Work section. Embeds the plain
 * résumé in `?embed=1` mode (no toolbar, whole sheet auto-fit to the frame),
 * showing the centered "drop your résumé to restyle it" prompt over the blurred
 * original. pointer-events are disabled so a click falls through to the card's
 * link to the full /resume experience.
 */
export default function ResumeBuilderEmbed() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EDEFF3] pointer-events-none">
      <iframe
        src="/resume?theme=plain&embed=1"
        title="Résumé builder — drop your résumé to restyle it"
        loading="lazy"
        scrolling="no"
        aria-hidden
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
