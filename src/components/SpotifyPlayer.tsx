"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface SpotifyPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface SpotifyPlayerProps {
  /** A Spotify URI, e.g. "spotify:playlist:29hKafNXqqmRYjLYSJwR3n". */
  uri: string;
  /** Height of the embed (152 ≈ compact, 360+ ≈ full list). */
  height?: number;
}

interface SpotifyController {
  play: () => void;
  pause: () => void;
  destroy: () => void;
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

/**
 * Mount this once (kept alive, even when hidden) so the Spotify controller is
 * ready before the user interacts. Then call `play()` from a click handler so
 * playback starts within the user gesture and isn't blocked by autoplay policy.
 */
const SpotifyPlayer = forwardRef<SpotifyPlayerHandle, SpotifyPlayerProps>(
  function SpotifyPlayer({ uri, height = 152 }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SpotifyController | null>(null);
    const wantPlayRef = useRef(false);

    useImperativeHandle(
      ref,
      () => ({
        play() {
          if (controllerRef.current) controllerRef.current.play();
          else wantPlayRef.current = true; // controller not ready yet — queue it
        },
        pause() {
          wantPlayRef.current = false;
          controllerRef.current?.pause();
        },
      }),
      []
    );

    useEffect(() => {
      let cancelled = false;
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
            controllerRef.current = ctrl;
            if (wantPlayRef.current) {
              wantPlayRef.current = false;
              ctrl.play();
            }
          }
        );
      });
      return () => {
        cancelled = true;
        controllerRef.current?.destroy();
        controllerRef.current = null;
      };
    }, [uri, height]);

    return <div ref={hostRef} className="h-full w-full" />;
  }
);

export default SpotifyPlayer;
