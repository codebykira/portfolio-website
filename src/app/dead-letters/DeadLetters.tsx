"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IM_Fell_DW_Pica, Special_Elite } from "next/font/google";
import "./dead-letters.css";
import { useHandSqueeze } from "./useHandSqueeze";

// IM Fell DW Pica — an old Fell printing type, loaded the Next.js way
// (next/font self-hosts it; no external <link> needed).
const pica = IM_Fell_DW_Pica({ weight: "400", style: ["normal", "italic"], subsets: ["latin"] });
// Special Elite carries the buttons/controls.
const elite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-elite" });

// The paper is real footage: a crumpled ball blooming open (20 frames) and a
// flat sheet folding closed (14 frames), chroma-keyed to transparency.
const pad2 = (n: number) => String(n).padStart(2, "0");
const OPEN = Array.from({ length: 20 }, (_, i) => `/dead-letters/open_${pad2(i)}.webp`);
const CLOSE = Array.from({ length: 14 }, (_, i) => `/dead-letters/close_${pad2(i)}.webp`);
const SHEET = "/dead-letters/sheet.webp";
const BALL = "/dead-letters/ball.webp";

// Fallback notes for when the pool can't be reached (or is empty).
const POOL = [
  "I told everyone I left that job. They asked me to leave.",
  "My dad calls every Sunday. I let it ring about half the time and he has never once mentioned it.",
  "I got the promotion because I was in the room and she wasn't. I've never told her that.",
  "I'm the reason the group chat went quiet. Nobody has said so.",
  "I still check her profile. It's been four years. I don't miss her, I just want to know.",
  "When I heard, my first feeling was relief. I've been paying for that ever since.",
  "I've been reading the same page of the same book for three weeks so my partner thinks I'm okay.",
];

// Shown instantly on a new sheet, and whenever the written line can't be had.
const OPENERS = [
  "What was the best five minutes of today?",
  "What did you eat today? Was it any good?",
  "What did you notice on the way somewhere?",
];

// What the camera control says in each state. Plain about what it is.
const HAND_LABEL: Record<string, string> = {
  off: "turn on the camera to squeeze",
  starting: "waking the camera...",
  watching: "squeeze hand when finished",
  denied: "camera blocked",
  unsupported: "no camera here",
  failed: "hand tracking failed",
};

const COPY = {
  name: "Dead Letters",
  placeholder: "the thing you haven't said.",
  tagline: "Not every note finds a door.",
  taglineTwo: "Leave it on the step anyway.",
  writeOne: "write a letter",
  fold: "fold it away",
};

interface Note {
  id?: string;
  text: string;
  drawing: string;
}

// [left %, bottom px, size px, rot deg, flip, brightness]
const SPOTS: Array<[number, number, number, number, number, number]> = [
  [12, -6, 170, -14, 1, 0.62],
  [27, 24, 145, 24, -1, 0.8],
  [40, -10, 195, 8, 1, 0.95],
  [58, 16, 160, -6, -1, 0.72],
  [71, -6, 140, -20, 1, 0.88],
  [19, 46, 128, 30, -1, 0.68],
];
const MINE: [number, number, number, number, number, number] = [46, 54, 150, -8, 1, 1.05];

/** A resting place for one crumple, derived from its index so the heap never
 *  reshuffles between renders.
 *
 *  The distribution makes a mound rather than a scatter: distance from the
 *  middle is biased toward zero, and height falls away with that distance, so
 *  paper stacks up at the centre and slumps out at the base.
 */
const spotFor = (i: number): [number, number, number, number, number, number] => {
  const r = (seed: number) => {
    const x = Math.sin((i + 1) * seed) * 10000;
    return x - Math.floor(x);
  };

  // Raising a uniform value to a power pulls it toward the middle, which is
  // what gives the heap a peak instead of an even field.
  const fromMiddle = Math.pow(r(12.9898), 1.6);
  const angle = r(4.1414) * Math.PI * 2;

  const left = 50 + Math.cos(angle) * 42 * fromMiddle;
  // Tallest in the middle, slumping to the base at the edges, plus jitter so
  // the slope is ragged rather than a clean cone.
  const lift = (1 - fromMiddle) * 196 + r(78.233) * 72 - 20;

  return [
    left,
    Math.round(lift),
    104 + r(37.719) * 76,
    -34 + r(93.989) * 68,
    r(11.135) > 0.5 ? 1 : -1,
    // Paper higher up the heap is further away, so it sits darker.
    0.92 - (lift / 210) * 0.42,
  ];
};

