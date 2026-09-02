"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Watch the camera for a closing fist and report it as a 0–1 grip value.
 *
 * Everything runs on-device: MediaPipe's WASM and model are served from this
 * origin, the frames go straight from the camera into the detector, and nothing
 * is uploaded, recorded, or kept. That matters more here than on a normal page —
 * this sits on top of a form whose whole promise is that nobody knows it was
 * you, so the camera is strictly opt-in and stops the moment it is switched off.
 *
 * The grip value is deliberately continuous rather than a "fist detected"
 * boolean, so it can drive the same 0–1 crumple the drag does.
 */

export type HandStatus = "off" | "starting" | "watching" | "denied" | "unsupported" | "failed";

// Landmark indices from MediaPipe's 21-point hand model.
const WRIST = 0;
const TIPS = [8, 12, 16, 20] as const;   // index, middle, ring, pinky
const KNUCKLES = [5, 9, 13, 17] as const;

interface Point { x: number; y: number; z: number }

/**
 * Diagnostics, off unless asked for — add ?handdebug to the URL, or set
 * localStorage "dl-hand-debug" to "1". Kept behind a flag so nothing chatters
 * in production.
 */
const debugOn = (): boolean => {
  if (typeof window === "undefined") return false;
  // On by default while developing — this is only ever useful next to a
  // camera — and silent in production unless explicitly switched on.
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return (
      new URLSearchParams(window.location.search).has("handdebug") ||
      window.localStorage.getItem("dl-hand-debug") === "1"
    );
  } catch {
    return false;
  }
};

/**
 * How closed the hand is, 0 (flat) → 1 (fist).
 *
 * Fingertip-to-wrist distance is divided by knuckle-to-wrist distance, so the
 * measure is scale-invariant: moving your hand nearer the camera must not read
 * as a squeeze.
 */
function gripFrom(points: Point[]): { grip: number; ratio: number } {
  const wrist = points[WRIST];
  const span = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  const palm = KNUCKLES.reduce((sum, k) => sum + span(points[k], wrist), 0) / KNUCKLES.length;
  if (palm < 1e-6) return { grip: 0, ratio: 0 };

  const reach = TIPS.reduce((sum, t) => sum + span(points[t], wrist), 0) / TIPS.length;
  const ratio = reach / palm;

  // Measured against a real hand: open reads ~1.90, a closed fist ~0.80.
  // The earlier band (2.05 → 1.10) was wrong — a relaxed hand already scored
  // 0.3 and a fist saturated well before it finished closing.
  const OPEN = 1.95;
  const CLOSED = 0.85;
  const grip = Math.min(1, Math.max(0, (OPEN - ratio) / (OPEN - CLOSED)));
  return { grip, ratio };
}

export function useHandSqueeze(onGrip: (grip: number) => void) {
  const [status, setStatus] = useState<HandStatus>("off");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Point[][] }; close?: () => void } | null>(null);
  const runningRef = useRef(false);
  // Held in a ref so the render loop never closes over a stale callback.
  const onGripRef = useRef(onGrip);
  onGripRef.current = onGrip;

  const [detail, setDetail] = useState("");

  const teardown = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }
    detectorRef.current?.close?.();
    detectorRef.current = null;
    onGripRef.current(0);
  }, []);

  const stop = useCallback(() => {
    if (debugOn()) console.info("[hand] stopped");
    teardown();
    setDetail("");
    setStatus("off");
  }, [teardown]);

  const start = useCallback(async () => {
    if (runningRef.current) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    const debug = debugOn();
    const log = (...args: unknown[]) => debug && console.info("[hand]", ...args);

    setStatus("starting");
    try {
      log("loading mediapipe...");
      // Loaded on demand: nobody who doesn't ask for this pays for it.
      const vision = await import("@mediapipe/tasks-vision");
      log("module loaded; resolving wasm from /mediapipe");
      const files = await vision.FilesetResolver.forVisionTasks("/mediapipe");
      log("wasm ready; building detector");
      const build = (delegate: "GPU" | "CPU") =>
        vision.HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate },
          runningMode: "VIDEO",
          numHands: 1,
        });
      // Some machines have no WebGL path for the delegate; CPU still runs fine
      // at this frame rate.
      const detector = await build("GPU").catch((e) => {
        log("GPU delegate unavailable, falling back to CPU:", e?.message ?? e);
        return build("CPU");
      });
      log("detector ready; asking for the camera");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: "user" },
        audio: false,
      });

      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      log(`camera live at ${video.videoWidth}x${video.videoHeight}`);

      detectorRef.current = detector as never;
      streamRef.current = stream;
      videoRef.current = video;
      runningRef.current = true;
      setStatus("watching");

      let last = -1;
      let lastLog = 0;
      let sawHand = false;
      let peak = 0;
      const tick = () => {
        if (!runningRef.current || !videoRef.current || !detectorRef.current) return;
        const now = performance.now();
        // The detector rejects a repeated timestamp.
        if (now !== last) {
          last = now;
          try {
            const out = detectorRef.current.detectForVideo(videoRef.current, now);
            const hand = out.landmarks?.[0];
            const read = hand ? gripFrom(hand) : { grip: 0, ratio: 0 };
            onGripRef.current(read.grip);

            if (debug) {
              if (hand && !sawHand) log("hand acquired");
              if (!hand && sawHand) log("hand lost");
              sawHand = Boolean(hand);
              peak = Math.max(peak, read.grip);
              if (now - lastLog > 250) {
                lastLog = now;
                if (hand) {
                  const bar = "#".repeat(Math.round(read.grip * 20)).padEnd(20, ".");
                  console.info(
                    `[hand] ${bar} grip=${read.grip.toFixed(2)} ratio=${read.ratio.toFixed(2)}` +
                      `${read.grip > 0.82 ? "  <-- SQUEEZE (fires)" : ""}`
                  );
                } else {
                  console.info("[hand] .................... no hand in frame");
                }
              }
            }
          } catch {
            /* a dropped frame is not worth tearing the camera down for */
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      log("failed:", err);
      teardown();
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setDetail(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      setStatus(denied ? "denied" : "failed");
    }
  }, [teardown]);

  // Never leave the camera running behind us.
  useEffect(() => teardown, [teardown]);

  return { status, detail, start, stop };
}
