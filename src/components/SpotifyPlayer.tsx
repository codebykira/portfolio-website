"use client";

import { useEffect, useRef } from "react";

interface SpotifyPlayerProps {
  /** A Spotify URI, e.g. "spotify:playlist:29hKafNXqqmRYjLYSJwR3n". */
  uri: string;
  /** Height of the embed (152 ≈ compact, 360+ ≈ full list). */
  height?: number;
  /** Start playback as soon as the controller is ready. */
  autoPlay?: boolean;
}

interface SpotifyController {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (e: unknown) => void) => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: SpotifyController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";

// Spotify invokes window.onSpotifyIframeApiReady exactly once; cache the API so
// later mounts can reuse it without reloading the script.
let cachedApi: SpotifyIframeApi | null = null;
const readyWaiters: Array<(api: SpotifyIframeApi) => void> = [];

function whenApiReady(cb: (api: SpotifyIframeApi) => void) {
  if (cachedApi) {
    cb(cachedApi);
    return;
  }
  readyWaiters.push(cb);

  if (typeof window === "undefined") return;
  if (!window.onSpotifyIframeApiReady) {
    window.onSpotifyIframeApiReady = (api) => {
      cachedApi = api;
      readyWaiters.splice(0).forEach((w) => w(api));
    };
  }
  if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }
}

export default function SpotifyPlayer({
  uri,
  height = 152,
  autoPlay = false,
}: SpotifyPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let controller: SpotifyController | null = null;

    whenApiReady((api) => {
      if (cancelled || !hostRef.current) return;
      api.createController(
        hostRef.current,
        { uri, width: "100%", height },
        (ctrl) => {
          if (cancelled) {
            ctrl.destroy();
            return;
          }
          controller = ctrl;
          if (autoPlay) {
            // The controller is ready here; the opening click is the user
            // gesture that unlocks playback.
            ctrl.play();
          }
        }
      );
    });

    return () => {
      cancelled = true;
      controller?.destroy();
    };
  }, [uri, height, autoPlay]);

  return <div ref={hostRef} className="h-full w-full" />;
}
