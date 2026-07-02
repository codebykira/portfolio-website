"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface IconItem {
  src: string;
  label: string;
  width: number;
  height: number;
}

// Hand-drawn line icons (black ink on transparent).
const ICONS: IconItem[] = [
  { src: "/icons/grocery-bag.png", label: "Groceries", width: 934, height: 912 },
  { src: "/icons/food-truck.png", label: "Food Truck", width: 1046, height: 658 },
  { src: "/icons/rocket.png", label: "Rocket", width: 586, height: 798 },
  { src: "/icons/restaurant.png", label: "Restaurant", width: 861, height: 753 },
  { src: "/icons/pizza.png", label: "Pizza", width: 931, height: 645 },
  { src: "/icons/rice-bowl.png", label: "Rice Bowl", width: 667, height: 477 },
  { src: "/icons/steak.png", label: "Steak", width: 724, height: 541 },
  { src: "/icons/roast-chicken.png", label: "Roast Chicken", width: 650, height: 470 },
  { src: "/icons/samgyetang.png", label: "Samgyetang", width: 825, height: 600 },
  { src: "/icons/dumplings.png", label: "Dumplings", width: 1006, height: 825 },
  { src: "/icons/hot-chocolate.png", label: "Hot Chocolate", width: 890, height: 800 },
  { src: "/icons/cake.png", label: "Cake", width: 1104, height: 912 },
  { src: "/icons/cake-slice.png", label: "Cake Slice", width: 1098, height: 924 },
  { src: "/icons/bookmark.png", label: "Bookmark", width: 815, height: 664 },
  { src: "/icons/magnifying-glass.png", label: "Magnifying Glass", width: 673, height: 774 },
  { src: "/icons/house.png", label: "House", width: 765, height: 605 },
  { src: "/icons/building.png", label: "Building", width: 1164, height: 545 },
  { src: "/icons/sundae.png", label: "Sundae", width: 610, height: 938 },
  { src: "/icons/id-badge-girl.png", label: "ID Badge", width: 537, height: 671 },
  { src: "/icons/id-badge-boy.png", label: "ID Badge", width: 530, height: 668 },
  { src: "/icons/cafe.png", label: "Cafe", width: 904, height: 794 },
  { src: "/icons/paper-plane.png", label: "Paper Plane", width: 835, height: 536 },
  { src: "/icons/money-bag.png", label: "Money Bag", width: 620, height: 659 },
  { src: "/icons/pizza-pie.png", label: "Pizza Pie", width: 572, height: 614 },
  { src: "/icons/thumbs-up.png", label: "Thumbs Up", width: 1009, height: 465 },
  { src: "/icons/polaroid-camera.png", label: "Polaroid Camera", width: 734, height: 566 },
];

// A big field so it overflows the screen far in every direction and reads as endless.
const COLS = 12;
const ROWS = 12;
const TILES = COLS * ROWS;

export default function IconsPage() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICONS.filter((i) => i.label.toLowerCase().includes(q)) : ICONS;
  }, [query]);

  // Tile the matches across the field (cycling so the grid always stays full).
  const field = useMemo<IconItem[]>(
    () =>
      matches.length === 0
        ? []
        : Array.from({ length: TILES }, (_, i) => matches[i % matches.length]),
    [matches]
  );

  return (
    <main className="fixed inset-0 overflow-hidden bg-white">
      <Link
        href="/"
        className="absolute left-6 top-8 z-40 text-sm text-black/50 transition-colors hover:text-black/80"
      >
        ← Back
      </Link>

      {/* Search bar */}
      <div className="pointer-events-none absolute inset-x-0 top-7 z-40 flex justify-center px-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search"
          className="pointer-events-auto w-72 rounded-full border border-black/10 bg-white/80 px-5 py-2.5 text-sm text-black shadow-sm outline-none backdrop-blur-md transition placeholder:text-black/40 focus:border-black/30"
        />
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {field.length === 0 ? (
          <p className="text-sm text-black/40">No icons found</p>
        ) : (
        <motion.div
          key={query}
          drag
          dragMomentum
          dragElastic={0.15}
          className="grid cursor-grab gap-x-[14rem] gap-y-12 active:cursor-grabbing"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {field.map((icon, i) => (
            <div
              key={i}
              className="flex h-40 w-40 items-center justify-center"
            >
              <Image
                src={icon.src}
                alt={icon.label}
                width={icon.width}
                height={icon.height}
                draggable={false}
                className="pointer-events-none h-full w-auto select-none object-contain"
              />
            </div>
          ))}
        </motion.div>
        )}
      </div>

      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 opacity-[0.4]"
        style={{
          mixBlendMode: "multiply",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "140px 140px",
        }}
      />
    </main>
  );
}
