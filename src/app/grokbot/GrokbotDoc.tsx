"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import "./grokbot.css";

// Scroll-reveal wrapper used for every section-level element.
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// The channel + thread mockup plays itself like a screen recording the first
// time it scrolls into view. Step indexes gate each message; the block's chip
// flips from WORKING to DELIVERED near the end.
const MOCK_STEPS = 10;
const STEP_DELAYS = [0, 900, 1800, 2900, 3900, 4700, 5600, 6800, 8000, 9200];

function TagMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [runId, setRunId] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = STEP_DELAYS.map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setStep(MOCK_STEPS);
      return;
    }
    play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [inView, reduced, play, runId]);

  const on = (i: number) => `gb-step${step >= i ? " on" : ""}`;
  const delivered = step >= 8;

  return (
    <div className="gb-mockwrap" ref={ref}>
      <div className="gb-mock">
        <button
          type="button"
          className="gb-replay gb-mono"
          onClick={() => {
            setStep(0);
            setRunId((r) => r + 1);
          }}
        >
          ↻ REPLAY
        </button>

        <div className="gb-pane">
          <p className="gb-pane-label gb-mono"># apartment-hunt · Kira, Sam</p>

          <div className={`gb-sys gb-mono ${on(1)}`}>Today 2:04 PM</div>

          <div className={`gb-line me ${on(1)}`}>
            <div className="gb-bubble">the Sunset place is back, $2.9k</div>
          </div>

          <div className={`gb-line ${on(2)}`}>
            <div className="gb-name">Sam</div>
            <div className="gb-bubble">
              no parking one right? can we get comps
            </div>
          </div>

          <div className={`gb-line me ${on(3)}`}>
            <div className="gb-bubble">
              <strong>@grok</strong> comps for 2BRs near Sunset under $3k
            </div>
          </div>

          <div className={`gb-block ${on(4)}`}>
            <div className="gb-block-head">
              <div className="gb-av bot">G</div>
              <div className="gb-block-name">grok · comp check</div>
              {delivered ? (
                <span className="gb-chip done gb-mono">DELIVERED</span>
              ) : (
                <span className="gb-chip working gb-mono">WORKING</span>
              )}
            </div>
            <div className="gb-block-body">
              {delivered ? (
                <>
                  14 comps. Median $2,780 — Sunset is 4% over, mostly the
                  laundry. Table in thread.
                </>
              ) : (
                <span className="gb-typing" aria-label="working">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <div className="gb-block-foot">
              <span className="gb-thread-link">Open thread →</span>
              <span className="gb-replies">
                {delivered ? "6 replies · Kira, Sam, grok" : "in progress"}
              </span>
            </div>
            <div className="gb-ask">
              <b>+</b> Ask a follow-up…
            </div>
          </div>

          <div className={`gb-line ${on(9)}`}>
            <div className="gb-name">Sam</div>
            <div className="gb-bubble">
              4% over is fine, laundry is worth it
            </div>
          </div>

          <div className="gb-composerbar">
            <b>+</b> Message #apartment-hunt
          </div>
        </div>

        <div className="gb-pane">
          <p className="gb-pane-label gb-mono">Thread · comp check</p>

          <div className={`gb-line ${on(5)}`}>
            <div className="gb-name">grok</div>
            <div className="gb-bubble">
              Pulling the last 60 days. Screen&rsquo;s live if you want to
              watch.
            </div>
          </div>

          <div className={`gb-screenpane gb-mono ${on(6)}`}>
            ▣ grok&rsquo;s screen — live
          </div>

          <div className={`gb-line ${on(7)}`}>
            <div className="gb-name">Sam</div>
            <div className="gb-bubble">skip anything below the park</div>
          </div>

          <div className={`gb-line ${on(8)}`}>
            <div className="gb-name">grok</div>
            <div className="gb-bubble">
              Dropped 3 — median $2,780. Saved{" "}
              <span className="gb-code">/workspace/comps.csv</span>. Posting
              the summary back.
            </div>
          </div>
        </div>
      </div>
      <p className="gb-caption gb-mono">
        The channel gets one block. The thread holds the work.
      </p>
    </div>
  );
}

// The blob mascot. Its eyes track the cursor: each eye sits in a wrapper
// that translates toward the pointer (the blink animation owns the bar's own
// transform, so the follow lives on the wrapper).
function Blob() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(d / 60, 1) * 8;
        el.style.setProperty("--ex", `${(dx / d) * reach}px`);
        el.style.setProperty("--ey", `${(dy / d) * reach * 0.8}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="gb-blob" ref={ref} aria-hidden="true">
      <span className="gb-eye">
        <i />
      </span>
      <span className="gb-eye">
        <i />
      </span>
    </div>
  );
}

// Interactive composer sketch: click + to open the To: menu, pick
// "Create group chat", then add humans by email. Mirrors the desktop app's
// new-chat flow, extended so bots and people are the same kind of addressee.
type ComposerStage = "idle" | "menu" | "group" | "started";

function initials(email: string) {
  const name = email.split("@")[0] || "?";
  return name.slice(0, 2).toUpperCase();
}

function ComposerMock() {
  const [stage, setStage] = useState<ComposerStage>("idle");
  const [people, setPeople] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addPerson = (email: string) => {
    const v = email.trim().replace(/,$/, "");
    if (!v.includes("@") || v.length < 3) return;
    setPeople((p) => (p.includes(v) ? p : [...p, v]));
    setDraft("");
    inputRef.current?.focus();
  };

  const reset = () => {
    setStage("idle");
    setPeople([]);
    setDraft("");
  };

  return (
    <div className="gb-cw">
      {stage !== "idle" && (
        <button type="button" className="gb-replay gb-mono" onClick={reset}>
          ↻ RESET
        </button>
      )}
      <div className="gb-cw-bar">
        <span className="gb-dot r" />
        <span className="gb-dot y" />
        <span className="gb-dot g" />
        <span className="gb-cw-title gb-mono">grok · web</span>
        <button
          type="button"
          className={`gb-plusbtn${stage === "idle" ? " gb-hint" : ""}`}
          aria-label="New chat"
          onClick={() => stage === "idle" && setStage("menu")}
        >
          +
        </button>
      </div>
      <div className="gb-cw-body">
        <div className="gb-cw-side">
          <div className="gb-cw-search">⌕ Search</div>
          <div
            className={`gb-cw-row${stage !== "idle" ? " active" : ""}`}
            aria-hidden="true"
          >
            <div className="gb-av bot" style={{ borderRadius: "50%" }}>
              +
            </div>
            <div>
              <div className="gb-who">New chat</div>
            </div>
          </div>
          <div className="gb-cw-row">
            <div className="gb-av j">JA</div>
            <div>
              <div className="gb-who">
                Job App <span>2:18 PM</span>
              </div>
              <div className="sub">Weekday 9am routine is tighte…</div>
            </div>
          </div>
          <div className="gb-cw-row">
            <div className="gb-av bot">NB</div>
            <div>
              <div className="gb-who">
                New Bot <span>1:36 PM</span>
              </div>
              <div className="sub">Hey. What&rsquo;s up?</div>
            </div>
          </div>
        </div>

        <div className="gb-cw-main">
          {stage === "idle" && (
            <div className="gb-cw-empty gb-mono">
              THIS ONE&rsquo;S CLICKABLE
              <br />
              hit the + to start a new chat
            </div>
          )}

          {stage === "menu" && (
            <>
              <div className="gb-to">
                <span className="gb-to-label">To:</span>
                <span className="gb-to-ph">Search or create Bots</span>
              </div>
              <div className="gb-menu">
                <button type="button" className="gb-menurow">
                  <span className="icon">+</span>
                  Create new Bot
                  <span className="gb-kbd">
                    <i>⌘</i>
                    <i>1</i>
                  </span>
                </button>
                <button
                  type="button"
                  className="gb-menurow gb-hint"
                  onClick={() => setStage("group")}
                >
                  <span className="icon">⚇</span>
                  Create group chat
                  <span className="gb-kbd">
                    <i>⌘</i>
                    <i>2</i>
                  </span>
                </button>
                <button type="button" className="gb-menurow">
                  <span className="icon">
                    <span className="gb-av j" style={{ width: 18, height: 18, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      JA
                    </span>
                  </span>
                  Job App
                  <span className="gb-kbd">
                    <i>⌘</i>
                    <i>3</i>
                  </span>
                </button>
                <button type="button" className="gb-menurow">
                  <span className="icon">
                    <span className="gb-av bot" style={{ width: 18, height: 18, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      NB
                    </span>
                  </span>
                  New Bot
                  <span className="gb-kbd">
                    <i>⌘</i>
                    <i>4</i>
                  </span>
                </button>
              </div>
            </>
          )}

          {(stage === "group" || stage === "started") && (
            <>
              <div className="gb-to">
                <span className="gb-to-label">To:</span>
                <span className="gb-tochip">
                  <span className="gb-av bot">NB</span>
                  New Bot
                </span>
                {people.map((email) => (
                  <span className="gb-tochip human" key={email}>
                    <span className="gb-av s">{initials(email)}</span>
                    {email}
                    {stage === "group" && (
                      <button
                        type="button"
                        aria-label={`Remove ${email}`}
                        onClick={() =>
                          setPeople((p) => p.filter((e) => e !== email))
                        }
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {stage === "group" && (
                  <input
                    ref={inputRef}
                    className="gb-toinput"
                    placeholder="Add people — type an email and hit enter"
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addPerson(draft);
                      }
                    }}
                  />
                )}
              </div>

              {stage === "group" && (
                <>
                  <p className="gb-invitehint gb-mono">
                    an email is an addressee that gets a link
                  </p>
                  {draft.includes("@") && (
                    <button
                      type="button"
                      className="gb-suggest"
                      onClick={() => addPerson(draft)}
                    >
                      <span className="gb-av s">{initials(draft)}</span>
                      <span>
                        Invite <b>{draft.trim()}</b>
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="gb-startbtn"
                    disabled={people.length === 0}
                    onClick={() => setStage("started")}
                  >
                    Start group chat →
                  </button>
                </>
              )}

              {stage === "started" && (
                <>
                  <p className="gb-sys gb-mono">
                    {people.join(", ")} invited — joins as a guest until they
                    make a profile
                  </p>
                  <div className="gb-line gb-step on">
                    <div className="gb-name">New Bot</div>
                    <div className="gb-bubble">Hey. What&rsquo;s up?</div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// A model card whose glyph strokes draw themselves in on first view.
function Model({
  letter,
  title,
  tagline,
  glyph,
  children,
}: {
  letter: string;
  title: string;
  tagline?: string;
  glyph: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <Reveal>
      <div ref={ref} className={`gb-model${inView ? " is-in" : ""}`}>
        <div className="gb-model-glyph">{glyph}</div>
        <div>
          <span className="gb-model-letter gb-mono">{letter}</span>
          <h3 className="gb-h3 gb-display">{title}</h3>
          {tagline && <p className="gb-tagline">{tagline}</p>}
          {children}
        </div>
      </div>
    </Reveal>
  );
}

export default function GrokbotDoc() {
  const reduced = useReducedMotion();

  // The site's global styles paint body white; keep the whole viewport
  // (overscroll included) black while this page is mounted. CSS :has()
  // covers this too — this is the fallback for browsers without it.
  useEffect(() => {
    const html = document.documentElement;
    const prevBody = document.body.style.background;
    const prevHtml = html.style.background;
    document.body.style.background = "#0b0b0c";
    html.style.background = "#0b0b0c";
    return () => {
      document.body.style.background = prevBody;
      html.style.background = prevHtml;
    };
  }, []);

  return (
    <main className="gb">
      <div className="gb-col">
        <header className="gb-masthead">
          <Blob />
          <motion.h1
            className="gb-h1 gb-display"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Grok goes multiplayer
          </motion.h1>
          <motion.p
            className="gb-dek"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            Notes on grok for the web, with more than one person in the room.
          </motion.p>
          <motion.p
            className="gb-byline gb-mono"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <b>Kira Cheung</b> · draft for discussion · Sept 2026
          </motion.p>
        </header>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">01 · Define</p>
            <h2 className="gb-h2 gb-display">Today: one person, one bot</h2>
            <p>
              Grok is a desktop app. Each bot is a DM with its own screen,
              routines, and plugins. Only you see any of it.
            </p>
            <p>
              A web page has a link, and links get shared. So: what is the
              bot when two people are in the room?
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">02 · Diverge</p>
            <h2 className="gb-h2 gb-display">
              Four ways to put a bot in a room
            </h2>
          </Reveal>

          <Model
            letter="MODEL A"
            title="The Tag"
            glyph={
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect
                  className="draw"
                  x="4"
                  y="4"
                  width="56"
                  height="56"
                  rx="10"
                  fill="none"
                  stroke="#2a2a2e"
                  strokeWidth="2"
                />
                <rect x="12" y="13" width="28" height="5" rx="2.5" fill="#6c6c73" />
                <rect x="12" y="23" width="40" height="5" rx="2.5" fill="#6c6c73" />
                <rect
                  className="draw"
                  x="12"
                  y="33"
                  width="40"
                  height="17"
                  rx="5"
                  fill="#0f2916"
                  stroke="#34c95e"
                  strokeWidth="2"
                />
                <circle cx="20" cy="41.5" r="4" fill="#34c95e" />
              </svg>
            }
          >
            <p>
              A normal group chat. You{" "}
              <span className="gb-chip-inline gb-mono">@grok</span> it, it
              posts one block with the result. Deeper work happens in a
              thread on that block.
            </p>
          </Model>

          <Model
            letter="MODEL B"
            title="The Room"
            glyph={
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect
                  className="draw"
                  x="4"
                  y="4"
                  width="56"
                  height="56"
                  rx="10"
                  fill="none"
                  stroke="#2a2a2e"
                  strokeWidth="2"
                />
                <rect
                  className="draw"
                  x="12"
                  y="12"
                  width="26"
                  height="40"
                  rx="5"
                  fill="#0f2916"
                  stroke="#34c95e"
                  strokeWidth="2"
                />
                <circle cx="47" cy="23" r="5" fill="#6c6c73" />
                <circle cx="47" cy="40" r="5" fill="#6c6c73" />
              </svg>
            }
          >
            <p>
              Invite people into the bot&rsquo;s chat. Everyone sees the same
              conversation and the same screen. Good for watching together,
              not a home.
            </p>
          </Model>

          <Model
            letter="MODEL C"
            title="The Teammate"
            glyph={
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect
                  className="draw"
                  x="4"
                  y="4"
                  width="56"
                  height="56"
                  rx="10"
                  fill="none"
                  stroke="#2a2a2e"
                  strokeWidth="2"
                />
                <circle cx="18" cy="19" r="5" fill="#6c6c73" />
                <circle cx="18" cy="33" r="5" fill="#6c6c73" />
                <rect x="13" y="43" width="10" height="10" rx="3.5" fill="#34c95e" />
                <rect x="30" y="16" width="22" height="5" rx="2.5" fill="#2a2a2e" />
                <rect x="30" y="30" width="22" height="5" rx="2.5" fill="#2a2a2e" />
                <rect
                  className="draw"
                  x="30"
                  y="44"
                  width="22"
                  height="7"
                  rx="3.5"
                  fill="#0f2916"
                  stroke="#34c95e"
                  strokeWidth="1.5"
                />
              </svg>
            }
          >
            <p>
              The bot is a full member. It has a name, joins channels, and
              posts on its own schedule. Most powerful, most noisy. Later.
            </p>
          </Model>

          <Model
            letter="MODEL D"
            title="The Link"
            glyph={
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect
                  className="draw"
                  x="4"
                  y="14"
                  width="26"
                  height="36"
                  rx="7"
                  fill="#0f2916"
                  stroke="#34c95e"
                  strokeWidth="2"
                />
                <path
                  className="draw"
                  d="M35 32 h14 m0 0 l-5 -5 m5 5 l-5 5"
                  stroke="#6c6c73"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="56" cy="32" r="5" fill="#6c6c73" />
              </svg>
            }
          >
            <p>
              Keep it single player, but every chat gets a share link.
              Boring, and it&rsquo;s the plumbing the other three need.
            </p>
          </Model>

          <Model
            letter="MODEL E"
            title="The Side Chat"
            glyph={
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect
                  className="draw"
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="10"
                  fill="none"
                  stroke="#2a2a2e"
                  strokeWidth="2"
                />
                <rect x="12" y="14" width="24" height="5" rx="2.5" fill="#6c6c73" />
                <rect x="12" y="24" width="18" height="5" rx="2.5" fill="#6c6c73" />
                <rect
                  className="draw"
                  x="34"
                  y="36"
                  width="26"
                  height="22"
                  rx="8"
                  fill="#0f2916"
                  stroke="#34c95e"
                  strokeWidth="2"
                />
                <path
                  className="draw"
                  d="M34 47 h-12 m0 0 l5 -5 m-5 5 l5 5"
                  stroke="#34c95e"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            <p>
              Step out and chat with the bot alone. When you land on
              something, post one conclusion back to the room. Draft in
              private, publish in public.
            </p>
          </Model>
        </section>
      </div>

      <div className="gb-wide">
        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">03 · Converge</p>
            <h2 className="gb-h2 gb-display">Side by side</h2>
            <p>What actually differs:</p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="gb-tablewrap">
              <table className="gb-table">
                <thead>
                  <tr>
                    <th>Axis</th>
                    <th>A · Tag</th>
                    <th>B · Room</th>
                    <th>C · Teammate</th>
                    <th>D · Link</th>
                    <th>E · Side Chat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="axis">Who owns the space</td>
                    <td>
                      <span className="gb-win">Humans</span>; bot is a guest
                      object
                    </td>
                    <td>The bot; humans are guests</td>
                    <td>Shared; bot is a peer</td>
                    <td>One human</td>
                    <td>One human + the bot</td>
                  </tr>
                  <tr>
                    <td className="axis">Unit of bot work</td>
                    <td>A thread (= one session)</td>
                    <td>The room&rsquo;s one long session</td>
                    <td>Ambient; many overlapping asks</td>
                    <td>A session</td>
                    <td>A private session</td>
                  </tr>
                  <tr>
                    <td className="axis">What the bot can read</td>
                    <td>Its thread only, unless invited</td>
                    <td>Everything in the room</td>
                    <td>
                      <span className="gb-risk">Potentially everything</span>
                    </td>
                    <td>Owner&rsquo;s session only</td>
                    <td>The side chat only</td>
                  </tr>
                  <tr>
                    <td className="axis">Whose credentials</td>
                    <td>The summoner&rsquo;s, per block</td>
                    <td>The room owner&rsquo;s</td>
                    <td>
                      <span className="gb-risk">
                        Needs its own service identity
                      </span>
                    </td>
                    <td>The owner&rsquo;s</td>
                    <td>Your own</td>
                  </tr>
                  <tr>
                    <td className="axis">Noise profile</td>
                    <td>
                      <span className="gb-win">Low</span> — one block, replies
                      threaded
                    </td>
                    <td>Contained to the room</td>
                    <td>
                      <span className="gb-risk">High</span> — can post anywhere
                    </td>
                    <td>None</td>
                    <td>None until you publish</td>
                  </tr>
                  <tr>
                    <td className="axis">Routines become</td>
                    <td>Scheduled blocks posted to a channel</td>
                    <td>Events inside the room</td>
                    <td>Unprompted posts as a member</td>
                    <td>Same as desktop, plus a link</td>
                    <td>Personal only</td>
                  </tr>
                  <tr>
                    <td className="axis">Build cost on top of D</td>
                    <td>Channels + block UI + threads</td>
                    <td>Presence + shared screen only</td>
                    <td>Identity, ACLs, speak-rules</td>
                    <td>
                      <span className="gb-win">Baseline</span>
                    </td>
                    <td>A + a publish button</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="gb-caption gb-mono">
              D is the plumbing. A is the first surface. B and E are features
              of A. C comes later.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">04 · Prototype</p>
            <h2 className="gb-h2 gb-display">The Tag, up close</h2>
            <p>
              Two people talking, one asks the bot, the work forks into a
              thread:
            </p>
          </Reveal>

          <TagMock />

          <div className="gb-col" style={{ marginLeft: 0 }}>
            <Reveal>
              <h3 className="gb-h3 gb-display">The rules</h3>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="gb-rules">
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">01</span>
                  <div>
                    <b>One block per ask.</b>
                    <p>
                      The bot edits it in place: queued → working → delivered.
                      Everything else stays in the thread.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">02</span>
                  <div>
                    <b>A thread is a session.</b>
                    <p>
                      Opening it opens the bot&rsquo;s context, screen, and
                      files. Same thing as a desktop DM, just shared.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">03</span>
                  <div>
                    <b>Anyone can steer. The asker owns it.</b>
                    <p>
                      Logins and the stop button stay with whoever asked.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">04</span>
                  <div>
                    <b>It reads the thread, not the room.</b>
                    <p>
                      Channel history gets shared on purpose, or not at all.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">05</span>
                  <div>
                    <b>Conflicts get asked, not averaged.</b>
                    <p>
                      Two people, opposite asks — the bot says so and asks,
                      instead of obeying the last message.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">06</span>
                  <div>
                    <b>Routines post blocks.</b>
                    <p>A schedule is a block that posts itself.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="gb-col" style={{ marginLeft: 0 }}>
            <Reveal>
              <h3 className="gb-h3 gb-display">Adding a person</h3>
              <p>
                An email is just another addressee. They get a link, it opens
                in the browser. Click through it:
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <ComposerMock />
            <p className="gb-caption gb-mono">
              The invite is a link to the room.
            </p>
          </Reveal>

          <div className="gb-col" style={{ marginLeft: 0 }}>
            <Reveal>
              <h3 className="gb-h3 gb-display">Email → guest → profile</h3>
              <p>The invite raises an identity question, same as Google Docs:</p>
              <div className="gb-map">
                <div className="gb-maprow">
                  <span className="from">Invited</span>
                  <span className="arrow">→</span>
                  <span className="to">The chip is an email.</span>
                </div>
                <div className="gb-maprow">
                  <span className="from">Opens the link</span>
                  <span className="arrow">→</span>
                  <span className="to">
                    Picks a name, joins as a guest. Can talk and steer.
                  </span>
                </div>
                <div className="gb-maprow">
                  <span className="from">Makes a profile</span>
                  <span className="arrow">→</span>
                  <span className="to">
                    The email turns into a name everywhere. Only a profile can
                    connect logins or own a block.
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <div className="gb-col">
        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">05 · Constraints</p>
            <h2 className="gb-h2 gb-display">The hard problems</h2>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Who is it working for?</h3>
              <p className="gb-stance">
                <b>Call:</b> whoever asked. Everyone else is input. When
                unclear, it asks in the thread.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Whose logins?</h3>
              <p className="gb-stance">
                <b>Call:</b> logins never pool. The bot asks the person whose
                account it needs.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">What does it remember?</h3>
              <p className="gb-stance">
                <b>Call:</b> memory stays where it was learned. DMs stay in
                DMs. Side chats stay private.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Two people, one run</h3>
              <p className="gb-stance">
                <b>Call:</b> new messages queue, visibly. Anyone can hit stop.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Who pays?</h3>
              <p className="gb-stance">
                <b>Call:</b> the workspace. Each block shows its cost.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">06 · Map</p>
            <h2 className="gb-h2 gb-display">Desktop → web</h2>
            <p>Everything maps:</p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="gb-map">
              <div className="gb-maprow">
                <span className="from">A bot&rsquo;s DM</span>
                <span className="arrow">→</span>
                <span className="to">A hosted session with a URL</span>
              </div>
              <div className="gb-maprow">
                <span className="from">The bot&rsquo;s screen</span>
                <span className="arrow">→</span>
                <span className="to">A live pane streamed from a server</span>
              </div>
              <div className="gb-maprow">
                <span className="from">Routines</span>
                <span className="arrow">→</span>
                <span className="to">Server schedules that post blocks</span>
              </div>
              <div className="gb-maprow">
                <span className="from">Plugins</span>
                <span className="arrow">→</span>
                <span className="to">Per-person logins, asked for in-thread</span>
              </div>
              <div className="gb-maprow">
                <span className="from">The sidebar of bots</span>
                <span className="arrow">→</span>
                <span className="to">A sidebar of chats; bots appear as blocks</span>
              </div>
            </div>
            <p>Build order: D → A → B and E → C.</p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">07 · Iterate</p>
            <h2 className="gb-h2 gb-display">Open questions</h2>
            <ul className="gb-openq">
              <li>Is the block a message or a mini app?</li>
              <li>Can a thread be pinned and become a room?</li>
              <li>Two bots in one channel?</li>
              <li>Can someone join a single thread by link?</li>
              <li>
                Does a guest&rsquo;s side chat survive if they never make a
                profile?
              </li>
              <li>
                What does day one look like before the second person shows up?
              </li>
            </ul>
          </Reveal>
        </section>

        <footer className="gb-footer gb-mono">
          <span>grok multiplayer · draft v1</span>
          <span>next: block states as real frames</span>
        </footer>
      </div>
    </main>
  );
}
