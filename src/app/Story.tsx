import React from "react";
import { motion } from "framer-motion";
import ClientOnly from "../components/ClientOnly";
import StickerPeel from "../components/StickerPeel";

/** One continuous sheet of paper holding all five cards, dropped at
 *  irregular positions. Cards and stickers are both placed as percentages of
 *  the sheet, so nothing lines up and the arrangement holds as it scales. */
const CARDS = [
  {
    src: "/harbour-memory-card.png",
    alt: "Hong Kong memory card — Victoria Harbour, captioned Hong Kong · Harbour",
    className: "max-sm:left-[4.42%] max-sm:top-[1.71%] max-sm:w-[46.58%] max-sm:rotate-[-1.39deg] sm:left-[6%] sm:top-[8%] sm:w-[23%]",
    note: "Born in Hong Kong, raised in Shanghai. A big-city kid from the start.",
    noteClassName: "max-sm:left-[52.35%] max-sm:top-[3.55%] max-sm:w-[39%] sm:left-[6%] sm:top-[37%] sm:w-[23%]",
  },
  {
    src: "/toronto-memory-card.png",
    alt: "Toronto memory card — the skyline at dusk, captioned Toronto · Lake Dusk · Home",
    className: "max-sm:left-[51.19%] max-sm:top-[19.87%] max-sm:w-[44.32%] max-sm:rotate-[-0.51deg] sm:left-[37%] sm:top-[15%] sm:w-[23%]",
    note: "I grew up in Toronto. Proud Canadian.",
    noteClassName: "max-sm:left-[7.92%] max-sm:top-[22.46%] max-sm:w-[41.72%] sm:left-[37%] sm:top-[45%] sm:w-[23%]",
  },
  {
    src: "/newyork-memory-card.png",
    alt: "New York memory card — the Williamsburg Bridge at sunset, captioned Steel Sweep · Rose Sky · Wide River",
    className: "max-sm:left-[52.42%] max-sm:top-[37.68%] max-sm:w-[45.5%] max-sm:rotate-[0.81deg] sm:left-[70%] sm:top-[8%] sm:w-[23%]",
    note: "And now I live in Brooklyn, NYC.",
    noteClassName: "max-sm:left-[14.85%] max-sm:top-[41.76%] max-sm:w-[36.28%] sm:left-[70%] sm:top-[37%] sm:w-[23%]",
  },
  {
    src: "/kenya-memory-card.jpg",
    alt: "Kenya memory card — a giraffe on the savanna, captioned Kenya volunteer, 2016",
    className: "max-sm:left-[2.14%] max-sm:top-[55.49%] max-sm:w-[47.86%] max-sm:rotate-[-0.35deg] sm:left-[26%] sm:top-[55%] sm:w-[23%]",
    note: "I spent much of my teens volunteering abroad. Kenya stayed with me the most, and everyone should go on a safari once.",
    noteClassName: "max-sm:left-[51.56%] max-sm:top-[56.43%] max-sm:w-[40.42%] sm:left-[26%] sm:top-[82%] sm:w-[23%]",
  },
  {
    src: "/juche-memory-card.png",
    alt: "Pyongyang memory card — the Juche Tower, captioned North Korea travel, 2018",
    className: "max-sm:left-[2.62%] max-sm:top-[72.62%] max-sm:w-[44.62%] max-sm:rotate-[-2.92deg] sm:left-[68%] sm:top-[49%] sm:w-[23%]",
    note: "Travelling to North Korea solo is still the craziest trip I've taken. And yes, north.",
    noteClassName: "max-sm:left-[48.82%] max-sm:top-[76.66%] max-sm:w-[39.61%] sm:left-[68%] sm:top-[81%] sm:w-[23%]",
  },
];

/** Stickers live on the sheet itself rather than inside a card's slot, so
 *  StickerPeel bounds dragging to the whole paper — they can be pulled off one
 *  card and stuck down anywhere, including over another. */
