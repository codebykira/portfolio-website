"use client";
import { useEffect, useRef } from "react";
import styles from "./scratch.module.css";

const SIZE = 200;
const BRUSH_RADIUS = 20;

export default function ScratchPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    const foil = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    foil.addColorStop(0, "#c8c8c8");
    foil.addColorStop(0.5, "#a3a3a3");
    foil.addColorStop(1, "#cfcfcf");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(
      ((clientX - rect.left) / rect.width) * SIZE,
      ((clientY - rect.top) / rect.height) * SIZE,
      BRUSH_RADIUS,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.base}>
          <h3>Atrios</h3>
          <h4>Backed by a16z</h4>
        </div>
        <canvas
          ref={canvasRef}
          className={styles.scratch}
          onPointerDown={(e) => {
            drawingRef.current = true;
            scratch(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => drawingRef.current && scratch(e.clientX, e.clientY)}
          onPointerUp={() => (drawingRef.current = false)}
          onPointerLeave={() => (drawingRef.current = false)}
        />
      </div>
    </main>
  );
}
