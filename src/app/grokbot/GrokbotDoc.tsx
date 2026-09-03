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

          <div className={`gb-msg ${on(1)}`}>
            <div className="gb-av k">KC</div>
            <div>
              <div className="gb-who">
                Kira <span>2:04 PM</span>
              </div>
              <div className="gb-txt">
                ok the Sunset place is back on the market, $2.9k
              </div>
            </div>
          </div>

          <div className={`gb-msg ${on(2)}`}>
            <div className="gb-av s">SD</div>
            <div>
              <div className="gb-who">
                Sam <span>2:05 PM</span>
              </div>
              <div className="gb-txt">
                that&rsquo;s the one with no parking right? can we get a comp
                check
              </div>
            </div>
          </div>

          <div className={`gb-msg ${on(3)}`}>
            <div className="gb-av k">KC</div>
            <div>
              <div className="gb-who">
                Kira <span>2:05 PM</span>
              </div>
              <div className="gb-txt">
                <strong>@grok</strong> pull comps for 2BRs near Sunset under
                $3k, last 60 days
              </div>
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
                  Found 14 comps. Median $2,780 — the Sunset listing is ~4%
                  over, mostly explained by the in-unit laundry. Full table in
                  thread.
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

          <div className={`gb-msg ${on(9)}`}>
            <div className="gb-av s">SD</div>
            <div>
              <div className="gb-who">
                Sam <span>2:11 PM</span>
              </div>
              <div className="gb-txt">
                4% over feels fine honestly. laundry is worth it
              </div>
            </div>
          </div>
        </div>

        <div className="gb-pane">
          <p className="gb-pane-label gb-mono">Thread · comp check</p>

          <div className={`gb-msg ${on(5)}`}>
            <div className="gb-av bot">G</div>
            <div>
              <div className="gb-who">
                grok <span>2:06 PM</span>
              </div>
              <div className="gb-txt">
                Pulling listings from the last 60 days — I&rsquo;ll screen-share
                while I filter.
              </div>
            </div>
          </div>

          <div className={`gb-screenpane gb-mono ${on(6)}`}>
            ▣ grok&rsquo;s screen — live
          </div>

          <div className={`gb-msg ${on(7)}`}>
            <div className="gb-av s">SD</div>
            <div>
              <div className="gb-who">
                Sam <span>2:08 PM</span>
              </div>
              <div className="gb-txt">
                exclude anything below the park, we ruled that area out
              </div>
            </div>
          </div>

          <div className={`gb-msg ${on(8)}`}>
            <div className="gb-av bot">G</div>
            <div>
              <div className="gb-who">
                grok <span>2:09 PM</span>
              </div>
              <div className="gb-txt">
                Done — that drops 3 comps, median moves to $2,780. Posting the
                summary back to the channel.
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="gb-caption gb-mono">
        Left: the channel stays human-paced; the block is the bot&rsquo;s entire
        footprint. Right: the thread is the session — full back-and-forth, the
        bot&rsquo;s live screen, and any human present can step in and steer.
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
                    humans and bots are the same kind of addressee — an email
                    is just an addressee who gets a link
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
                  <p className="gb-sysline gb-mono">
                    {people.join(", ")} invited by email — they open a link,
                    no install
                  </p>
                  <div className="gb-msg on gb-step">
                    <div className="gb-av bot">NB</div>
                    <div>
                      <div className="gb-who">
                        New Bot <span>now</span>
                      </div>
                      <div className="gb-txt">
                        Hey everyone. I&rsquo;m here when you tag me —
                        otherwise this room is yours.
                      </div>
                    </div>
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
  tagline: string;
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
          <p className="gb-tagline">{tagline}</p>
          {children}
        </div>
      </div>
    </Reveal>
  );
}

