/**
 * Provision the on-device hand-tracking assets into /public.
 *
 * These are ~30MB of WASM plus a 7.8MB model — too heavy to commit, and they
 * are only ever fetched when someone opts into gesture control. Run before
 * dev/build so the files exist without living in git.
 */
import { copyFile, mkdir, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const WASM_SRC = "node_modules/@mediapipe/tasks-vision/wasm";
const WASM_OUT = "public/mediapipe";
const MODEL_OUT = "public/models/hand_landmarker.task";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const WASM_FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

const exists = (p) => access(p).then(() => true, () => false);

await mkdir(WASM_OUT, { recursive: true });
await mkdir("public/models", { recursive: true });

for (const f of WASM_FILES) {
  if (await exists(`${WASM_OUT}/${f}`)) continue;
  await copyFile(`${WASM_SRC}/${f}`, `${WASM_OUT}/${f}`);
  console.log(`copied ${f}`);
}

if (await exists(MODEL_OUT)) {
  console.log("model already present");
} else {
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`model download failed: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(MODEL_OUT));
  console.log("downloaded hand_landmarker.task");
}
