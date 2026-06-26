// Synthesizes a short "keyboard typing" burst with the Web Audio API, so we
// don't need to ship an audio asset. A single shared AudioContext is reused.

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
  }
  return ctx;
}

/** Play a few rapid mechanical key clicks (simulates a quick burst of typing). */
export function playKeyboardSound(): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const now = audio.currentTime;
  const clicks = 5;

  for (let i = 0; i < clicks; i++) {
    const start = now + i * 0.055 + Math.random() * 0.012;
    const len = Math.floor(audio.sampleRate * 0.03);

    // Short noise burst with a fast percussive decay.
    const buffer = audio.createBuffer(1, len, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < len; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 3);
    }

    const src = audio.createBufferSource();
    src.buffer = buffer;

    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800 + Math.random() * 1600;
    filter.Q.value = 0.9;

    const gain = audio.createGain();
    gain.gain.value = 0.2;

    src.connect(filter).connect(gain).connect(audio.destination);
    src.start(start);
    src.stop(start + 0.05);
  }
}
