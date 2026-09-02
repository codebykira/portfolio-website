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
    className: "left-[6%] top-[8%] w-[23%]",
    note: "Born in Hong Kong, raised in Shanghai. A big-city kid from the start.",
    noteClassName: "left-[6%] top-[37%] w-[23%]",
  },
  {
    src: "/toronto-memory-card.png",
    alt: "Toronto memory card — the skyline at dusk, captioned Toronto · Lake Dusk · Home",
    className: "left-[37%] top-[15%] w-[23%]",
    note: "I grew up in Toronto. Proud Canadian.",
    noteClassName: "left-[37%] top-[45%] w-[23%]",
  },
  {
    src: "/newyork-memory-card.png",
    alt: "New York memory card — the Williamsburg Bridge at sunset, captioned Steel Sweep · Rose Sky · Wide River",
    className: "left-[70%] top-[8%] w-[23%]",
    note: "And now I live in Brooklyn, NYC.",
    noteClassName: "left-[70%] top-[37%] w-[23%]",
  },
  {
    src: "/kenya-memory-card.jpg",
    alt: "Kenya memory card — a giraffe on the savanna, captioned Kenya volunteer, 2016",
    className: "left-[26%] top-[55%] w-[23%]",
    note: "I spent much of my teens volunteering abroad. Kenya stayed with me the most, and everyone should go on a safari once.",
    noteClassName: "left-[26%] top-[82%] w-[23%]",
  },
  {
    src: "/juche-memory-card.png",
    alt: "Pyongyang memory card — the Juche Tower, captioned North Korea travel, 2018",
    className: "left-[68%] top-[49%] w-[23%]",
    note: "Travelling to North Korea solo is still the craziest trip I've taken. And yes, north.",
    noteClassName: "left-[68%] top-[81%] w-[23%]",
  },
];

/** Stickers live on the sheet itself rather than inside a card's slot, so
 *  StickerPeel bounds dragging to the whole paper — they can be pulled off one
 *  card and stuck down anywhere, including over another. */
const STICKERS = [
  // Hong Kong, first row left. Neighbouring cards share the gaps between them,
  // so facing sticker columns are offset vertically to avoid colliding.
  { src: "/harbour-tower.png", width: 41, rotate: 9, className: "left-[1%] top-[7%]" },
  { src: "/harbour-skyline.png", width: 55, rotate: -6, className: "left-[0%] top-[16%]" },
  { src: "/harbour-ferry.png", width: 55, rotate: 7, className: "left-[1%] top-[25%]" },
  { src: "/harbour-ridge.png", width: 60, rotate: -9, className: "left-[27%] top-[9%]" },
  { src: "/harbour-railing.png", width: 55, rotate: 11, className: "left-[28%] top-[18%]" },
  { src: "/harbour-buoy.png", width: 29, rotate: -5, className: "left-[29%] top-[28%]" },
  // Toronto, first row centre.
  { src: "/toronto-tower.png", width: 31, rotate: -9, className: "left-[34%] top-[18%]" },
  { src: "/toronto-skyline.png", width: 58, rotate: 6, className: "left-[32%] top-[27%]" },
  { src: "/canada-loon.png", width: 50, rotate: -4, className: "left-[33%] top-[36%]" },
  { src: "/toronto-crane.png", width: 41, rotate: 10, className: "left-[59%] top-[16%]" },
  { src: "/toronto-sun.png", width: 31, rotate: 5, className: "left-[60%] top-[26%]" },
  // New York, first row right.
  { src: "/newyork-tower.png", width: 50, rotate: 8, className: "left-[65%] top-[12%]" },
  { src: "/newyork-skyline.png", width: 55, rotate: -5, className: "left-[64%] top-[21%]" },
  { src: "/newyork-tree.png", width: 40, rotate: 6, className: "left-[66%] top-[30%]" },
  { src: "/newyork-deck.png", width: 46, rotate: -8, className: "left-[92%] top-[9%]" },
  { src: "/newyork-boat.png", width: 44, rotate: 5, className: "left-[92%] top-[18%]" },
  { src: "/newyork-cloud.png", width: 36, rotate: -6, className: "left-[93%] top-[28%]" },
  { src: "/kira-sticker.png", width: 64, rotate: -6, className: "left-[76%] top-[17%]" },
  // Kenya, second row left.
  { src: "/kenya-giraffe.png", width: 49, rotate: -11, className: "left-[22%] top-[54%]" },
  { src: "/kenya-bush.png", width: 53, rotate: 7, className: "left-[21%] top-[63%]" },
  { src: "/kenya-grass.png", width: 47, rotate: -5, className: "left-[22%] top-[72%]" },
  { src: "/kenya-treeline.png", width: 62, rotate: 10, className: "left-[47%] top-[56%]" },
  { src: "/kenya-zebras.png", width: 44, rotate: -8, className: "left-[48%] top-[65%]" },
  { src: "/kenya-sun.png", width: 31, rotate: 6, className: "left-[49%] top-[74%]" },
  // Pyongyang, second row right.
  { src: "/juche-flame.png", width: 50, rotate: -13, className: "left-[64%] top-[48%]" },
  { src: "/juche-trio.png", width: 55, rotate: 8, className: "left-[63%] top-[57%]" },
  { src: "/juche-tools.png", width: 46, rotate: -6, className: "left-[64%] top-[66%]" },
  { src: "/juche-shaft.png", width: 48, rotate: 12, className: "left-[90%] top-[50%]" },
  { src: "/juche-cloud.png", width: 53, rotate: -7, className: "left-[90%] top-[59%]" },
  { src: "/juche-rooftop.png", width: 44, rotate: 10, className: "left-[91%] top-[68%]" },
  // Food rings its own caption, in the left column below Hong Kong.
  { src: "/food-ramen.png", width: 70, rotate: -8, className: "left-[2%] top-[47%]" },
  { src: "/food-croissant.png", width: 62, rotate: 11, className: "left-[11%] top-[49%]" },
  { src: "/food-pizza.png", width: 50, rotate: -5, className: "left-[0%] top-[57%]" },
  { src: "/food-dumplings.png", width: 60, rotate: 7, className: "left-[12%] top-[58%]" },
  { src: "/food-eggtart.png", width: 46, rotate: -10, className: "left-[5%] top-[66%]" },
];

/** Sits in the middle of the food cluster, which is arranged around it. */
const FOOD_NOTE = {
  text: "Food is my love language.",
  className: "left-[3%] top-[57%] w-[12%]",
};

const Story = () => {
  return (
    <motion.div id="story" className="relative" transition={{ duration: 0.3 }}>
      {/* One sheet of paper holding every card and sticker. */}
      <div
        className="relative h-[560px] w-full overflow-hidden rounded-3xl bg-[#F6ECD5] sm:h-[700px]"
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
              className={s.className}
            />
          ))}
        </ClientOnly>
      </div>
    </motion.div>
  );
};

export default Story;
