"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface NotebookDrawProps {
  open: boolean;
  onClose: () => void;
  /** Previously-saved drawing (PNG data URL) to restore onto the canvas. */
  initialDrawing: string | null;
  /** Called with the current drawing (PNG data URL) when the notebook closes. */
  onSave: (dataUrl: string | null) => void;
}

const COLORS = ["#2b2b2b", "#FD652D", "#2563eb", "#dc2626", "#16a34a"];

// Internal canvas resolution (2x the notebook's natural size for crisp strokes).
const CANVAS_W = 1560;
const CANVAS_H = 840;

export default function NotebookDraw({
  open,
  onClose,
  initialDrawing,
  onSave,
}: NotebookDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);

  // Restore the saved drawing whenever the notebook opens.
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!initialDrawing) return;
    const img = new window.Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = initialDrawing;
  }, [open, initialDrawing]);

  // Export the canvas, hand it back to the parent, then close.
  const saveAndClose = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Detect whether anything was drawn (non-transparent pixels).
      const ctx = canvas.getContext("2d");
      const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasInk = false;
      if (data) {
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] !== 0) {
            hasInk = true;
            break;
          }
        }
      }
      onSave(hasInk ? canvas.toDataURL("image/png") : null);
    }
    onClose();
  };

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    last.current = pointFromEvent(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const prev = last.current;
    if (!ctx || !prev) return;
    const p = pointFromEvent(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const handleUp = () => {
    isDrawing.current = false;
    last.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Close (and save) on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") saveAndClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="notebook-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={saveAndClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Zoomed-in notebook with drawing canvas (shares layoutId with the
              desk notebook so it zooms from its real position) */}
          <motion.div
            layoutId="notebook-card"
            transition={{ type: "spring", stiffness: 230, damping: 28 }}
            className="relative z-10 w-[min(92vw,900px)]"
          >
            <Image
              src="/hero/notebook.png"
              alt="Open notebook"
              width={780}
              height={420}
              priority
              draggable={false}
              className="pointer-events-none h-auto w-full select-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
            />
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={handleDown}
              onPointerMove={handleMove}
              onPointerUp={handleUp}
              onPointerLeave={handleUp}
              className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
            />
          </motion.div>

          {/* Controls */}
          <div
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Pen color ${c}`}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? "border-white scale-110" : "border-white/30"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <span className="mx-1 h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={clearCanvas}
              className="rounded-full px-3 py-1 text-sm text-white/80 hover:bg-white/10"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={saveAndClose}
              className="rounded-full bg-white px-3 py-1 text-sm font-medium text-black hover:bg-white/90"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
