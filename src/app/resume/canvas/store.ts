"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParsedResume } from "../parsedResume";

/** A building block — one reusable accomplishment/bullet you can drop onto the
 *  résumé canvas. Lives in the blocks panel. */
export interface Block {
  id: string;
  text: string;
  tags: string[];
}

export interface CanvasState {
  /** One résumé per target role (keyed by role id), so each role keeps its own
   *  bullet combination. Null until the visitor picks a starting point. */
  byRole: Record<string, ParsedResume> | null;
  blocks: Block[];
  /** First-use timestamp (ms) — drives the sign-in nudge. */
  startedAt: number | null;
}

const KEY = "resume-canvas-v2";
const EMPTY: CanvasState = { byRole: null, blocks: [], startedAt: null };

export function blankResume(name = ""): ParsedResume {
  return { name, contact: [], summary: "", experience: [], education: [], awards: [], skills: [] };
}

function read(): CanvasState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as CanvasState) };
  } catch {
    return EMPTY;
  }
}

/** Local-first canvas state. Hydrates from localStorage on mount and writes back
 *  on every change, so anonymous visitors keep their work with no account. */
export function useCanvas() {
  const [state, setState] = useState<CanvasState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<CanvasState>) => setState((s) => ({ ...s, ...p })), []);

  /** Begin a session with a résumé per role, stamping the usage clock once. */
  const start = useCallback(
    (byRole: Record<string, ParsedResume>, blocks: Block[] = []) =>
      setState((s) => ({ byRole, blocks, startedAt: s.startedAt ?? Date.now() })),
    [],
  );

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { state, hydrated, patch, start, reset, setState };
}

/** Fires once `startedAt` is older than `seconds`. Used to nudge anonymous users
 *  to sign in and save. Re-checks on an interval while mounted. */
export function useUsageElapsed(startedAt: number | null, seconds = 30): boolean {
  const [elapsed, setElapsed] = useState(false);
  const started = useRef(startedAt);
  started.current = startedAt;

  useEffect(() => {
    const check = () => {
      if (started.current && Date.now() - started.current >= seconds * 1000) {
        setElapsed(true);
      }
    };
    check();
    const t = setInterval(check, 3_000);
    return () => clearInterval(t);
  }, [seconds]);

  return elapsed;
}

let counter = 0;
export function newBlockId(): string {
  counter += 1;
  return `b_${counter}_${Math.floor(performance.now())}`;
}