const STICKERS = [
  // Hong Kong, first row left. Neighbouring cards share the gaps between them,
  // so facing sticker columns are offset vertically to avoid colliding.
  { src: "/harbour-tower.png", width: 41, rotate: 9, className: "max-sm:left-[82.63%] max-sm:top-[10.87%] sm:left-[1%] sm:top-[7%]" },
  { src: "/harbour-skyline.png", width: 55, rotate: -6, className: "max-sm:left-[55.35%] max-sm:top-[14.49%] sm:left-[0%] sm:top-[16%]" },
  { src: "/harbour-ferry.png", width: 55, rotate: 7, className: "max-sm:left-[4.43%] max-sm:top-[26.86%] sm:left-[1%] sm:top-[25%]" },
  { src: "/harbour-ridge.png", width: 60, rotate: -9, className: "max-sm:left-[27.43%] max-sm:top-[31.44%] sm:left-[27%] sm:top-[9%]" },
  { src: "/harbour-railing.png", width: 55, rotate: 11, className: "max-sm:left-[72.07%] max-sm:top-[14.95%] sm:left-[28%] sm:top-[18%]" },
  { src: "/harbour-buoy.png", width: 29, rotate: -5, className: "max-sm:left-[33.1%] max-sm:top-[28.48%] sm:left-[29%] sm:top-[28%]" },
  // Toronto, first row centre.
  { src: "/toronto-tower.png", width: 31, rotate: -9, className: "max-sm:left-[39.75%] max-sm:top-[37.72%] sm:left-[34%] sm:top-[18%]" },
  { src: "/toronto-skyline.png", width: 58, rotate: 6, className: "max-sm:left-[10.08%] max-sm:top-[34.43%] sm:left-[32%] sm:top-[27%]" },
  { src: "/canada-loon.png", width: 50, rotate: -4, className: "max-sm:left-[80.87%] max-sm:top-[95.6%] sm:left-[33%] sm:top-[36%]" },
  { src: "/toronto-crane.png", width: 41, rotate: 10, className: "max-sm:left-[86.94%] max-sm:top-[15.16%] sm:left-[59%] sm:top-[16%]" },
  { src: "/toronto-sun.png", width: 31, rotate: 5, className: "max-sm:left-[73.68%] max-sm:top-[11.03%] sm:left-[60%] sm:top-[26%]" },
  // New York, first row right.
  { src: "/newyork-tower.png", width: 50, rotate: 8, className: "max-sm:left-[35.18%] max-sm:top-[50.8%] sm:left-[65%] sm:top-[12%]" },
  { src: "/newyork-skyline.png", width: 55, rotate: -5, className: "max-sm:left-[8.8%] max-sm:top-[48.81%] sm:left-[64%] sm:top-[21%]" },
  { src: "/newyork-tree.png", width: 40, rotate: 6, className: "max-sm:left-[25.63%] max-sm:top-[37.91%] sm:left-[66%] sm:top-[30%]" },
  { src: "/newyork-deck.png", width: 46, rotate: -8, className: "max-sm:left-[36.46%] max-sm:top-[45.8%] sm:left-[92%] sm:top-[9%]" },
  { src: "/newyork-boat.png", width: 44, rotate: 5, className: "max-sm:left-[25.11%] max-sm:top-[46.07%] sm:left-[92%] sm:top-[18%]" },
  { src: "/newyork-cloud.png", width: 36, rotate: -6, className: "max-sm:left-[41.45%] max-sm:top-[30.58%] sm:left-[93%] sm:top-[28%]" },
  { src: "/kira-sticker.png", width: 64, rotate: -6, className: "max-sm:left-[72.99%] max-sm:top-[67.08%] sm:left-[76%] sm:top-[17%]" },
  // Kenya, second row left.
  { src: "/kenya-giraffe.png", width: 49, rotate: -11, className: "max-sm:left-[60.61%] max-sm:top-[71.92%] sm:left-[22%] sm:top-[54%]" },
  { src: "/kenya-bush.png", width: 53, rotate: 7, className: "max-sm:left-[58.83%] max-sm:top-[66.84%] sm:left-[21%] sm:top-[63%]" },
  { src: "/kenya-grass.png", width: 47, rotate: -5, className: "max-sm:left-[3.12%] max-sm:top-[44.13%] sm:left-[22%] sm:top-[72%]" },
  { src: "/kenya-treeline.png", width: 62, rotate: 10, className: "max-sm:left-[21.88%] max-sm:top-[49.86%] sm:left-[47%] sm:top-[56%]" },
  { src: "/kenya-zebras.png", width: 44, rotate: -8, className: "max-sm:left-[72.24%] max-sm:top-[72.66%] sm:left-[48%] sm:top-[65%]" },
  { src: "/kenya-sun.png", width: 31, rotate: 6, className: "max-sm:left-[52.15%] max-sm:top-[72.61%] sm:left-[49%] sm:top-[74%]" },
  // Pyongyang, second row right.
  { src: "/juche-flame.png", width: 50, rotate: -13, className: "max-sm:left-[75.93%] max-sm:top-[90.32%] sm:left-[64%] sm:top-[48%]" },
  { src: "/juche-trio.png", width: 55, rotate: 8, className: "max-sm:left-[21.63%] max-sm:top-[91.33%] sm:left-[63%] sm:top-[57%]" },
  { src: "/juche-tools.png", width: 46, rotate: -6, className: "max-sm:left-[64.86%] max-sm:top-[88.66%] sm:left-[64%] sm:top-[66%]" },
  { src: "/juche-shaft.png", width: 48, rotate: 12, className: "max-sm:left-[71.22%] max-sm:top-[84.2%] sm:left-[90%] sm:top-[50%]" },
  { src: "/juche-cloud.png", width: 53, rotate: -7, className: "max-sm:left-[52.28%] max-sm:top-[83.79%] sm:left-[90%] sm:top-[59%]" },
  { src: "/juche-rooftop.png", width: 44, rotate: 10, className: "max-sm:left-[1.63%] max-sm:top-[92.72%] sm:left-[91%] sm:top-[68%]" },
  // Food rings its own caption, in the left column below Hong Kong.
  { src: "/food-ramen.png", width: 70, rotate: -8, className: "max-sm:left-[83.8%] max-sm:top-[84.39%] sm:left-[2%] sm:top-[47%]" },
  { src: "/food-croissant.png", width: 62, rotate: 11, className: "max-sm:left-[67.49%] max-sm:top-[94.83%] sm:left-[11%] sm:top-[49%]" },
  { src: "/food-pizza.png", width: 50, rotate: -5, className: "max-sm:left-[13.62%] max-sm:top-[95.92%] sm:left-[0%] sm:top-[57%]" },
  { src: "/food-dumplings.png", width: 60, rotate: 7, className: "max-sm:left-[51.41%] max-sm:top-[88.12%] sm:left-[12%] sm:top-[58%]" },
  { src: "/food-eggtart.png", width: 46, rotate: -10, className: "max-sm:left-[88.59%] max-sm:top-[90.41%] sm:left-[5%] sm:top-[66%]" },
];

