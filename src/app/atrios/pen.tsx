"use client";
import React from "react";
import { COLOR, DIAGRAM } from "./tokens";

/**
 * Ballpoint primitives.
 *
 * A displacement filter over a clean rectangle reads as a wobbly vector, not
 * as something drawn. What actually distinguishes a ball pen is the way it is
 * handled: corners overshoot because the hand keeps going, edges are traced
 * twice where the writer pressed again, stroke weight varies with pressure,
 * and lines bow slightly because a wrist pivots rather than travels straight.
 * These helpers build those in.
 *
 * All randomness is seeded, never Math.random — the server and the client must
 * draw the identical path or React will throw away the tree on hydration.
 */

/** mulberry32: small, fast, and deterministic for a given seed. */
function rng(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PEN = COLOR.pen;

type StrokeProps = { seed: number; color?: string; width?: number };

/** One hand-drawn edge: bowed slightly, with the ends running long. */
function edge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
  overshoot: number = DIAGRAM.overshoot,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Run past both ends, the way a hand does not stop exactly on the corner.
  const sx = x1 - ux * overshoot * r();
  const sy = y1 - uy * overshoot * r();
  const ex = x2 + ux * overshoot * r();
  const ey = y2 + uy * overshoot * r();
  // Bow the line off its own perpendicular so it is never mechanically straight.
  const bow = (r() - 0.5) * DIAGRAM.bow;
  const mx = (sx + ex) / 2 - uy * bow;
  const my = (sy + ey) / 2 + ux * bow;
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

/** A rectangle drawn as four separate strokes, traced twice. */
export function PenRect({
  x,
  y,
  w,
  h,
  seed,
  color = PEN,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  seed: number;
  color?: string;
  fill?: string;
}) {
  const r = rng(seed);
  const j = () => (r() - 0.5) * DIAGRAM.jitter;
  // Corners land near, not on, their coordinates.
  const c = [
    [x + j(), y + j()],
    [x + w + j(), y + j()],
    [x + w + j(), y + h + j()],
    [x + j(), y + h + j()],
  ];
  const edges = [0, 1, 2, 3].map((i) => {
    const [ax, ay] = c[i];
    const [bx, by] = c[(i + 1) % 4];
    return edge(ax, ay, bx, by, r);
  });

  return (
    <g>
      {fill && (
        <path
          d={`M ${c[0][0]} ${c[0][1]} L ${c[1][0]} ${c[1][1]} L ${c[2][0]} ${c[2][1]} L ${c[3][0]} ${c[3][1]} Z`}
          fill={fill}
          stroke="none"
        />
      )}
      {edges.map((d, i) => (
        <React.Fragment key={i}>
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={DIAGRAM.penWidth * (0.85 + r() * 0.4)}
            strokeLinecap="round"
          />
          {/* The second pass: where the hand went back over the line. */}
          {r() > 0.35 && (
            <path
              d={edge(c[i][0] + j(), c[i][1] + j(), c[(i + 1) % 4][0] + j(), c[(i + 1) % 4][1] + j(), r)}
              fill="none"
              stroke={color}
              strokeWidth={DIAGRAM.penWidth * 0.7}
              strokeLinecap="round"
              opacity={0.55}
            />
          )}
        </React.Fragment>
      ))}
    </g>
  );
}

/** A pen line with a two-stroke arrowhead, rather than a filled triangle. */
export function PenArrow({
  x1,
  y1,
  x2,
  y2,
  seed,
  color = PEN,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  seed: number;
  color?: string;
}) {
  const r = rng(seed);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = DIAGRAM.arrowHead;
  const wing = (spread: number) => {
    const a = angle + Math.PI + spread;
    return edge(x2, y2, x2 + Math.cos(a) * head, y2 + Math.sin(a) * head, r, 1.5);
  };
  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path d={edge(x1, y1, x2, y2, r, 1.5)} strokeWidth={DIAGRAM.penWidth} />
      <path d={wing(0.42)} strokeWidth={DIAGRAM.penWidth * 0.9} />
      <path d={wing(-0.42)} strokeWidth={DIAGRAM.penWidth * 0.9} />
    </g>
  );
}

/** The loop-back: down, across, and up into an arrowhead. */
export function PenLoop({
  from,
  to,
  depth,
  seed,
  color = PEN,
}: {
  from: [number, number];
  to: [number, number];
  depth: number;
  seed: number;
  color?: string;
}) {
  const r = rng(seed);
  const [fx, fy] = from;
  const [tx, ty] = to;
  return (
    <g stroke={color} fill="none" strokeLinecap="round" strokeWidth={DIAGRAM.penWidth}>
      <path d={edge(fx, fy, fx + (r() - 0.5) * 3, depth, r)} />
      <path d={edge(fx, depth, tx, depth + (r() - 0.5) * 3, r)} />
      <PenArrow x1={tx} y1={depth} x2={tx} y2={ty} seed={seed + 11} color={color} />
    </g>
  );
}

/** A pen underline, for a phrase worth leaning on. */
export function PenUnderline({
  x1,
  x2,
  y,
  seed,
  color = PEN,
}: {
  x1: number;
  x2: number;
  y: number;
  seed: number;
  color?: string;
}) {
  const r = rng(seed);
  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path d={edge(x1, y, x2, y, r, 3)} strokeWidth={DIAGRAM.penWidth} />
      {/* Underlines get gone over twice more often than box edges do. */}
      <path d={edge(x1 + 2, y + 2.5, x2 - 2, y + 2.5, r, 3)} strokeWidth={DIAGRAM.penWidth * 0.6} opacity={0.5} />
    </g>
  );
}

/** A hand-drawn circle, for timeline markers. */
export function PenDot({
  cx,
  cy,
  radius,
  seed,
  color = PEN,
  fill,
}: {
  cx: number;
  cy: number;
  radius: number;
  seed: number;
  color?: string;
  fill?: string;
}) {
  const r = rng(seed);
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const rad = radius * (0.9 + r() * 0.2);
    return `${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  });
  const d = `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(" ")} Z`;
  return (
    <>
      {fill && <path d={d} fill={fill} stroke="none" />}
      <path d={d} fill="none" stroke={color} strokeWidth={DIAGRAM.penWidth} strokeLinejoin="round" />
    </>
  );
}