type Scene = "table" | "write" | "read";

/** The only words on the page — identical whether you are writing or reading,
 *  so moving between the two never feels like changing screens. */
function Masthead() {
  return (
    <div className="writeintro">
      <h1>{COPY.name}</h1>
      <p className="sub">
        {COPY.tagline}
        <br />
        {COPY.taglineTwo}
      </p>
    </div>
  );
}

export default function DeadLetters() {
  const [scene, setScene] = useState<Scene>("write");
  const [deposited, setDeposited] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [typedDone, setTypedDone] = useState(false);
  const [readDrawing, setReadDrawing] = useState("");
  // A line at the top of the sheet, written fresh for each new piece of paper.
  // Seeded so the paper is never blank while the request is in flight — the
  // written one replaces it the moment it lands.
  const [prompt, setPrompt] = useState(OPENERS[0]);
  const [promptBusy, setPromptBusy] = useState(false);
  // 0 = open hand, 1 = closed fist. Drives the same crumple the button does.
  const [grip, setGrip] = useState(0);
  // The crumple in flight. Driven frame by frame rather than by a keyframe,
  // because distance has to be carried by scale and that needs real easing.
  const [throwing, setThrowing] = useState(false);
  const throwRef = useRef<HTMLImageElement | null>(null);
  // The crumple you opened, so folding it away can put it back where it lay.
  const pickedSpot = useRef<[number, number, number, number, number, number]>(MINE);
  const pileRef = useRef<HTMLDivElement | null>(null);
  // Every note you leave stays where it landed. Each entry is the resting spot
  // plus the note itself, so opening one gives back that note rather than the
  // most recent. Chosen before the throw, so the ball flies to the exact place
  // it will occupy instead of landing and then jumping.
  // How many notes are really in the pool. The table draws one crumple each,
  // so the pile is the archive rather than decoration.
  const [poolCount, setPoolCount] = useState<number | null>(null);
  const [mine, setMine] = useState<Array<{ spot: [number, number, number, number, number, number]; note: Note }>>([]);
  // The sheet fades out when you set it aside to go and read.
  const [settingAside, setSettingAside] = useState(false);
  const seenPrompts = useRef<string[]>([]);

  const writeImg = useRef<HTMLImageElement>(null);
  const drawCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<[number, number] | null>(null);
  const readImg = useRef<HTMLImageElement>(null);
  const typedRef = useRef<HTMLDivElement>(null);
  const reading = useRef(false);
  const ownId = useRef("");
  const ownNote = useRef<Note | null>(null);
  const lastRead = useRef("");
  const readOwn = useRef(false);
  const lastPool = useRef(-1);
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);
  const prevLen = useRef(0);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // preload every frame so playback never stalls
    [...OPEN, ...CLOSE, SHEET, BALL].forEach((src) => {
      const im = new Image();
      im.src = src;
    });
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  /* play a frame sequence into an <img> — the motion curve is the footage's own.
     Timer-driven (not rAF) so it still completes if the tab is backgrounded. */
  const playSeq = useCallback(
    (img: HTMLImageElement | null, frames: string[], ms: number, done?: () => void) => {
      if (!img) return;
      if (reduced.current) {
        img.src = frames[frames.length - 1];
        done?.();
        return;
      }
      const t0 = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / ms);
        img.src = frames[Math.min(frames.length - 1, Math.floor(t * frames.length))];
        if (t < 1) timers.current.push(window.setTimeout(step, 50));
        else done?.();
      };
      step();
    },
    []
  );

  /* typewriter reveal, click to finish */
  const typeRun = useRef(0);
  const typeInto = useCallback((el: HTMLDivElement | null, note: string, done?: () => void) => {
    if (!el) return;
    // Any earlier run is abandoned the moment a new one starts.
    const run = ++typeRun.current;
    el.innerHTML = "";
    const span = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(span);
    el.appendChild(caret);
    if (reduced.current || note === "") {
      span.textContent = note;
      if (typeRun.current !== run) return;
      caret.remove();
      done?.();
      return;
    }
    let i = 0;
    let cancelled = false;
    const finish = () => {
      cancelled = true;
      span.textContent = note;
      caret.remove();
      el.removeEventListener("click", finish);
      done?.();
    };
    el.addEventListener("click", finish);
    const step = () => {
      if (cancelled) return;
      if (i >= note.length) {
        finish();
        return;
      }
      if (typeRun.current !== run) return;
      span.textContent = note.slice(0, ++i);
      const ch = note[i - 1];
      const delay =
        26 + Math.random() * 26 + (ch === " " ? 12 : 0) + (".?!,".indexOf(ch) >= 0 ? 150 : 0);
      timers.current.push(window.setTimeout(step, delay));
    };
    step();
  }, []);

  /* ---------- drawing on the paper ---------- */

  // size the canvas to its displayed box (crisp on retina)
  useEffect(() => {
    if (scene !== "write") return;
    const c = drawCanvas.current;
    if (!c) return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      // guard against layout feedback: only resize on a real change
      if (w <= 0 || h <= 0 || (Math.abs(c.width - w) < 2 && Math.abs(c.height - h) < 2)) return;
      // keep existing marks across resizes
      const keep = document.createElement("canvas");
      keep.width = c.width;
      keep.height = c.height;
      keep.getContext("2d")?.drawImage(c, 0, 0);
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (ctx) {
        if (keep.width > 0) ctx.drawImage(keep, 0, 0, c.width, c.height);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#2b2721";
        ctx.lineWidth = 2.2;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [scene]);

  const strokeTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = drawCanvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (lastPt.current) {
      ctx.beginPath();
      ctx.moveTo(lastPt.current[0], lastPt.current[1]);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawn(true);
    }
    lastPt.current = [x, y];
  };

  const clearMarks = () => {
    const c = drawCanvas.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  };

  /* the drawing, downscaled for storage */
  const captureDrawing = (): string => {
    const c = drawCanvas.current;
    if (!c || !hasDrawn || c.width === 0) return "";
    const scale = Math.min(1, 600 / c.width);
    const out = document.createElement("canvas");
    out.width = Math.round(c.width * scale);
    out.height = Math.round(c.height * scale);
    out.getContext("2d")?.drawImage(c, 0, 0, out.width, out.height);
    try {
      return out.toDataURL("image/webp", 0.75);
    } catch {
      return out.toDataURL("image/png");
    }
  };

  // One line, offered — not assigned. The writer can take it, swap it for
  // another, or wave it away and face blank paper instead.
  const loadPrompt = useCallback(() => {
    setPromptBusy(true);
    const avoid = seenPrompts.current.slice(-3).join("|");
    return fetch(`/api/dead-letters/prompt${avoid ? `?avoid=${encodeURIComponent(avoid)}` : ""}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ prompt?: string }>) : null))
      .then((d) => {
        if (!d?.prompt) return;
        seenPrompts.current = [...seenPrompts.current, d.prompt].slice(-6);
        setPrompt(d.prompt);
      })
      .catch(() => {})
      .finally(() => setPromptBusy(false));
  }, []);

  // A new sheet gets a new suggestion, and gets it back if it was waved away.
  useEffect(() => {
    if (scene !== "write") return;
    void loadPrompt();
  }, [scene, loadPrompt]);

  const releaseRef = useRef<(alreadyCrumpled?: boolean) => void>(() => {});
  const canReleaseRef = useRef(false);
  const releasingRef = useRef(false);
  const squeezeWarnedRef = useRef(false);

  const handleGrip = useCallback((g: number) => {
    setGrip(g);

    // Closing your hand scrubs the real crumple footage frame by frame, so the
    // paper deforms in your grip rather than snapping at a threshold.
    const img = writeImg.current;
    if (img && !releasingRef.current) {
      if (g < 0.06) {
        if (!img.src.endsWith(SHEET)) img.src = SHEET;
      } else {
        const frame = Math.min(CLOSE.length - 1, Math.floor(g * CLOSE.length));
        const next = CLOSE[frame];
        if (!img.src.endsWith(next)) img.src = next;
      }
    }

    if (g > 0.8) {
      if (canReleaseRef.current) {
        // The fist has already done the crumpling.
        releaseRef.current(true);
      } else if (squeezeWarnedRef.current !== true) {
        squeezeWarnedRef.current = true;
        if (process.env.NODE_ENV !== "production") {
          console.info("[hand] squeeze ignored — nothing written on the sheet yet");
        }
      }
    } else if (g < 0.4) {
      squeezeWarnedRef.current = false;
    }
  }, []);

  const hand = useHandSqueeze(handleGrip);

  // Watch for a squeeze from the start. The camera never leaves the device and
  // the control below still turns it off, but you should not have to arm it
  // before your hands mean anything.
  const handStart = hand.start;
  const handStatus = hand.status;
  useEffect(() => {
    if (handStatus === "off") void handStart();
  }, [handStart, handStatus]);

  useEffect(() => {
    fetch("/api/dead-letters/count")
      .then((r) => (r.ok ? (r.json() as Promise<{ count?: number }>) : null))
      .then((d) => {
        if (typeof d?.count === "number") setPoolCount(d.count);
      })
      .catch(() => {});
  }, []);

  // Falls back to the hand-placed spots when the count can't be had, so a
  // paused database never leaves an empty table.
  const strangers = useMemo(
    () =>
      poolCount && poolCount > 0
        ? Array.from({ length: Math.min(poolCount, 48) }, (_, i) => spotFor(i))
        : SPOTS,
    [poolCount]
  );

  // Runtime failures inside async work (the camera pipeline especially) reach
  // the console as a bare message with no usable frame. In development, print
  // the whole thing so the source is identifiable.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const onError = (e: ErrorEvent) => {
      console.error("[dead-letters] error:", e.message, "\n  at", e.filename, `${e.lineno}:${e.colno}`, "\n", e.error?.stack ?? e.error);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      console.error("[dead-letters] unhandled rejection:", r?.message ?? r, "\n", r?.stack ?? "");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  /* ---------- flow ---------- */

  /**
   * Fly a crumple from wherever it currently is on screen to a resting place in
   * the pile, and land on exactly the size, angle and spot it will keep.
   *
   * Used both when you let your own note go and when you fold a stranger's
   * back — folding away should put the paper back on the table, not cut to it.
   */
  const flyToSpot = (
    from: DOMRect | undefined,
    spot: [number, number, number, number, number, number],
    done: () => void
  ) => {
    const [restLeft, restBottom, restSize, restRot, side] = spot;
    setThrowing(true);
    requestAnimationFrame(() => {
      const el = throwRef.current;
      if (!el) {
        setThrowing(false);
        done();
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const spinSeed = Math.floor(Math.random() * 360);

      // Measured at throw time: wherever the crumpled paper actually sits is
      // where the flight begins.
      const startS = from ? from.width * 0.6 : Math.min(vw * 0.4, 230);
      const startX = from ? from.left + from.width / 2 : vw / 2;
      const startTop = from ? from.top + from.height / 2 - startS / 2 : vh * 0.44;

      // `left: X%` places the ball's left edge, but the flight paints from its
      // centre — aim half a ball further over so the two coincide.
      const pileBox = pileRef.current?.getBoundingClientRect();
      const landX = pileBox
        ? pileBox.left + (pileBox.width * restLeft) / 100 + restSize / 2
        : vw / 2;
      const landTop = pileBox ? pileBox.bottom - restBottom - restSize : vh * 0.7;

      const throwPower = Math.min(1, Math.abs(landTop - startTop) / (vh * 0.55));
      const hop = vh * (0.1 + throwPower * 0.2);
      const flight = 780 + throwPower * 360;
      // Land a whole number of turns past the resting angle, so the spin
      // resolves into the crumple instead of snapping.
      const spin = side * 360 * (1 + (spinSeed % 2)) + restRot;

      const t0 = performance.now();
      let bounce = 0;

      const paint = (x: number, top: number, size: number, rot: number, dim: number) => {
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${x - size / 2}px`;
        el.style.top = `${top}px`;
        el.style.transform = `rotate(${rot}deg) scaleX(${side})`;
        el.style.filter = `brightness(${dim.toFixed(2)})`;
      };

      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / flight);
        const z = 1 - Math.pow(1 - t, 2.1);
        paint(
          startX + (landX - startX) * z,
          startTop + (landTop - startTop) * z - Math.sin(Math.PI * t) * hop,
          startS + (restSize - startS) * z,
          spin * z,
          1.06 - Math.sin(Math.PI * t) * 0.3
        );
        if (t < 1) {
          window.requestAnimationFrame(step);
          return;
        }
        // Two small bounces. Without them the paper arrives dead, which is most
        // of what makes a throw read as an animation.
        if (bounce < 2) {
          bounce += 1;
          const amp = hop * (bounce === 1 ? 0.12 : 0.045);
          const dur = 200 - bounce * 55;
          const b0 = performance.now();
          const bstep = (bnow: number) => {
            const bt = Math.min(1, (bnow - b0) / dur);
            paint(landX, landTop - Math.sin(Math.PI * bt) * amp, restSize, spin, 1.06);
            if (bt < 1) window.requestAnimationFrame(bstep);
            else if (bounce < 2) window.requestAnimationFrame(() => step(performance.now() + flight));
            else {
              setThrowing(false);
              done();
            }
          };
          window.requestAnimationFrame(bstep);
        }
      };
      window.requestAnimationFrame(step);
    });
  };

  /** Throw your own note onto the table, choosing where it comes to rest. */
  const flingToTable = (done: (spot: [number, number, number, number, number, number], note: Note) => void) => {
    const len = text.trim().length;
    const mass = 1 + Math.min(1, len / 240) * 0.6;
    const power = 0.45 + Math.random() * 0.55;
    const side = Math.random() < 0.5 ? -1 : 1;
    // A heavier note does not get as far back.
    const reach = Math.min(1, power / mass);
    const seed = Math.floor(Math.random() * 360);

    // The pile already says length with size, so the flight ends at exactly the
    // size and spot this crumple will keep.
    const restSize = Math.round(120 + Math.min(1, len / 240) * 72);
    const restSpot: [number, number, number, number, number, number] = [
      50 + side * (2 + Math.random() * 12),
      Math.round(120 + reach * 90),
      restSize,
      (seed % 40) - 20,
      side,
      1.06,
    ];
    const landed: Note = { text: text.trim(), drawing: ownNote.current?.drawing ?? "" };

    flyToSpot(writeImg.current?.getBoundingClientRect(), restSpot, () =>
      done(restSpot, landed)
    );
  };

  /**
   * Let the note go.
   *
   * `alreadyCrumpled` is set when a hand squeeze got here: closing your fist
   * has already scrubbed the close-frames, so replaying them would crumple the
   * same sheet a second time.
   */
  const release = (alreadyCrumpled = false) => {
    if (releasing) return;
    setReleasing(true);
    // send it to the pool while the paper crumples; the ritual proceeds
    // regardless — a network hiccup shouldn't hold the moment hostage.
    const payload: Note = { text: text.trim(), drawing: captureDrawing() };
    ownNote.current = payload;
    fetch("/api/dead-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.id) ownId.current = d.id;
      })
      .catch(() => {});

    const after = () => {
      const toss = () =>
        flingToTable((restSpot, landed) => {
          // Only once it has landed does the view pull back to the table.
          setText("");
          setHasDrawn(false);
          setMode("type");
          prevLen.current = 0;
          setMine((prev) => [...prev, { spot: restSpot, note: landed }]);
          setDeposited(true);
          setScene("table");
          setReleasing(false);
        });

      if (alreadyCrumpled) toss();
      else playSeq(writeImg.current, CLOSE, 1300, toss);
    };

    timers.current.push(window.setTimeout(after, reduced.current ? 0 : 320));
  };

  releaseRef.current = release;
  releasingRef.current = releasing;
  // A blank page is still something to let go of, so the gesture is never
  // refused. It simply is not added to the pool — there is nothing to read.
  canReleaseRef.current = scene === "write" && !releasing;

  // Clicking the dark sets the paper aside — your words are kept, the sheet
  // fades, and the table comes forward. This replaces the old button.
  // The dark is the whole navigation. It lives on <main>, because the stages
  // are narrow boxes and most of the dark is outside them.
  const onDarkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Anything you can actually touch handles itself.
    if (target.closest(".writesheet, .paperbox, button, textarea, canvas, a")) return;
    if (scene === "write") setAside();
    else if (scene === "table") openWrite();
    else if (scene === "read") fold();
  };

  const setAside = () => {
    if (releasing || settingAside) return;
    setSettingAside(true);
    timers.current.push(
      window.setTimeout(() => {
        setScene("table");
        setSettingAside(false);
      }, 420)
    );
  };

  const pick = (note: Note | null, spot: [number, number, number, number, number, number]) => {
    if (reading.current) return;
    pickedSpot.current = spot;
    reading.current = true;
    // Opening one of yours shows that note; opening a stranger's draws one.
    readOwn.current = note !== null;
    if (note) ownNote.current = note;
    setTypedDone(false);
    setReadDrawing("");
    setScene("read");
  };

  // when the read scene mounts: fetch a stranger's note while the paper opens
  useEffect(() => {
    if (scene !== "read") return;
    const own = readOwn.current;
    readOwn.current = false;
    const excludes = [ownId.current, lastRead.current].filter(Boolean).join(",");
    const fetchNote: Promise<Note | null> =
      own && ownNote.current
        ? Promise.resolve(ownNote.current)
        : fetch(`/api/dead-letters/random${excludes ? `?exclude=${excludes}` : ""}`)
            .then((r) => (r.ok ? (r.json() as Promise<Note>) : null))
            .catch(() => null);

    if (readImg.current) readImg.current.src = OPEN[0];
    playSeq(readImg.current, OPEN, 1900, () => {
      void fetchNote.then((note) => {
        let show = note;
        if (!own && (!show || (show.text === "" && show.drawing === ""))) {
          let n = Math.floor(Math.random() * POOL.length);
          if (n === lastPool.current) n = (n + 1) % POOL.length;
          lastPool.current = n;
          show = { text: POOL[n], drawing: "" };
        }
        if (!show) show = { text: POOL[0], drawing: "" };
        if (!own && show.id) lastRead.current = show.id;
        setReadDrawing(show.drawing);
        typeInto(typedRef.current, show.text, () => setTypedDone(true));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const fold = () => {
    // Stop the type-on before anything else, or it keeps writing into an
    // element we are about to clear.
    typeRun.current += 1;
    if (typedRef.current) typedRef.current.style.opacity = "0";
    setReadDrawing("");
    playSeq(readImg.current, CLOSE, 1100, () => {
      if (typedRef.current) {
        typedRef.current.innerHTML = "";
        typedRef.current.style.opacity = "1";
      }
      // Back onto the table, at the angle and place it came from.
      flyToSpot(readImg.current?.getBoundingClientRect(), pickedSpot.current, () => {
        reading.current = false;
        setScene("table");
      });
    });
  };

  // Coming back to the paper keeps whatever you had written — peeking at the
  // pile must not cost you the note you were part-way through. The sheet is
  // only cleared once something has actually been let go.
  const openWrite = () => {
    setScene("write");
  };

  const remaining = 240 - text.length;

  return (
    <main
      className={`letit ${pica.className} ${elite.variable}`}
      data-scene={scene}
      onClick={onDarkClick}
    >
      {/* Rendered once, never unmounted: the table and the masthead keep the
          exact same position in every state, which is what makes moving
          between writing and reading read as one surface rather than two
          screens. Only focus and interactivity change. */}
      <div className="table-layer">
        <div className="pile" ref={pileRef}>
          {[
            ...strangers.map((spot) => ({ spot, note: null as Note | null })),
            ...mine.map((m) => ({ spot: m.spot, note: m.note })),
          ].map(({ spot: sp, note }, i) => {
            const isMine = note !== null;
            return (
              <button
                key={i}
                className={`ball${isMine ? " mine" : ""}`}
                tabIndex={scene === "table" ? 0 : -1}
                aria-hidden={scene !== "table"}
                aria-label={isMine ? "your note - open it again" : "a stranger's crumpled note"}
                style={
                  {
                    left: `${sp[0]}%`,
                    bottom: sp[1],
                    width: sp[2],
                    height: sp[2],
                    zIndex: Math.round(300 - sp[1]),
                    "--rot": `${sp[3]}deg`,
                    "--flip": sp[4],
                    "--bri": sp[5],
                  } as React.CSSProperties
                }
                onClick={() => pick(note, sp)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BALL} alt="" />
              </button>
            );
          })}
        </div>
      </div>
      {throwing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="throwball" ref={throwRef} src={BALL} alt="" />
      )}
      {scene !== "write" && (
        <button className="write-cta" onClick={openWrite}>
          {COPY.writeOne}
        </button>
      )}
      <Masthead />
      {scene === "table" && (
        <section className="stage wide">
        </section>
      )}

      {scene === "write" && (
        <section className="stage xwide">
          <div className="writegrid">
            {prompt && (
              <aside className="dl-prompt">
                <div className="dl-prompt-head">
                  <span>a place to start</span>
                </div>
                <p className="dl-prompt-line">{prompt}</p>
                <div className="dl-prompt-tools">
                  <button
                    type="button"
                    className="tool"
                    onClick={() => void loadPrompt()}
                    disabled={promptBusy}
                  >
                    another
                  </button>
                </div>
              </aside>
            )}
            <div
              className={`writesheet${settingAside ? " setting-aside" : ""}${
                throwing ? " handed-off" : ""
              }`}
            >
          <div className="tools">
            {/* One sharpie rather than two words: pick it up to draw, put it
                down to type. */}
            <button
              className={`pencil${mode === "draw" ? " active" : ""}`}
              aria-pressed={mode === "draw"}
              aria-label={mode === "draw" ? "put the sharpie down" : "pick up the sharpie"}
              title={mode === "draw" ? "put the sharpie down" : "pick up the sharpie"}
              onClick={() => setMode(mode === "draw" ? "type" : "draw")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {/* A sharpie: barrel, collar, chisel tip. */}
                <path
                  d="M9.4 14.6 4.6 19.4 4 20l.6-.6 4.8-4.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="m13.9 4.6 5.5 5.5-7.1 7.1-5.5-5.5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="m12.1 6.4 5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="m6.8 11.7 5.5 5.5-3.6 1.1-3-3z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {hasDrawn && (
              <button className="tool" onClick={clearMarks}>
                clear the marks
              </button>
            )}
          </div>
          <div className="paperbox">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={writeImg} src={SHEET} alt="" />
            <div
              className="overlay"
              style={{
                opacity: releasing ? 0 : 1,
                transform: grip > 0.04 ? `scale(${1 - grip * 0.1}) rotate(${grip * 3}deg)` : undefined,
              }}
            >
              <textarea
                maxLength={240}
                placeholder={mode === "type" ? COPY.placeholder : ""}
                aria-label="your note"
                value={text}
                autoFocus
                onChange={(e) => {
                  const v = e.target.value;
                  prevLen.current = v.length;
                  setText(v);
                }}
                disabled={releasing || mode === "draw"}
                style={{ pointerEvents: mode === "draw" ? "none" : "auto" }}
              />
              <div className="meter">
                <span className={remaining < 30 ? "low" : ""}>{remaining}</span>
              </div>
            </div>
            <canvas
              ref={drawCanvas}
              className="marks"
              aria-label="draw on the paper"
              style={{
                pointerEvents: mode === "draw" && !releasing ? "auto" : "none",
                opacity: releasing ? 0 : 1,
              }}
              onPointerDown={(e) => {
                drawing.current = true;
                lastPt.current = null;
                e.currentTarget.setPointerCapture(e.pointerId);
                strokeTo(e);
              }}
              onPointerMove={(e) => {
                if (drawing.current) strokeTo(e);
              }}
              onPointerUp={() => {
                drawing.current = false;
                lastPt.current = null;
              }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
          </div>
            </div>
          </div>
        </section>
      )}

      {scene === "read" && (
        <section className="stage readwrap">
          <div className="paperbox">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={readImg} src={OPEN[0]} alt="a stranger's note, uncrumpled" />
            {readDrawing !== "" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={readDrawing} alt="" className="marks-shown" />
            )}
            <div className="overlay" style={{ inset: "14% 13.5%" }}>
              <div className="typed" ref={typedRef} aria-live="polite" />
            </div>
          </div>
          <button
            className="quiet fadeable"
            style={{ opacity: typedDone ? 1 : 0 }}
            disabled={!typedDone}
            onClick={fold}
          >
            {COPY.fold}
          </button>
        </section>
      )}

    </main>
  );
}