/** Sits in the middle of the food cluster, which is arranged around it. */
const FOOD_NOTE = {
  text: "Food is my love language.",
  className: "max-sm:left-[36.11%] max-sm:top-[92.86%] max-sm:w-[30%] sm:left-[3%] sm:top-[57%] sm:w-[12%]",
};

const Story = () => {
  return (
    <motion.div id="story" className="relative" transition={{ duration: 0.3 }}>
      {/* One sheet of paper holding every card and sticker. The cards and the
          handwriting are positioned in percentages, so they reflow with the
          sheet; the stickers are sized in pixels and do not, which is why they
          are scaled down below `sm` in StickerPeel.css. The sheet itself never
          exceeds the column — a wider sheet made the whole page scroll. */}
      <div
        className="relative aspect-[352/938] w-full overflow-hidden rounded-3xl bg-[#F6ECD5] sm:aspect-auto sm:h-[700px]"
        style={{
          backgroundImage: "url(/paper-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Faint graph-paper grid, over the paper texture but under
            everything else. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(122, 104, 76, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(122, 104, 76, 0.10) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {CARDS.map((card) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={card.src}
            src={card.src}
            alt={card.alt}
            className={`absolute block ${card.className}`}
          />
        ))}

        <p
          className={`indie-flower-regular absolute text-center text-[11px] leading-snug text-[#5A5148] sm:text-[13px] ${FOOD_NOTE.className}`}
        >
          {FOOD_NOTE.text}
        </p>

        {CARDS.map((card) => (
          <p
            key={`${card.src}-note`}
            className={`indie-flower-regular absolute text-[11px] leading-snug text-[#5A5148] sm:text-[13px] ${card.noteClassName}`}
          >
            {card.note}
          </p>
        ))}

        <ClientOnly>
          {STICKERS.map((s) => (
            <StickerPeel
              key={s.src}
              imageSrc={s.src}
              width={s.width}
              rotate={s.rotate}
              shadowIntensity={0.4}
              className={`story-sticker ${s.className}`}
            />
          ))}
        </ClientOnly>
      </div>
    </motion.div>
  );
};

export default Story;
