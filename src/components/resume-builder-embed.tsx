"use client";

/**
 * Live preview of the résumé builder for the Work section: the Claude-styled
 * full-stack résumé in `?embed=1` mode, which drops the toolbar and renders
 * the template read-only. pointer-events are disabled so a click falls through
 * to the card's link to the full /resume experience.
 */

/** The sheet is a fixed 8.5in (816px) wide, so the iframe needs a logical
 *  viewport a little wider than that for it to fit without cropping. At a
 *  ~420px card, 1/0.48 puts the viewport near 875px. Lower = more zoomed out. */
const SCALE = 0.66;

export default function ResumeBuilderEmbed() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EDEFF3] pointer-events-none">
      <iframe
        src="/resume?theme=claude&role=fullstack&embed=1"
        title="Résumé builder — drop your résumé to restyle it"
        loading="lazy"
        scrolling="no"
        aria-hidden
        className="absolute left-0 top-0 border-0"
        style={{
          width: `${100 / SCALE}%`,
          height: `${100 / SCALE}%`,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
