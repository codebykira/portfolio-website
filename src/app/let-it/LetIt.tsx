"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { IM_Fell_DW_Pica } from "next/font/google";
import "./let-it.css";

// IM Fell DW Pica — an old Fell printing type, loaded the Next.js way
// (next/font self-hosts it; no external <link> needed).
const pica = IM_Fell_DW_Pica({ weight: "400", style: ["normal", "italic"], subsets: ["latin"] });

// The paper is real footage: a crumpled ball blooming open (20 frames) and a
// flat sheet folding closed (14 frames), chroma-keyed to transparency.
const pad2 = (n: number) => String(n).padStart(2, "0");
const OPEN = Array.from({ length: 20 }, (_, i) => `/let-it/open_${pad2(i)}.webp`);
const CLOSE = Array.from({ length: 14 }, (_, i) => `/let-it/close_${pad2(i)}.webp`);
const SHEET = "/let-it/sheet.webp";
const BALL = "/let-it/ball.webp";

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

const COPY = {
  tableTitle: "A place to let it go.",
  tableSub: "Write what you can't say out loud. No one will know it was you.",
  tableLanded: "Yours just landed. Nobody can tell which one it is — including you.",
  leaveNote: "leave a note",
  leaveAnother: "leave another",
  placeholder: "the thing you haven't said.",
  release: "crumple it and let go",
  solo: "No one will know you read it.",
  fold: "fold it away",
};

interface Note {
  text: string;
  drawing: string;
}

// [left %, bottom px, size px, rot deg, flip, brightness]
const SPOTS: Array<[number, number, number, number, number, number]> = [
  [22, -6, 170, -14, 1, 0.62],
  [33, 24, 145, 24, -1, 0.8],
  [41, -10, 195, 8, 1, 0.95],
  [55, 16, 160, -6, -1, 0.72],
  [64, -6, 140, -20, 1, 0.88],
  [28, 46, 128, 30, -1, 0.68],
];
const MINE: [number, number, number, number, number, number] = [46, 54, 150, -8, 1, 1.05];

type Scene = "table" | "write" | "read";

export default function LetIt() {
  const [scene, setScene] = useState<Scene>("table");
  const [tableLine, setTableLine] = useState("");
  const [deposited, setDeposited] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [typedDone, setTypedDone] = useState(false);
  const [readDrawing, setReadDrawing] = useState("");

  const writeImg = useRef<HTMLImageElement>(null);
  const drawCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<[number, number] | null>(null);
  const readImg = useRef<HTMLImageElement>(null);
  const typedRef = useRef<HTMLDivElement>(null);
  const reading = useRef(false);
  const ownId = useRef("");
  const ownNote = useRef<Note | null>(null);
  const readOwn = useRef(false);
  const lastPool = useRef(-1);
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);

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
  const typeInto = useCallback((el: HTMLDivElement | null, note: string, done?: () => void) => {
    if (!el) return;
    el.innerHTML = "";
    const span = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(span);
    el.appendChild(caret);
    if (reduced.current || note === "") {
      span.textContent = note;
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
    const tick = () => {
      if (cancelled) return;
      if (i >= note.length) {
        finish();
        return;
      }
      span.textContent = note.slice(0, ++i);
      const ch = note[i - 1];
      const delay =
        26 + Math.random() * 26 + (ch === " " ? 12 : 0) + (".?!,".indexOf(ch) >= 0 ? 150 : 0);
      timers.current.push(window.setTimeout(tick, delay));
    };
    tick();
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

  /* ---------- flow ---------- */

  const release = () => {
    if (releasing) return;
    setReleasing(true);
    // send it to the pool while the paper crumples; the ritual proceeds
    // regardless — a network hiccup shouldn't hold the moment hostage.
    const payload: Note = { text: text.trim(), drawing: captureDrawing() };
    ownNote.current = payload;
    fetch("/api/let-it", {
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
      playSeq(writeImg.current, CLOSE, 1300, () => {
        setDeposited(true);
        setTableLine(COPY.tableLanded);
        setScene("table");
        setReleasing(false);
      });
    };
    timers.current.push(window.setTimeout(after, reduced.current ? 0 : 320));
  };

  const pick = (mine: boolean) => {
    if (reading.current) return;
    reading.current = true;
    readOwn.current = mine;
    setTypedDone(false);
    setReadDrawing("");
    setScene("read");
  };

  // when the read scene mounts: fetch a stranger's note while the paper opens
  useEffect(() => {
    if (scene !== "read") return;
    const own = readOwn.current;
    readOwn.current = false;
    const fetchNote: Promise<Note | null> =
      own && ownNote.current
        ? Promise.resolve(ownNote.current)
        : fetch(`/api/let-it/random${ownId.current ? `?exclude=${ownId.current}` : ""}`)
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
        setReadDrawing(show.drawing);
        typeInto(typedRef.current, show.text, () => setTypedDone(true));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const fold = () => {
    if (typedRef.current) typedRef.current.style.opacity = "0";
    setReadDrawing("");
    playSeq(readImg.current, CLOSE, 1100, () => {
      if (typedRef.current) {
        typedRef.current.innerHTML = "";
        typedRef.current.style.opacity = "1";
      }
      reading.current = false;
      setTableLine("");
      setScene("table");
    });
  };

  const openWrite = () => {
    setText("");
    setHasDrawn(false);
    setMode("type");
    setScene("write");
  };

  const remaining = 240 - text.length;

  return (
    <main className={`letit ${pica.className}`}>
      {scene === "table" && (
        <section className="stage wide">
          <div className="tabletext">
            <h1>{COPY.tableTitle}</h1>
            <p>{COPY.tableSub}</p>
            {tableLine !== "" && <p className="landed">{tableLine}</p>}
            <button className="go" onClick={openWrite}>
              {deposited ? COPY.leaveAnother : COPY.leaveNote}
            </button>
          </div>
          <div className="pile">
            {[...SPOTS, ...(deposited ? [MINE] : [])].map((sp, i) => {
              const mine = deposited && i === SPOTS.length;
              return (
                <button
                  key={i}
                  className={`ball${mine ? " mine" : ""}`}
                  aria-label={mine ? "your note - open it again" : "a stranger's crumpled note"}
                  style={
                    {
                      left: `${sp[0]}%`,
                      bottom: sp[1],
                      width: sp[2],
                      height: sp[2],
                      zIndex: 10 + i,
                      "--rot": `${sp[3]}deg`,
                      "--flip": sp[4],
                      "--bri": sp[5],
                    } as React.CSSProperties
                  }
                  onClick={() => pick(mine)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BALL} alt="" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {scene === "write" && (
        <section className="stage">
          <div className="tools">
            <button
              className={`tool${mode === "type" ? " active" : ""}`}
              onClick={() => setMode("type")}
            >
              type
            </button>
            <button
              className={`tool${mode === "draw" ? " active" : ""}`}
              onClick={() => setMode("draw")}
            >
              draw
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
            <div className="overlay" style={{ opacity: releasing ? 0 : 1 }}>
              <textarea
                maxLength={240}
                placeholder={mode === "type" ? COPY.placeholder : ""}
                aria-label="your note"
                value={text}
                autoFocus
                onChange={(e) => setText(e.target.value)}
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
            <button
              className="go"
              disabled={(text.trim().length < 12 && !hasDrawn) || releasing}
              onClick={release}
            >
              {COPY.release}
            </button>
          </div>
        </section>
      )}

      {scene === "read" && (
        <section className="stage readwrap">
          <p className="eyebrow">left for you</p>
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
          <p className="solo">{COPY.solo}</p>
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
