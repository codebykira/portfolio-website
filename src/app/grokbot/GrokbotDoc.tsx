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

// Shared eye-tracking: sets --ex/--ey on the element so its eyes lean
// toward the cursor. Every bot face on the page uses this.
function useEyeFollow<T extends HTMLElement>(reach = 5) {
  const ref = useRef<T>(null);
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
        if (r.width === 0) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(d / 60, 1) * reach;
        el.style.setProperty("--ex", `${(dx / d) * m}px`);
        el.style.setProperty("--ey", `${(dy / d) * m * 0.8}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, reach]);
  return ref;
}

// Bot avatar: the app's blob with dash eyes.
function BlobAv({ color, sm }: { color: "g" | "j"; sm?: boolean }) {
  const ref = useEyeFollow<HTMLSpanElement>(2.5);
  return (
    <span
      ref={ref}
      className={`gb-blobav ${color}${sm ? " sm" : ""}`}
      aria-hidden="true"
    >
      <i />
      <i />
    </span>
  );
}

// The bot's screen, shown the way the app shows it: a light thumbnail with a
// caption underneath.
function ScreenThumb({ caption }: { caption: string }) {
  return (
    <div className="gb-screenwrap">
      <div className="gb-screen-thumb">
        <i />
        <i />
        <i />
      </div>
      <div className="gb-screen-cap">{caption}</div>
    </div>
  );
}

// The channel + thread mockup plays itself like a screen recording the first
// time it scrolls into view. Step indexes gate each message; the block's chip
// flips from WORKING to DELIVERED near the end.
const MOCK_STEPS = 9;
const STEP_DELAYS = [0, 800, 2200, 3200, 4000, 4900, 5800, 6900, 8100];

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
  const delivered = step >= 3;

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
          <p className="gb-pane-label gb-mono">Option 1 · work in a thread</p>

          <div className={`gb-line me ${on(1)}`}>
            <div className="gb-bubble">
              <strong>@grok</strong> draft the launch deck, 6 slides
            </div>
          </div>

          <div className={`gb-block ${on(2)}`}>
            <div className="gb-block-head">
              <BlobAv color="g" sm />
              <div className="gb-block-name">grok · launch deck</div>
              {delivered ? (
                <span className="gb-chip done gb-mono">DELIVERED</span>
              ) : (
                <span className="gb-chip working gb-mono">WORKING</span>
              )}
            </div>
            <div className="gb-block-body">
              {delivered ? (
                <>6 slides drafted. Review in the thread.</>
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
                {delivered ? "4 replies · Kira, Sam, grok" : "in progress"}
              </span>
            </div>
            <div className="gb-ask">
              <b>+</b> Ask a follow-up…
            </div>
          </div>

          <div className={`gb-line ${on(4)}`}>
            <div className="gb-name">Sam</div>
            <div className="gb-bubble">clean. one card in the chat</div>
          </div>

          <div className="gb-composerbar">
            <b>+</b> Message #launch
          </div>
        </div>

        <div className="gb-pane">
          <p className="gb-pane-label gb-mono">Option 2 · work in the chat</p>

          <div className={`gb-line me ${on(5)}`}>
            <div className="gb-bubble">
              <strong>@grok</strong> draft the launch deck, 6 slides
            </div>
          </div>

          <div className={`gb-line ${on(6)}`}>
            <div className="gb-name">grok</div>
            <div className="gb-bubble">On it — drafting 6 slides.</div>
          </div>

          <div className={on(7)}>
            <ScreenThumb caption="grok's screen" />
          </div>

          <div className={on(8)}>
            <div className="gb-attn">
              <p className="ttl">Needs your attention</p>
              <p className="bd">
                Slide 3 could be a chart or a table — pick one on my screen,
                then hand it back.
              </p>
              <div className="btns">
                <button type="button" className="gb-btn subtle">
                  Skip this step
                </button>
                <button type="button" className="gb-btn">
                  I&rsquo;m done, continue
                </button>
              </div>
            </div>
          </div>

          <div className={`gb-line ${on(9)}`}>
            <div className="gb-name">grok</div>
            <div className="gb-bubble">
              Done — 6 slides. Saved{" "}
              <span className="gb-code">/workspace/launch-deck.key</span>.
            </div>
          </div>
        </div>
      </div>
      <p className="gb-caption gb-mono">
        Thread keeps the room quiet. In-chat lets everyone watch. Could be a
        toggle per ask.
      </p>
    </div>
  );
}

// The blob mascot. Its eyes track the cursor: each eye sits in a wrapper
// that translates toward the pointer (the blink animation owns the bar's own
// transform, so the follow lives on the wrapper).
function Blob() {
  const ref = useEyeFollow<HTMLDivElement>(8);

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
            <div
              className="gb-av"
              style={{ background: "#2c2c2e", color: "#ebebf0" }}
            >
              +
            </div>
            <div>
              <div className="gb-who">New chat</div>
            </div>
          </div>
          <div className="gb-cw-row">
            <BlobAv color="j" />
            <div>
              <div className="gb-who">
                Job App <span>2:18 PM</span>
              </div>
              <div className="sub">Weekday 9am routine is tighte…</div>
            </div>
          </div>
          <div className="gb-cw-row">
            <BlobAv color="g" />
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
                    <BlobAv color="j" sm />
                  </span>
                  Job App
                  <span className="gb-kbd">
                    <i>⌘</i>
                    <i>3</i>
                  </span>
                </button>
                <button type="button" className="gb-menurow">
                  <span className="icon">
                    <BlobAv color="g" sm />
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
                  <BlobAv color="g" sm />
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

// Mini prototypes, one per model, in the app's own chat language.

// A: the block delivers itself shortly after scrolling into view.
function MockTag() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, [inView, reduced]);
  return (
    <div className="gb-mock single" ref={ref}>
      <div className="gb-pane">
        <p className="gb-pane-label gb-mono"># launch</p>
        <div className="gb-line me">
          <div className="gb-bubble">
            <strong>@grok</strong> draft the launch deck
          </div>
        </div>
        <div className="gb-block">
          <div className="gb-block-head">
            <BlobAv color="g" sm />
            <div className="gb-block-name">grok · launch deck</div>
            {done ? (
              <span className="gb-chip done gb-mono">DELIVERED</span>
            ) : (
              <span className="gb-chip working gb-mono">WORKING</span>
            )}
          </div>
          <div className="gb-block-body">
            {done ? (
              <>6 slides drafted. Review in thread.</>
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
              {done ? "4 replies" : "in progress"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// B: two people co-watching the bot's shared screen.
function MockRoom() {
  return (
    <div className="gb-mock single">
      <div className="gb-pane">
        <p className="gb-pane-label gb-mono">New Bot · room</p>
        <div className="gb-presence">
          <div className="gb-av k">KC</div>
          <div className="gb-av s">SD</div>
          <span className="lbl gb-mono">2 WATCHING LIVE</span>
        </div>
        <ScreenThumb caption="New Bot's screen — everyone sees this" />
        <div className="gb-line">
          <div className="gb-name">Sam</div>
          <div className="gb-bubble">it&rsquo;s on the wrong tab</div>
        </div>
        <div className="gb-line">
          <div className="gb-name">New Bot</div>
          <div className="gb-bubble">Fixed — watching the right one now.</div>
        </div>
      </div>
    </div>
  );
}

// C: a routine posts unprompted, then answers a follow-up.
function MockTeammate() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setStep(3);
      return;
    }
    const ts = [400, 1400, 2400].map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
    return () => ts.forEach(clearTimeout);
  }, [inView, reduced]);
  const on = (i: number) => `gb-step${step >= i ? " on" : ""}`;
  return (
    <div className="gb-mock single" ref={ref}>
      <div className="gb-pane">
        <p className="gb-pane-label gb-mono"># standup · 4 people + grok</p>
        <div className={`gb-sys gb-mono ${on(1)}`}>
          Routine · weekdays 9:00 AM
        </div>
        <div className={`gb-line ${on(1)}`}>
          <div className="gb-name">grok</div>
          <div className="gb-bubble">
            Morning digest: 3 PRs merged, 1 flaky test, deploy at noon.
          </div>
        </div>
        <div className={`gb-line me ${on(2)}`}>
          <div className="gb-bubble">whose test is flaky?</div>
        </div>
        <div className={`gb-line ${on(3)}`}>
          <div className="gb-name">grok</div>
          <div className="gb-bubble">
            Sam&rsquo;s — checkout flow, fails 1 in 5.
          </div>
        </div>
      </div>
    </div>
  );
}

// D: a share card — flip the permission, copy the link.
function MockLink() {
  const [copied, setCopied] = useState(false);
  const [perm, setPerm] = useState<"VIEW" | "STEER">("VIEW");
  return (
    <div className="gb-mock single">
      <div className="gb-pane">
        <p className="gb-pane-label gb-mono">Job App · just you</p>
        <div className="gb-line me">
          <div className="gb-bubble">send this run to Sam</div>
        </div>
        <div className="gb-sharecard">
          <span className="gb-code">grok.app/s/job-app/8f2k</span>
          <button
            type="button"
            className="gb-share-perm gb-mono"
            onClick={() => setPerm(perm === "VIEW" ? "STEER" : "VIEW")}
          >
            CAN {perm} ▾
          </button>
          <button
            type="button"
            className="gb-copybtn gb-mono"
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
          >
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        </div>
        <div className="gb-line">
          <div className="gb-name">Job App</div>
          <div className="gb-bubble">
            {perm === "VIEW"
              ? "Sam can watch this session."
              : "Sam can watch and steer this session."}
          </div>
        </div>
      </div>
    </div>
  );
}

// E: draft privately, then actually post the conclusion.
function MockSideChat() {
  const [posted, setPosted] = useState(false);
  return (
    <div className="gb-mock single">
      <div className="gb-pane">
        <p className="gb-pane-label gb-mono">Side chat · private</p>
        <div className="gb-line me">
          <div className="gb-bubble">is the pricing slide too dense?</div>
        </div>
        <div className="gb-line">
          <div className="gb-name">grok</div>
          <div className="gb-bubble">
            Split it into two. Want the split drafted?
          </div>
        </div>
        {posted ? (
          <>
            <div className="gb-sys gb-mono">posted to #launch</div>
            <div className="gb-block">
              <div className="gb-block-head">
                <BlobAv color="g" sm />
                <div className="gb-block-name">
                  grok · via Kira&rsquo;s side chat
                </div>
                <span className="gb-chip done gb-mono">POSTED</span>
              </div>
              <div className="gb-block-body">
                Pricing slide split in two — clearer story.
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="gb-publish gb-mono"
            onClick={() => setPosted(true)}
          >
            → Post conclusion to #launch
          </button>
        )}
      </div>
    </div>
  );
}

// Each option is one of the app's bot shapes, in its own color.
function Shape({
  kind,
  color,
}: {
  kind: "circle" | "squircle" | "hex" | "pill" | "blob";
  color: string;
}) {
  const ref = useEyeFollow<HTMLDivElement>(4.5);
  return (
    <div
      ref={ref}
      className={`gb-shape ${kind}`}
      style={{ background: color }}
      aria-hidden="true"
    >
      <i />
      <i />
    </div>
  );
}

function Model({
  shape,
  title,
  children,
}: {
  shape: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="gb-model">
        <div className="gb-model-glyph">{shape}</div>
        <div>
          <h3 className="gb-h3 gb-display">{title}</h3>
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
              Five ways to put a bot in a room
            </h2>
          </Reveal>

          <Model
            title="The Tag"
            shape={<Shape kind="circle" color="#d6437f" />}
          >
            <p>
              A normal group chat. You{" "}
              <span className="gb-chip-inline gb-mono">@grok</span> it, it
              posts one block with the result. Deeper work happens in a
              thread on that block.
            </p>
            <MockTag />
          </Model>

          <Model
            title="The Room"
            shape={<Shape kind="squircle" color="#e8702a" />}
          >
            <p>
              Invite people into the bot&rsquo;s chat. Everyone sees the same
              conversation and the same screen. Good for watching together,
              not a home.
            </p>
            <MockRoom />
          </Model>

          <Model
            title="The Teammate"
            shape={<Shape kind="hex" color="#3b76e8" />}
          >
            <p>
              The bot is a full member. It has a name, joins channels, and
              posts on its own schedule. Most powerful, most noisy. Later.
            </p>
            <MockTeammate />
          </Model>

          <Model
            title="The Link"
            shape={<Shape kind="pill" color="#2ba58c" />}
          >
            <p>
              Keep it single player, but every chat gets a share link.
              Boring, and it&rsquo;s the plumbing the other three need.
            </p>
            <MockLink />
          </Model>

          <Model
            title="The Side Chat"
            shape={<Shape kind="blob" color="#7a52e0" />}
          >
            <p>
              Step out and chat with the bot alone. When you land on
              something, post one conclusion back to the room. Draft in
              private, publish in public.
            </p>
            <MockSideChat />
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
                    <th>Tag</th>
                    <th>Room</th>
                    <th>Teammate</th>
                    <th>Link</th>
                    <th>Side Chat</th>
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
              The Link is the plumbing. The Tag is the first surface. Room
              and Side Chat are features of it. Teammate comes later.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">04 · Prototype</p>
            <h2 className="gb-h2 gb-display">Where the work lives</h2>
            <p>Same ask — draft a slide deck. Two places it can go:</p>
          </Reveal>

          <TagMock />


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
            <p>Build order: Link → Tag → Room + Side Chat → Teammate.</p>
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