export default function GrokbotDoc() {
  const reduced = useReducedMotion();
  return (
    <main className="gb">
      <div className="gb-col">
        <header className="gb-masthead">
          <Blob />
          <motion.p
            className="gb-eyebrow gb-mono"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Ideation · grok
          </motion.p>
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
            What happens when grok leaves the desktop, gets a URL, and a second
            human walks into the room.
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
            <p className="gb-kicker gb-mono">Where this starts</p>
            <h2 className="gb-h2 gb-display">
              Grok today is a private conversation
            </h2>
            <p>
              The desktop app is built around a simple shape: a sidebar of
              bots, and each bot is a DM. A bot has its own screen you can
              watch, Routines that run it on a schedule, and plugins that give
              it hands. Everything about it assumes{" "}
              <strong>one human, one machine</strong> — the bot&rsquo;s screen
              is a window on your Mac, its credentials are your credentials,
              and nobody else can see any of it.
            </p>
            <p>
              Moving to the web changes two things, and only one of them is
              technical. The technical one: the bot&rsquo;s screen and runtime
              have to live on a server instead of your laptop. The interesting
              one:{" "}
              <strong>
                a web page has a URL, and a URL can be opened by someone who
                isn&rsquo;t you.
              </strong>{" "}
              The moment that&rsquo;s true, &ldquo;chat app with bots&rdquo;
              stops being the right frame, and we have to decide what a bot{" "}
              <em>is</em> when there&rsquo;s more than one human present.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="gb-pullline gb-display">
              The core design question: when a second human enters, what is the
              bot&rsquo;s relationship to the room?
            </p>
          </Reveal>
          <Reveal>
            <p>
              This doc explores four answers, borrowing shamelessly from how
              Claude shows up in multiplayer surfaces (the Slack tag, shared
              sessions, artifacts with links). The first model — the Tag — is
              the one I want to push on hardest, so it gets a deep dive after
              the survey.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">The survey</p>
            <h2 className="gb-h2 gb-display">
              Four shapes for a bot among humans
            </h2>
          </Reveal>

          <Model
            letter="MODEL A"
            title="The Tag — a block in the channel"
            tagline="The channel belongs to the humans. The bot enters as an object in the conversation."
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
              This is the Claude-tag format. People talk in a shared channel
              like they normally would. When someone wants grok, they drop a{" "}
              <strong>bot block</strong> into the flow — via{" "}
              <span className="gb-chip-inline gb-mono">@grok</span>, a slash
              command, or a &ldquo;+&rdquo; attach — with a prompt on it. The
              block sits inline like a message-sized appliance: it shows the
              ask, a status chip, and the result summary. Anyone in the channel
              can poke it. Anything deeper than one exchange{" "}
              <strong>forks into a thread</strong> anchored to the block, and
              the thread is where the real session lives — the back-and-forth,
              the bot&rsquo;s screen, the messy middle. The channel only ever
              sees the block&rsquo;s tidy surface.
            </p>
            <p>
              Why it&rsquo;s attractive: it keeps human conversation primary,
              gives the bot a bounded footprint, and reuses a social pattern
              (threads) everyone already understands as &ldquo;go deeper
              without spamming the room.&rdquo;
            </p>
          </Model>

          <Model
            letter="MODEL B"
            title="The Room — invite humans into the bot's space"
            tagline="The bot's DM becomes a room, and you add people to it."
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
              The straightest port of the desktop app. Each bot already has a
              space: the chat plus its screen pane plus its Routines. Make that
              space joinable — &ldquo;add Sam to Job App bot&rdquo; — and
              everyone in it sees the same conversation and the same screen,
              live. It&rsquo;s bot-first: the humans are guests in the
              bot&rsquo;s room rather than the other way around.
            </p>
            <p>
              This is great for the <em>pair-watching</em> case (&ldquo;come
              look at what it&rsquo;s doing to my resume&rdquo;) and terrible
              as the default social space — nobody wants their team channel to
              live inside a bot. It&rsquo;s a mode, not a home.
            </p>
          </Model>

          <Model
            letter="MODEL C"
            title="The Teammate — the bot is a member"
            tagline="Full citizenship: the bot has a face in the roster and can speak anywhere."
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
              The Slack-bot lineage. Grok gets an identity in the workspace: it
              appears in the member list, you can DM it, add it to channels,
              and it can post <em>unprompted</em> — a Routine fires and drops
              its morning digest into{" "}
              <span className="gb-chip-inline gb-mono">#standup</span> like a
              colleague would. Mention it anywhere and it answers in place.
            </p>
            <p>
              Maximum power, maximum noise risk. Every open question in this
              doc (whose credentials? who can steer it? when may it speak?)
              gets harder when the bot can act anywhere. Probably the end
              state, not the starting point — and notably, the Tag is a strict
              subset of it, which suggests a sequencing.
            </p>
          </Model>

          <Model
            letter="MODEL D"
            title="The Link — sessions you can hand to someone"
            tagline="Stay single-player; make everything shareable by URL."
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
              The most conservative move: keep grok&rsquo;s
              one-human-one-bot shape, but since we&rsquo;re on the web now,
              every session, every artifact the bot produces, and every
              bot&rsquo;s live screen gets a link. Multiplayer happens by{" "}
              <em>handoff</em> — &ldquo;here&rsquo;s my thread with the bot,
              take a look&rdquo; — with view or take-over permissions, rather
              than by shared presence.
            </p>
            <p>
              Underwhelming as a headline, but it&rsquo;s the plumbing every
              other model needs anyway: an addressable session is exactly what
              a thread (A), a room (B), or a teammate&rsquo;s working memory
              (C) is made of.
            </p>
          </Model>
        </section>
      </div>

      <div className="gb-wide">
        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">Side by side</p>
            <h2 className="gb-h2 gb-display">
              Same bot, four social contracts
            </h2>
            <p>
              The axes that actually differentiate them — not features, but
              who&rsquo;s in charge of what:
            </p>
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
                  </tr>
                  <tr>
                    <td className="axis">Unit of bot work</td>
                    <td>A thread (= one session)</td>
                    <td>The room&rsquo;s one long session</td>
                    <td>Ambient; many overlapping asks</td>
                    <td>A session</td>
                  </tr>
                  <tr>
                    <td className="axis">What the bot can read</td>
                    <td>
                      Its thread + the block&rsquo;s prompt; channel history
                      only if invited
                    </td>
                    <td>Everything in the room</td>
                    <td>
                      <span className="gb-risk">Potentially everything</span>
                    </td>
                    <td>Owner&rsquo;s session only</td>
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
                  </tr>
                  <tr>
                    <td className="axis">Routines become</td>
                    <td>Scheduled blocks posted to a channel</td>
                    <td>Events inside the room</td>
                    <td>Unprompted posts as a member</td>
                    <td>Same as desktop, plus a link</td>
                  </tr>
                  <tr>
                    <td className="axis">Build cost on top of D</td>
                    <td>Channels + block UI + threads</td>
                    <td>Presence + shared screen only</td>
                    <td>Identity, ACLs, speak-rules</td>
                    <td>
                      <span className="gb-win">Baseline</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="gb-caption gb-mono">
              Reading of the table: D is the substrate, A is the best first
              multiplayer surface, B is a feature of A (&ldquo;watch this
              thread&rsquo;s screen together&rdquo;), C is where it all
              matures.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">Deep dive · Model A</p>
            <h2 className="gb-h2 gb-display">Anatomy of the Tag</h2>
            <p>
              Here&rsquo;s the moment that has to feel right: two humans
              mid-conversation, one of them summons grok, and the work forks
              into a thread without breaking the channel&rsquo;s rhythm.
            </p>
          </Reveal>

          <TagMock />

          <div className="gb-col" style={{ marginLeft: 0 }}>
            <Reveal>
              <h3 className="gb-h3 gb-display">The rules that make it work</h3>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="gb-rules">
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">01</span>
                  <div>
                    <b>The block is the summary; the thread is the work.</b>
                    <p>
                      The bot never posts more than one block per ask into the
                      channel, and it edits that block in place as status
                      changes (queued → working → delivered). All of its actual
                      output volume lives in the thread. This single rule is
                      what keeps Model A from becoming Model C&rsquo;s noise
                      problem.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">02</span>
                  <div>
                    <b>A thread is a session.</b>
                    <p>
                      Opening the thread is opening the bot&rsquo;s session:
                      its context, its screen, its scratch artifacts. This maps
                      one-to-one onto the desktop app&rsquo;s mental model (a
                      chat with a bot that has a screen) and onto Model
                      D&rsquo;s plumbing (an addressable session). The thread
                      is literally a shared, embedded grok DM.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">03</span>
                  <div>
                    <b>Anyone present may steer; the summoner owns it.</b>
                    <p>
                      Any channel member can reply in the thread and the bot
                      treats it as direction — that&rsquo;s the point of
                      multiplayer. But the block belongs to whoever summoned
                      it: their credentials, their plugins, their kill switch.
                      If Sam&rsquo;s steering needs Sam&rsquo;s reach (his
                      calendar, his email), the bot asks Sam to connect,
                      in-thread, rather than borrowing Kira&rsquo;s.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">04</span>
                  <div>
                    <b>The bot reads the thread, not the room.</b>
                    <p>
                      Default context is the prompt on the block plus the
                      thread below it. Pulling in channel history is an
                      explicit act — &ldquo;use the last 50 messages&rdquo; —
                      visible to everyone as a chip on the block. People say
                      things in channels they didn&rsquo;t say to a bot; the
                      boundary should be legible, not inferred.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">05</span>
                  <div>
                    <b>Conflicting steering is surfaced, not averaged.</b>
                    <p>
                      Two humans, one bot, opposite instructions
                      (&ldquo;include the park area&rdquo; / &ldquo;exclude
                      it&rdquo;) — the bot names the conflict in the thread and
                      asks, instead of silently obeying the latest message. A
                      bot that just does whatever was said last becomes a proxy
                      war.
                    </p>
                  </div>
                </div>
                <div className="gb-rule">
                  <span className="gb-rule-num gb-mono">06</span>
                  <div>
                    <b>Routines post blocks.</b>
                    <p>
                      A scheduled Routine is just a block that summons itself:
                      &ldquo;every weekday 9am, post the new-listings digest to
                      #apartment-hunt.&rdquo; Same anatomy, same thread
                      affordance, same one-block footprint — recurring work
                      inherits the whole model for free.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="gb-col" style={{ marginLeft: 0 }}>
            <Reveal>
              <h3 className="gb-h3 gb-display">
                How the second human gets in
              </h3>
              <p>
                The desktop composer already treats the To: field as
                &ldquo;search or create Bots.&rdquo; The web version extends
                the same field one step:{" "}
                <strong>
                  a person&rsquo;s email is just another kind of addressee.
                </strong>{" "}
                Hit +, choose &ldquo;Create group chat,&rdquo; and the To:
                field takes bots and emails side by side — the invited human
                gets a link and lands in the room in their browser, no
                install. This one is a working sketch — click through it:
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <ComposerMock />
            <p className="gb-caption gb-mono">
              The invite is Model D&rsquo;s link plumbing wearing Model
              A&rsquo;s clothes: a room is created, the email carries its URL,
              and presence starts when the link is opened.
            </p>
          </Reveal>
        </section>
      </div>

      <div className="gb-col">
        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">Regardless of model</p>
            <h2 className="gb-h2 gb-display">The hard problems</h2>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">
                Multi-principal: who is the bot working for?
              </h3>
              <p>
                Desktop grok has one principal. In a channel it has several,
                with different intents, different permissions, and occasionally
                different interests. This is the deepest change and it leaks
                into everything below.
              </p>
              <p className="gb-stance">
                <b>Stance:</b> per-task principal (the summoner), with everyone
                else as advisors the bot listens to but doesn&rsquo;t obey
                against the summoner. Ambiguity gets asked about, out loud, in
                the thread.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Credentials and reach</h3>
              <p>
                On desktop, the bot&rsquo;s plugins are your logins. On the
                web, &ldquo;grok, check the shared calendar&rdquo; might need
                Kira&rsquo;s Google auth, Sam&rsquo;s, or a workspace-level
                connection — and the difference is invisible unless we design
                it to be visible.
              </p>
              <p className="gb-stance">
                <b>Stance:</b> credentials never pool. Each connection belongs
                to a person, the block shows whose reach it&rsquo;s using, and
                the bot requests connections from the specific person whose
                data it needs.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Memory boundaries</h3>
              <p>
                Should the bot remember across threads? Across channels? What
                Kira told it privately must not surface in a channel with Sam.
                Multiplayer turns memory from a convenience feature into a
                confidentiality feature.
              </p>
              <p className="gb-stance">
                <b>Stance:</b> memory is scoped to the container it was learned
                in (DM memory stays in DMs; channel memory stays in that
                channel), with promotion to shared memory as an explicit,
                logged act.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Concurrency on one session</h3>
              <p>
                Two humans typing into one thread while the bot is mid-run: do
                messages queue, interrupt, or branch? Desktop never had to
                answer this.
              </p>
              <p className="gb-stance">
                <b>Stance:</b> steal Google-Docs intuition, not git intuition —
                one live run, new messages queue visibly against it, and anyone
                can hit the (equally visible) interrupt.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="gb-prob">
              <h3 className="gb-h3 gb-display">Cost attribution</h3>
              <p>
                Bot runtime costs real money. When Sam steers a bot Kira
                summoned on a workspace Sam pays for, whose meter runs?
              </p>
              <p className="gb-stance">
                <b>Stance:</b> bill the container (the channel&rsquo;s
                workspace), not the individual — matching how the social model
                already assigns ownership — but show per-block cost so heavy
                use is legible.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">Getting there</p>
            <h2 className="gb-h2 gb-display">
              From desktop concepts to web primitives
            </h2>
            <p>
              Everything the desktop app already has maps cleanly, which is a
              good sign the model is right:
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="gb-map">
              <div className="gb-maprow">
                <span className="from">A bot&rsquo;s DM</span>
                <span className="arrow">→</span>
                <span className="to">
                  A hosted session with a URL (Model D — the foundation
                  everything sits on)
                </span>
              </div>
              <div className="gb-maprow">
                <span className="from">The bot&rsquo;s screen</span>
                <span className="arrow">→</span>
                <span className="to">
                  A streamed pane from the bot&rsquo;s server-side VM,
                  embeddable in a thread or room
                </span>
              </div>
              <div className="gb-maprow">
                <span className="from">Routines</span>
                <span className="arrow">→</span>
                <span className="to">
                  Server-side schedules that post blocks into a chosen channel
                </span>
              </div>
              <div className="gb-maprow">
                <span className="from">Plugins</span>
                <span className="arrow">→</span>
                <span className="to">
                  Per-person OAuth connections, requested in-thread when the
                  bot needs someone&rsquo;s reach
                </span>
              </div>
              <div className="gb-maprow">
                <span className="from">The sidebar of bots</span>
                <span className="arrow">→</span>
                <span className="to">
                  A sidebar of channels and DMs, where bots appear as blocks
                  rather than rooms
                </span>
              </div>
            </div>
            <p>
              <strong>Proposed sequence:</strong> build D&rsquo;s plumbing
              (hosted sessions, links, view/take-over permissions) → ship A as
              the first genuinely multiplayer surface (channels, the block,
              threads-as-sessions) → fold in B as a feature of A (co-watching a
              thread&rsquo;s screen) → grow toward C only once the speak-rules
              and identity questions have real answers.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">Unresolved</p>
            <h2 className="gb-h2 gb-display">Open questions to ideate on next</h2>
            <ul className="gb-openq">
              <li>
                <strong>Is the block a message or an app?</strong> A
                message-shaped block is calm but caps interactivity; an
                app-shaped block (inputs, tabs, live charts) is powerful but
                starts competing with the channel. Where&rsquo;s the line — and
                does it move per bot?
              </li>
              <li>
                <strong>Can a thread outlive its channel moment?</strong>{" "}
                Long-running work (a week-long apartment search) wants to be
                pinned, revisited, maybe promoted to its own space — which
                quietly turns a Tag into a Room. Is that a feature or a leak?
              </li>
              <li>
                <strong>Multiple bots in one channel:</strong> can Job App and
                grok both hold blocks in the same conversation? Can one
                bot&rsquo;s block cite another&rsquo;s thread?
              </li>
              <li>
                <strong>Guest humans:</strong> what does the Tag look like for
                someone link-invited into a single thread who isn&rsquo;t a
                member of the channel — the multiplayer equivalent of D&rsquo;s
                handoff?
              </li>
              <li>
                <strong>The empty-workspace problem:</strong> the desktop app
                starts useful with one human and one bot. A channel-first web
                app starts empty until a second human shows up. What&rsquo;s
                the single-player day-one experience that doesn&rsquo;t feel
                like a worse desktop app?
              </li>
            </ul>
          </Reveal>
        </section>

        <footer className="gb-footer gb-mono">
          <span>grok multiplayer · ideation draft v1</span>
          <span>Next: sketch the block&rsquo;s states as real frames</span>
        </footer>
      </div>
    </main>
  );
}
