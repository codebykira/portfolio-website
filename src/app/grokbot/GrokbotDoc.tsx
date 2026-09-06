"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
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

// One participant row. Humans and the bot render identically: picture on the
// left, name above the bubble. The bot is just another face in the room.
// The bot's name in the room. Short and a little cute; it is a housemate,
// not a service.
const BOT = "Nestie";

const PEOPLE = {
  kira: { name: "Kira", initials: "KC", cls: "k" },
  sam: { name: "Sam", initials: "SD", cls: "s" },
  eli: { name: "Eli", initials: "EW", cls: "e" },
} as const;

function Msg({
  who,
  wide,
  step,
  foot,
  name,
  cont,
  more,
  raw,
  innerRef,
  children,
}: {
  who: "kira" | "sam" | "eli" | "bot";
  wide?: boolean;
  step?: string;
  foot?: React.ReactNode;
  /** the bot's display name when it is not Nestie */
  name?: string;
  /** continues a run from the same sender: no name, tight top corner */
  cont?: boolean;
  /** another message from the same sender follows: no picture, tight bottom corner */
  more?: boolean;
  /** render children as-is (a card) instead of inside a bubble */
  raw?: boolean;
  /** a handle on the bubble (or card), so a note can point at it */
  innerRef?: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const cls = `${step ? ` ${step}` : ""}${cont ? " cont" : ""}${more ? " more" : ""}`;
  // Kira is the reader: her messages sit on the right with no picture or
  // name, the way the app draws "me".
  if (who === "kira") {
    return (
      <div className={`gb-row me${cls}`}>
        <div className="gb-bubble" ref={innerRef}>
          {children}
        </div>
      </div>
    );
  }
  const person = who === "bot" ? null : PEOPLE[who];
  const row = (
    <div className={`gb-row${cls}`}>
      {more ? (
        <span className="gb-pav spacer" aria-hidden="true" />
      ) : person ? (
        <span className={`gb-pav ${person.cls}`} aria-hidden="true">
          {person.initials}
        </span>
      ) : (
        <BlobAv color="j" sm />
      )}
      <div className="gb-row-body">
        {!cont && (
          <div className="gb-name">{person ? person.name : (name ?? BOT)}</div>
        )}
        {raw ? (
          <div className="gb-raw" ref={innerRef}>
            {children}
          </div>
        ) : (
          <div className={`gb-bubble${wide ? " wide" : ""}`} ref={innerRef}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
  // the thread link sits under the bubble, outside the row, so the picture
  // still lines up with the bubble's bottom edge
  return foot ? (
    <>
      {row}
      <div className={`gb-msg-foot${step ? ` ${step}` : ""}`}>{foot}</div>
    </>
  ) : (
    row
  );
}

// When the bot needs something from you it asks with the app's question card:

// A handwritten note that points at a real element. It measures the target
// inside the mock (and undoes the FitBox scale) so the arrow lands on the
// same thing at every screen size. `side` is where the note sits relative
// to the target; the arrow points back at it.
type NoteSide = "left" | "right" | "above" | "below";

function AnchorNote({
  target,
  side,
  dx = 0,
  dy = 0,
  width = 170,
  show = true,
  align = "center",
  children,
}: {
  target: RefObject<HTMLElement | null>;
  side: NoteSide;
  /** for above/below: which part of the target's edge to point at */
  align?: "start" | "center" | "end";
  /** nudge the note, in unscaled px */
  dx?: number;
  dy?: number;
  width?: number;
  show?: boolean;
  children: React.ReactNode;
}) {
  const self = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const t = target.current;
      const wrap = self.current?.parentElement;
      if (!t || !wrap) return;
      const tr = t.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      if (!tr.width || !tr.height || !wr.width) {
        setPos(null);
        return;
      }
      // the mock may be scaled down by FitBox; measure in its own units
      const k = wr.width / wrap.offsetWidth || 1;
      const l = (tr.left - wr.left) / k;
      const tp = (tr.top - wr.top) / k;
      const w = tr.width / k;
      const h = tr.height / k;
      const gap = 6;
      let x = l + w * (align === "start" ? 0 : align === "end" ? 1 : 0.5);
      let y = tp + h / 2;
      if (side === "left") x = l - gap;
      if (side === "right") x = l + w + gap;
      if (side === "above") y = tp - gap;
      if (side === "below") y = tp + h + gap;
      x = Math.round(x + dx);
      y = Math.round(y + dy);
      setPos((p) => (p && p.x === x && p.y === y ? p : { x, y }));
    };
    measure();
    // targets move as messages animate in and feeds scroll: keep looking
    const id = window.setInterval(measure, 120);
    window.addEventListener("resize", measure);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [target, side, dx, dy, align]);
  const arrow =
    side === "left" ? (
      // note on the left, arrow points right
      <svg className="gb-note-arrow to-right" viewBox="0 0 120 60" fill="none">
        <path
          d="M6 40 C 30 22, 60 44, 108 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M90 12 L 110 23 L 92 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : side === "right" ? (
      <svg className="gb-note-arrow to-left" viewBox="0 0 120 60" fill="none">
        <path
          d="M114 40 C 90 22, 60 44, 12 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M30 12 L 10 23 L 28 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : side === "above" ? (
      <svg className="gb-note-arrow to-down" viewBox="0 0 60 80" fill="none">
        <path
          d="M22 4 C 40 24, 18 46, 30 74"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 60 L 30 76 L 42 58"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg className="gb-note-arrow to-up" viewBox="0 0 60 80" fill="none">
        <path
          d="M22 76 C 40 56, 18 34, 30 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 20 L 30 4 L 42 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <div
      ref={self}
      className={`gb-note anchor ${side}${show && pos ? "" : " hide"}`}
      aria-hidden="true"
      style={
        pos ? { left: pos.x, top: pos.y, width } : { left: 0, top: 0, width }
      }
    >
      {side === "right" || side === "below" ? arrow : null}
      <p>{children}</p>
      {side === "left" || side === "above" ? arrow : null}
    </div>
  );
}

// The app's composer: one pill, + on the left, mic on the right, drag handle
// underneath.
function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div className="gb-composer-wrap">
      <div className="gb-composer">
        <span className="gb-composer-plus" aria-hidden="true">
          +
        </span>
        <span className="gb-composer-ph">{placeholder}</span>
        <span className="gb-composer-mic" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12">
            <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" fill="#000" />
            <path
              d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5M6 14.5h4"
              fill="none"
              stroke="#000"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
      <span className="gb-composer-handle" aria-hidden="true" />
    </div>
  );
}

// The app's window chrome: bot avatar + name on the left, share and screen
// icons on the right. Matches the desktop app's title bar.
function TitleBar({ name }: { name: string }) {
  return (
    <div className="gb-titlebar">
      <BlobAv color="j" sm />
      <span className="gb-titlebar-name">{name}</span>
      <span className="gb-titlebar-icons" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path
            d="M8 1.5v8M5 4.5l3-3 3 3M3 8v5.5h10V8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg viewBox="0 0 16 16" width="14" height="14">
          <rect
            x="1.5"
            y="2.5"
            width="13"
            height="9"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M5.5 14h5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </span>
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
// pick a bot, then add humans by email in the same To: field. Mirrors the desktop app's
// new-chat flow, extended so bots and people are the same kind of addressee.
type ComposerStage = "idle" | "menu" | "group";

function initials(email: string) {
  const name = email.split("@")[0] || "?";
  return name.slice(0, 2).toUpperCase();
}

function ComposerMock() {
  const plusRef = useRef<HTMLButtonElement>(null);
  const nestieRef = useRef<HTMLButtonElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
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

  const note =
    stage === "idle"
      ? "click the + to start a chat"
      : stage === "menu"
        ? "pick nestie, like you would any bot"
        : people.length === 0
          ? "now type an email. that is the whole invite."
          : "the email becomes a link. sam signs up, then lands in the room.";
  return (
    <div className="gb-mockwrap tag">
      <div className="gb-cw">
        {stage !== "idle" && (
          <button type="button" className="gb-replay gb-mono" onClick={reset}>
            ↻ RESET
          </button>
        )}
        <div className="gb-cw-body">
          <div className="gb-cw-side">
            <div className="gb-cw-sidetop">
              <span className="gb-dot r" />
              <span className="gb-dot y" />
              <span className="gb-dot g" />
              <button
                type="button"
                className={`gb-plusbtn${stage === "idle" ? " gb-hint" : ""}`}
                ref={plusRef}
                aria-label="New chat"
                onClick={() => stage === "idle" && setStage("menu")}
              >
                +
              </button>
            </div>
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
                  Nestie <span>2:18 PM</span>
                </div>
                <div className="sub">14 comps. Median $3,720, so Bed…</div>
              </div>
            </div>
            <div className="gb-cw-row">
              <BlobAv color="g" />
              <div>
                <div className="gb-who">
                  Financial Analyst <span>Yesterday</span>
                </div>
                <div className="sub">Q3 burn is 11% under plan. Runw…</div>
              </div>
            </div>
            <div className="gb-cw-row">
              <BlobAv color="g" />
              <div>
                <div className="gb-who">
                  Designer <span>Thursday</span>
                </div>
                <div className="sub">Exported the hero at 2x. Want t…</div>
              </div>
            </div>
          </div>

          <div className="gb-cw-main">
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
                    ref={nestieRef}
                    onClick={() => setStage("group")}
                  >
                    <span className="icon">
                      <BlobAv color="j" sm />
                    </span>
                    Nestie
                    <span className="gb-kbd">
                      <i>⌘</i>
                      <i>2</i>
                    </span>
                  </button>
                  <button type="button" className="gb-menurow">
                    <span className="icon">
                      <BlobAv color="g" sm />
                    </span>
                    Financial Analyst
                    <span className="gb-kbd">
                      <i>⌘</i>
                      <i>3</i>
                    </span>
                  </button>
                  <button type="button" className="gb-menurow">
                    <span className="icon">
                      <BlobAv color="g" sm />
                    </span>
                    Designer
                    <span className="gb-kbd">
                      <i>⌘</i>
                      <i>4</i>
                    </span>
                  </button>
                </div>
              </>
            )}

            {stage === "group" && (
              <>
                <div className="gb-to">
                  <span className="gb-to-label">To:</span>
                  <span className="gb-tochip">
                    <BlobAv color="j" sm />
                    Nestie
                  </span>
                  {people.map((email) => (
                    <span className="gb-tochip human" key={email}>
                      <span className="gb-av s">{initials(email)}</span>
                      {email}
                      {
                        <button
                          type="button"
                          aria-label={`Remove ${email}`}
                          onClick={() =>
                            setPeople((p) => p.filter((e) => e !== email))
                          }
                        >
                          ×
                        </button>
                      }
                    </span>
                  ))}
                  {
                    <input
                      ref={inputRef}
                      className="gb-toinput"
                      placeholder="Add someone by email"
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
                  }
                </div>

                {draft.trim().length > 0 ? (
                  <button
                    type="button"
                    className="gb-suggest"
                    onClick={() => addPerson(draft)}
                  >
                    <span className="gb-av s">{initials(draft)}</span>
                    <span>
                      Add <b>{draft.trim()}</b>
                      <small>
                        {draft.includes("@")
                          ? "we\u2019ll email them a link to this chat"
                          : "finish their email. we\u2019ll send them a link to this chat"}
                      </small>
                    </span>
                  </button>
                ) : null}

                <div className="gb-cw-feed">
                  <Msg who="bot">Hey. Who are we hunting with?</Msg>
                  {people.map((email, n) => (
                    <div
                      className="gb-invite-line"
                      key={email}
                      ref={n === 0 ? sentRef : undefined}
                    >
                      <span>
                        Invite sent. <b>{email}</b> got a link. They sign up,
                        then land here.
                      </span>
                    </div>
                  ))}
                </div>
                <Composer placeholder={`Message ${BOT}`} />
              </>
            )}
          </div>
        </div>
      </div>
      {stage === "idle" && (
        <AnchorNote target={plusRef} side="right" dx={6} dy={-2} width={150}>
          {note}
        </AnchorNote>
      )}
      {stage === "menu" && (
        <AnchorNote target={nestieRef} side="right" dx={8} width={190}>
          {note}
        </AnchorNote>
      )}
      {stage === "group" && people.length === 0 && (
        <AnchorNote
          target={inputRef}
          side="below"
          align="start"
          dx={70}
          dy={6}
          width={200}
        >
          {note}
        </AnchorNote>
      )}
      {stage === "group" && people.length > 0 && (
        <AnchorNote
          target={sentRef}
          side="above"
          align="end"
          dx={-90}
          dy={-2}
          width={200}
        >
          {note}
        </AnchorNote>
      )}
    </div>
  );
}

// Mini prototypes, one per model, in the app's own chat language.

// A: the bot's own DM, opened up. Kira's Nestie chat gets a link, Sam walks

// A: every participant, human or bot, shows up the same way: picture, name,
// bubble. The thread opens as a second pane on the right (open by default so

// B: the bot takes the computer and everyone in the chat watches the same
// screen, live. One toggle shows the same task living in a thread vs. in the

const SHIP = "Shipper";

type Frame = {
  url: string;
  title: string;
  modal?: { kind: "ok" | "warn"; text: string };
};

function LiveScreen({ frame, live }: { frame: Frame; live: boolean }) {
  return (
    <div className="gb-live">
      <div className="gb-live-chrome">
        <i />
        <i />
        <i />
        <span className="gb-live-url">{frame.url}</span>
      </div>
      <div className="gb-live-page">
        <div className="gb-live-side">
          <b />
          <b />
          <b />
        </div>
        <div className="gb-live-body">
          <span className="gb-live-h">{frame.title}</span>
          <i />
          <i />
          <i />
          {frame.modal?.kind === "ok" && (
            <div className="gb-live-modal ok" key={frame.title}>
              <span className="gb-live-check">✓</span>
              {frame.modal.text}
            </div>
          )}
          {frame.modal?.kind === "warn" && (
            <div className="gb-live-modal warn" key={frame.title}>
              {frame.modal.text}
              <span className="gb-live-field" />
            </div>
          )}
        </div>
      </div>
      <span className={`gb-live-badge${live ? " on" : ""}`}>
        <i />
        {live ? "LIVE" : "ENDED"}
      </span>
    </div>
  );
}

function ComputerCard({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="gb-block gb-computer">
      <div className="gb-block-head">
        <div className="gb-block-name">Computer</div>
        <span className={`gb-status${done ? " done" : " live"}`}>
          <i />
          {done ? "Done" : "Live"}
        </span>
      </div>
      <div className="gb-block-body">{children}</div>
    </div>
  );
}

// Storyboard frame 1: the conversation. Tag: Kira has to @ it. Teammate: it
// reads the room and speaks when it has something.
function ConvoMock({ variant }: { variant: "tag" | "team" }) {
  const askRef = useRef<HTMLDivElement>(null);
  const heardRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  // plays on mount: a toggle remounts it, and the reader just clicked, so
  // waiting for a scroll signal here reads as "broken"
  useEffect(() => {
    if (reduced) {
      setStep(6);
      return;
    }
    const ts = [200, 900, 1700, 2600, 3600, 4600].map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms),
    );
    return () => ts.forEach(clearTimeout);
  }, [reduced]);
  // keep the newest message in view, like a real chat
  const feed = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = feed.current;
    if (!el) return;
    // instant, so it also lands when the tab is in the background
    el.scrollTop = el.scrollHeight;
  }, [step]);
  const on = (i: number) => `gb-step${step >= i ? " on" : ""}`;
  const comps = (
    <>
      <b>Closest 4</b>, all within 6 blocks:
      <ol className="gb-list">
        <li>
          <b>Bedford Ave</b>, 2BR: $3,900, in-unit laundry
        </li>
        <li>
          <b>N 7th St</b>, 2BR: $3,850, in-unit laundry
        </li>
        <li>
          <b>Grand St</b>, 2BR: $3,650, shared laundry
        </li>
        <li>
          <b>Metropolitan Ave</b>, 2BR: $3,550, no laundry, by the BQE
        </li>
      </ol>
      <b>Net:</b> the washer is the whole premium.
    </>
  );
  return (
    <div className="gb-mockwrap tag" ref={ref}>
      <div className="gb-mock single">
        <div className="gb-pane gb-window">
          <div className="gb-main">
            <TitleBar name={BOT} />
            <div className="gb-feed" ref={feed}>
              <div className={`gb-sys ${on(1)}`}>Today 1:52 PM</div>
              <Msg who="sam" step={on(1)}>
                apartment hunting in new york is so difficult
              </Msg>
              <Msg who="kira" step={on(2)}>
                everything decent is gone by noon. the Bedford one is back
                though, $3.9k
              </Msg>
              <Msg who="sam" step={on(3)}>
                feels steep. can we get comps
              </Msg>
              {variant === "tag" ? (
                <>
                  <Msg who="kira" step={on(4)} innerRef={askRef}>
                    <strong>@{BOT}</strong> comps for 2BRs near Bedford under
                    $4k
                  </Msg>
                  <Msg who="bot" step={on(5)} more={step >= 6}>
                    14 comps. Median <b>$3,720</b>, so Bedford is 5% over. Blame
                    the washer.
                  </Msg>
                  <Msg who="bot" step={on(6)} cont>
                    {comps}
                  </Msg>
                </>
              ) : (
                <>
                  <Msg
                    who="bot"
                    step={on(4)}
                    more={step >= 5}
                    innerRef={heardRef}
                  >
                    Already pulled them when Sam said Bedford. 14 comps, median{" "}
                    <b>$3,720</b>, so it is 5% over. Blame the washer.
                  </Msg>
                  <Msg who="bot" step={on(5)} cont>
                    {comps}
                  </Msg>
                  <Msg who="sam" step={on(6)}>
                    ok that is a little creepy and very useful
                  </Msg>
                </>
              )}
            </div>
            <Composer placeholder={`Message ${BOT}`} />
          </div>
        </div>
      </div>
      {variant === "tag" ? (
        <AnchorNote
          target={askRef}
          side="left"
          dx={-4}
          show={step >= 4}
          width={250}
        >
          sam asked the room, not the bot. nothing happens until kira @s it.
        </AnchorNote>
      ) : (
        <AnchorNote
          target={heardRef}
          side="above"
          align="end"
          dx={-120}
          dy={-4}
          show={step >= 4}
          width={230}
        >
          no @ anywhere. it heard sam say bedford and answered, like anyone else
          in the room would.
        </AnchorNote>
      )}
    </div>
  );
}

// Storyboard frame 2: the bot takes the computer. Same shape as the desktop
// app: the Computer card sits in the chat, the bot's screen and routines sit
// in the right panel. Nothing forks anywhere.
const WORK_DELAYS = [0, 900, 1900, 3100, 4600, 5800];

function WorkMock({ view }: { view: WorkView }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) {
      setStep(WORK_DELAYS.length);
      return;
    }
    const ts = WORK_DELAYS.map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, [reduced]);
  // keep the newest message in view, like a real chat
  const feed = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = feed.current;
    if (!el) return;
    // instant, so it also lands when the tab is in the background
    el.scrollTop = el.scrollHeight;
  }, [step]);
  const on = (i: number) => `gb-step${step >= i ? " on" : ""}`;
  const done = step >= 5;
  const frames: Frame[] = [
    { url: "vercel.com / atrios-site / deployments", title: "Build · main" },
    {
      url: "atrios-site-pr142.vercel.app",
      title: "Preview · pr-142",
      modal: { kind: "ok", text: "Preview ready" },
    },
    {
      url: "atrios.com",
      title: "Production",
      modal: { kind: "ok", text: "Deployed · 0 errors" },
    },
  ];
  const frame = frames[step >= 5 ? 2 : step >= 4 ? 1 : 0];
  return (
    <div className="gb-mockwrap tag">
      <div className="gb-mock single">
        <div className={`gb-pane gb-window view-${view}`}>
          <div className="gb-main">
            <div className="gb-titlebar">
              <BlobAv color="j" sm />
              <span className="gb-titlebar-name">{SHIP}</span>
              <span className="gb-titlebar-icons" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14">
                  <rect
                    x="1.5"
                    y="2.5"
                    width="13"
                    height="9"
                    rx="1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5.5 14h5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            {view === "pip" && step >= 3 && (
              <div className="gb-pip" ref={pipRef}>
                <div className="gb-pip-bar">
                  <span className="gb-pip-title">{SHIP}&rsquo;s screen</span>
                  <button type="button" aria-label="Minimize">
                    <svg viewBox="0 0 12 12" width="11" height="11">
                      <path
                        d="M2 6h8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button type="button" aria-label="Expand">
                    <svg viewBox="0 0 12 12" width="11" height="11">
                      <path
                        d="M7 2h3v3M5 10H2V7M10 2L6.5 5.5M2 10l3.5-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <LiveScreen frame={frame} live={!done} />
              </div>
            )}
            <div className="gb-feed" ref={feed}>
              <div className={`gb-sys ${on(1)}`}>Today 8:41 AM</div>
              <Msg who="eli" step={on(1)}>
                landing page has to be live before the 9am email goes out
              </Msg>
              <Msg who="kira" step={on(2)}>
                <strong>@{SHIP}</strong> deploy main to prod and swap the hero
                to the new copy
              </Msg>
              <Msg who="bot" name={SHIP} step={on(3)} raw more={step >= 4}>
                <ComputerCard done={done}>
                  {done
                    ? "Deployed main to production and swapped the hero. Screen handed back."
                    : "Deploying main to production, then swapping the hero copy."}
                  <button
                    type="button"
                    className="gb-open-computer"
                    ref={openRef}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="13"
                      height="13"
                      aria-hidden="true"
                    >
                      <rect
                        x="1.5"
                        y="2.5"
                        width="13"
                        height="9"
                        rx="1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M5.5 14h5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                    {view === "thread" ? "Open thread" : "Open computer"}
                  </button>
                </ComputerCard>
              </Msg>
              <Msg who="bot" name={SHIP} step={on(4)} cont more={step >= 6}>
                Build passed. Preview is up if anyone wants to eyeball the hero.
              </Msg>
              <Msg who="bot" name={SHIP} step={on(6)} cont>
                Live. Hero swapped, 0 errors in the first 5 minutes.
              </Msg>
            </div>
            <Composer placeholder={`Message ${SHIP}`} />
          </div>
          {view === "side" && (
            <aside className="gb-sidebar">
              <div className="gb-sidebar-icons" aria-hidden="true">
                <span>⚙</span>
                <span>»</span>
              </div>
              <div
                className={`gb-sidebar-screen${step >= 3 ? " live" : ""}`}
                ref={screenRef}
              >
                {step >= 3 ? (
                  <LiveScreen frame={frame} live={!done} />
                ) : (
                  <span className="gb-sidebar-empty" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <rect
                        x="1.5"
                        y="2.5"
                        width="13"
                        height="9"
                        rx="1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M5.5 14h5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <p className="gb-sidebar-cap">{SHIP}&rsquo;s screen</p>
              <div className="gb-sidebar-head">
                <span>Routines</span>
                <span aria-hidden="true">+</span>
              </div>
              <div className="gb-routine">
                <span className="gb-routine-dot" aria-hidden="true" />
                <div>
                  <b>Deploy on merge</b>
                  <small>main → production</small>
                </div>
              </div>
            </aside>
          )}
          {view === "thread" && (
            <div className="gb-side">
              <div className="gb-side-inner">
                <div className="gb-thread-head">
                  <span className="gb-thread-title">Thread</span>
                  <span className="gb-thread-sub">{SHIP} · deploy</span>
                </div>
                <div className={on(3)}>
                  <LiveScreen frame={frame} live={!done} />
                </div>
                <Msg who="bot" name={SHIP} step={on(4)}>
                  Preview is up. Prod next.
                </Msg>
                <Msg who="eli" step={on(5)}>
                  hero looks right on mobile
                </Msg>
                <Composer placeholder="Reply in thread" />
              </div>
            </div>
          )}
        </div>
      </div>
      {view === "side" && (
        <AnchorNote target={screenRef} side="below" dy={118} width={190}>
          {WORK_NOTES[view]}
        </AnchorNote>
      )}
      {view === "pip" && (
        <AnchorNote
          target={pipRef}
          side="left"
          dx={-6}
          dy={-12}
          width={200}
          show={step >= 3}
        >
          {WORK_NOTES[view]}
        </AnchorNote>
      )}
      {view === "thread" && (
        <AnchorNote
          target={openRef}
          side="right"
          dx={10}
          width={210}
          show={step >= 3}
        >
          {WORK_NOTES[view]}
        </AnchorNote>
      )}
    </div>
  );
}

// Storyboard frame 1, option B: a Share dialog, like Google Docs. Who has
// access, what they can do, and a link for everyone else.
function ShareMock() {
  const addRef = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState(true);
  return (
    <div className="gb-mockwrap tag">
      <div className="gb-mock single">
        <div className={`gb-pane gb-window${open ? " stack" : ""}`}>
          <div className={`gb-main${open ? " dim" : ""}`}>
            <div className="gb-titlebar">
              <BlobAv color="j" sm />
              <span className="gb-titlebar-name">{BOT}</span>
              <button
                type="button"
                className="gb-invite-btn"
                onClick={() => setOpen(true)}
              >
                Invite
              </button>
            </div>
            <div className="gb-feed">
              <Msg who="kira">comps for 2BRs near Bedford under $4k</Msg>
              <Msg who="bot">
                14 comps. Median <b>$3,720</b>, so Bedford is 5% over.
              </Msg>
              {added && !open && (
                <div className="gb-invite-line">
                  <span>
                    Invite sent. <b>sam@dubois.co</b> got a link. He signs up,
                    then lands here.
                  </span>
                </div>
              )}
            </div>
            <Composer placeholder={`Message ${BOT}`} />
          </div>
          {open && (
            <div className="gb-share">
              <div className="gb-share-head">
                <span>Invite to &ldquo;{BOT}&rdquo;</span>
                <button
                  type="button"
                  className="gb-ask-x gb-x-btn"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="gb-share-input" ref={addRef}>
                {added ? (
                  <span className="gb-tochip human">
                    <span className="gb-av s">SD</span>
                    sam@dubois.co
                  </span>
                ) : (
                  <button
                    type="button"
                    className="gb-share-add"
                    onClick={() => setAdded(true)}
                  >
                    Add people by email
                  </button>
                )}
              </div>
              <p className="gb-share-label">People with access</p>
              <div className="gb-share-row">
                <span className="gb-pav k">KC</span>
                <div>
                  <b>Kira Cheung</b>
                  <small>kira@atrios.com</small>
                </div>
              </div>
              {added && (
                <div className="gb-share-row new">
                  <span className="gb-pav s">SD</span>
                  <div>
                    <b>Sam Dubois</b>
                    <small>invited · not opened yet</small>
                  </div>
                </div>
              )}
              <div className="gb-share-row">
                <BlobAv color="j" sm />
                <div>
                  <b>{BOT}</b>
                  <small>the bot itself</small>
                </div>
              </div>
              <div className="gb-share-foot">
                <button type="button" className="gb-btn subtle">
                  Copy link
                </button>
                <button
                  type="button"
                  className="gb-btn"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {open && (
        <AnchorNote
          target={addRef}
          side="below"
          align="end"
          dx={-90}
          dy={4}
          width={190}
        >
          {added
            ? "sam is on the list before he even opens it. so is the bot, like a person."
            : "type an email here. the bot is already on the list, like a person."}
        </AnchorNote>
      )}
    </div>
  );
}

// Storyboard frame 1, option C: an invite link, like Discord. Anyone with it

type AddView = "to" | "share";

const ADD_VIEWS: {
  key: AddView;
  label: string;
  sub: string;
  gains: string[];
  costs: string[];
}[] = [
  {
    key: "to",
    label: "To: field",
    sub: "type an email where you would pick a bot",
    gains: [
      "One field for bots and people. Adding a human is not a special act.",
      "Fits the app's existing new-chat flow.",
    ],
    costs: [
      "2 emails and no bot is a valid entry. That makes a human-only chat, and Grok is not a messaging app.",
      "No place to see who is in, or to take someone out.",
    ],
  },
  {
    key: "share",
    label: "Invite dialog",
    sub: "like Google Docs: who is in, who is pending",
    gains: [
      "You invite from inside a bot's chat, so a room always has a bot in it. The rule is built into where the door is.",
      "Answers who is in and who is pending, and the bot is on the list like a person.",
    ],
    costs: [
      "A modal. It interrupts the chat to manage the chat.",
      "2 places to add things: bots in To:, people in Invite.",
    ],
  },
];

// Scales a mock down so the whole frame (blurb, mock, trade-offs) fits in
// one screen. Measures the mock's natural size and the room it has, and
// applies a uniform scale; never scales up.
function FitBox({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const avail = o.clientHeight;
      const need = i.scrollHeight;
      if (!avail || !need) return;
      setScale(Math.min(1, (avail - 8) / need));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="gb-fit" ref={outer}>
      <div
        className="gb-fit-inner"
        ref={inner}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

// Section 02 as a storyboard: a sticky menu of steps on the left, each with
// its variants; the frames on the right change as you scroll.
const FRAMES = [
  {
    key: "add",
    title: "Adding a person",
    blurb:
      "Kira has Nestie. How does Sam get in? 2 ways, each borrowed from a product people already know.",
    variants: [],
  },
  {
    key: "convo",
    title: "Does it need an @?",
    blurb:
      "Sam asks the group for comps. Nestie is in the chat. Does it need an @ before it answers?",
    variants: [
      {
        key: "tag",
        label: "Yes. @ to wake it",
        sub: "The Tag: it answers only when tagged",
      },
      {
        key: "team",
        label: "No. It listens",
        sub: "The Teammate: it picks it up from the room",
      },
    ],
  },
  {
    key: "work",
    title: "When it takes the computer",
    blurb:
      "Different cast, same bot. Kira and Eli ship a landing page; Shipper deploys. Where does the screen go while it works?",
    variants: [],
  },
] as const;

type WorkView = "side" | "pip" | "thread";

// The verdict for each step, shown next to the evidence: a stamp on the
// option in the menu, 1 line of why under the frame.
const DECISIONS: Record<
  "add" | "convo" | "work",
  { ship: readonly string[]; why: React.ReactNode }
> = {
  add: {
    ship: ["share"],
    why: (
      <>
        <b>Invite dialog.</b> Every room needs a bot, and the To: field cannot
        promise that: 2 emails and no bot is a valid entry. The Invite lives
        inside a bot&rsquo;s chat, so the rule is enforced by where the door is.
        To: keeps its 1 job, picking the bot.
      </>
    ),
  },
  convo: {
    ship: ["tag", "team"],
    why: (
      <>
        <b>Both, 2 jobs.</b> The @ is the floor: an order that fires every time,
        on day 1, whatever the model can do. Listening is the bet: it speaks
        when it has something new, dialled up as the speak rules get learned.
        Ship the floor loud and the listener quiet.
      </>
    ),
  },
  work: {
    ship: ["side"],
    why: (
      <>
        <b>Side panel.</b> Everyone sees the same loop while it runs. Picture in
        picture is the upgrade once 2 bots can work at once; a thread hides the
        loop, so no.
      </>
    ),
  },
};

function Stamp({ frame, opt }: { frame: keyof typeof DECISIONS; opt: string }) {
  return DECISIONS[frame].ship.includes(opt) ? (
    <span className="gb-stamp gb-mono">ship</span>
  ) : null;
}

function Why({ frame }: { frame: keyof typeof DECISIONS }) {
  return (
    <p className="gb-frame-why">
      <span className="gb-mono">Decision</span>
      <span>{DECISIONS[frame].why}</span>
    </p>
  );
}

const WORK_VIEWS: {
  key: WorkView;
  label: string;
  sub: string;
  gains: string[];
  costs: string[];
}[] = [
  {
    key: "side",
    label: "Side panel (today)",
    sub: "what the app does today: card in chat, screen on the right",
    gains: [
      "Everyone sees the same card and the same screen. Nothing to open.",
      "Zero new UI. The panel already exists.",
    ],
    costs: [
      "The panel shows 1 screen. Two bots working at once have nowhere to go.",
      "Narrow windows lose the panel first, and the loop with it.",
    ],
  },
  {
    key: "pip",
    label: "Picture in picture",
    sub: "the screen floats over the chat, like a call",
    gains: [
      "The loop stays in your eyeline while you keep talking.",
      "Scales: 2 bots, 2 tiles. Drag, pin, pop out.",
    ],
    costs: [
      "Covers the chat. Long runs become a thing you dismiss.",
      "Feels like a meeting, and the bot is not in a meeting.",
    ],
  },
  {
    key: "thread",
    label: "Thread",
    sub: "the work forks into its own conversation",
    gains: [
      "The chat only gets the result. Work never interrupts talk.",
      "The screen, the steps, and the logins share one address.",
    ],
    costs: [
      "One more place to look. A handoff can sit unseen.",
      "Splits the room: watchers in the thread, talkers in the chat.",
    ],
  },
];

const WORK_NOTES: Record<WorkView, string> = {
  side: "the chat gets the card. the screen lives on the right, where the app already puts it. same window, no fork.",
  pip: "the screen floats. the chat keeps moving underneath it, and you can see both.",
  thread: "the work gets its own room. the chat only hears the result.",
};

function TradeList({
  gains,
  costs,
}: {
  gains: readonly string[];
  costs: readonly string[];
}) {
  return (
    <div className="gb-tradeoffs">
      <ul className="gain">
        {gains.map((g) => (
          <li key={g}>
            <span className="gb-mono">+</span>
            {g}
          </li>
        ))}
      </ul>
      <ul className="cost">
        {costs.map((c) => (
          <li key={c}>
            <span className="gb-mono">−</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Storyboard() {
  const [convo, setConvo] = useState<"tag" | "team">("tag");
  const [add, setAdd] = useState<AddView>("to");
  const [view, setView] = useState<WorkView>("side");
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState(false);
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const in0 = useInView(refs[0], { margin: "-45% 0px -45% 0px" });
  const in1 = useInView(refs[1], { margin: "-45% 0px -45% 0px" });
  const in2 = useInView(refs[2], { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (in2) setActive(2);
    else if (in1) setActive(1);
    else if (in0) setActive(0);
  }, [in0, in1, in2]);

  // Page through the storyboard: inside the band, one wheel gesture moves to
  // the next or previous frame instead of free-scrolling. At the first frame
  // scrolling up, or the last frame scrolling down, the page scrolls normally
  // so the reader can leave.
  const lock = useRef(false);
  const acc = useRef(0);
  const lastWheel = useRef(0);
  useEffect(() => {
    const TOP = 28;
    const tops = () =>
      refs.map((r) =>
        r.current
          ? r.current.getBoundingClientRect().top + window.scrollY - TOP
          : 0,
      );
    const go = (i: number) => {
      lock.current = true;
      window.scrollTo({ top: tops()[i], behavior: "smooth" });
      setTimeout(() => {
        lock.current = false;
        acc.current = 0;
      }, 800);
    };
    const onWheel = (e: WheelEvent) => {
      const y = window.scrollY;
      const t = tops();
      const last = refs[2].current;
      if (!last) return;
      const end = t[2] + last.getBoundingClientRect().height;
      const inBand = y >= t[0] - 80 && y < end - window.innerHeight * 0.4;
      if (!inBand) return;
      // which frame are we on
      let cur = 0;
      t.forEach((ft, i) => {
        if (ft <= y + 40) cur = i;
      });
      const dir = e.deltaY > 0 ? 1 : -1;
      // leaving the band: let the page scroll
      if ((dir > 0 && cur === 2) || (dir < 0 && cur === 0 && y <= t[0] + 4))
        return;
      e.preventDefault();
      if (lock.current) return;
      const now = Date.now();
      if (now - lastWheel.current > 160) acc.current = 0; // new gesture
      lastWheel.current = now;
      acc.current += e.deltaY;
      if (Math.abs(acc.current) < 60) return;
      acc.current = 0;
      go(dir > 0 ? Math.min(2, cur + 1) : Math.max(0, cur - 1));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const opt = OPTIONS.find(
    (x) => x.key === (convo === "tag" ? "tag" : "teammate"),
  )!;
  const inStory = in0 || in1 || in2;
  // one radio list per step, used by the side menu and the mobile sheet
  const optionsFor = (i: number) => {
    if (i === 0)
      return ADD_VIEWS.map((w) => ({
        key: w.key,
        label: w.label,
        sub: w.sub,
        on: add === w.key,
        pick: () => setAdd(w.key),
      }));
    if (i === 1)
      return FRAMES[1].variants.map((v) => ({
        key: v.key,
        label: v.label,
        sub: v.sub,
        on: convo === v.key,
        pick: () => setConvo(v.key as "tag" | "team"),
      }));
    return WORK_VIEWS.map((w) => ({
      key: w.key,
      label: w.label,
      sub: w.sub,
      on: view === w.key,
      pick: () => setView(w.key),
    }));
  };
  const cur = optionsFor(active).find((o) => o.on);
  const goTo = (i: number) =>
    refs[i].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const wv = WORK_VIEWS.find((w) => w.key === view)!;
  const av = ADD_VIEWS.find((w) => w.key === add)!;
  return (
    <div className="gb-story">
      <aside className="gb-story-menu">
        {FRAMES.map((f, i) => (
          <div
            key={f.key}
            className={`gb-story-step${active === i ? " on" : ""}`}
            onClick={() => goTo(i)}
          >
            <span className="gb-story-num gb-mono">0{i + 1}</span>
            <p className="gb-story-title">{f.title}</p>
            {f.key === "add" && (
              <div className="gb-story-opts" role="radiogroup">
                {ADD_VIEWS.map((w) => (
                  <button
                    key={w.key}
                    type="button"
                    role="radio"
                    aria-checked={add === w.key}
                    className={`gb-story-opt${add === w.key ? " on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdd(w.key);
                      goTo(0);
                    }}
                  >
                    <span className="gb-story-dot" aria-hidden="true" />
                    <span>
                      <b>{w.label}</b>
                      <Stamp frame="add" opt={w.key} />
                    </span>
                  </button>
                ))}
              </div>
            )}
            {f.key === "convo" && (
              <div className="gb-story-opts" role="radiogroup">
                {f.variants.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    role="radio"
                    aria-checked={convo === v.key}
                    className={`gb-story-opt${convo === v.key ? " on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConvo(v.key as "tag" | "team");
                      goTo(1);
                    }}
                  >
                    <span className="gb-story-dot" aria-hidden="true" />
                    <span>
                      <b>{v.label}</b>
                      <Stamp frame="convo" opt={v.key} />
                    </span>
                  </button>
                ))}
              </div>
            )}
            {f.key === "work" && (
              <div className="gb-story-opts" role="radiogroup">
                {WORK_VIEWS.map((w) => (
                  <button
                    key={w.key}
                    type="button"
                    role="radio"
                    aria-checked={view === w.key}
                    className={`gb-story-opt${view === w.key ? " on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setView(w.key);
                      goTo(2);
                    }}
                  >
                    <span className="gb-story-dot" aria-hidden="true" />
                    <span>
                      <b>{w.label}</b>
                      <Stamp frame="work" opt={w.key} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
      <div className="gb-story-frames">
        <div className="gb-story-frame" ref={refs[0]}>
          <p className="gb-story-blurb">
            <span className="gb-mono">01</span>
            <span>
              {FRAMES[0].blurb}{" "}
              <span className="gb-option-scenario">
                {av.label}: {av.sub}.
              </span>
            </span>
          </p>
          <FitBox key={`fit-${add}`}>
            {add === "to" && (
              <>
                <ComposerMock />
              </>
            )}
            {add === "share" && <ShareMock key="share" />}
          </FitBox>
          <div className="gb-frame-trades" key={`atrades-${add}`}>
            <TradeList gains={av.gains} costs={av.costs} />
            <Why frame="add" />
          </div>
        </div>
        <div className="gb-story-frame" ref={refs[1]}>
          <p className="gb-story-blurb">
            <span className="gb-mono">02</span>
            <span>
              {FRAMES[1].blurb}{" "}
              <span className="gb-option-scenario">
                {FRAMES[1].variants.find((v) => v.key === convo)?.label}:{" "}
                {FRAMES[1].variants.find((v) => v.key === convo)?.sub}.
              </span>
            </span>
          </p>
          <FitBox key={`fit-${convo}`}>
            <ConvoMock variant={convo} key={`mock-${convo}`} />
          </FitBox>
          <div className="gb-frame-trades" key={`trades-${opt.key}`}>
            <TradeList gains={opt.gains} costs={opt.costs} />
            <p className="gb-fail">
              <span className="gb-mono">Week 1 failure</span>
              {opt.fail}
            </p>
            <Why frame="convo" />
          </div>
        </div>
        <div className="gb-story-frame" ref={refs[2]}>
          <p className="gb-story-blurb">
            <span className="gb-mono">03</span>
            <span>
              {FRAMES[2].blurb}{" "}
              <span className="gb-option-scenario">
                {wv.label}: {wv.sub}.
              </span>
            </span>
          </p>
          <FitBox key={`fit-${view}`}>
            <WorkMock view={view} key={`work-${view}`} />
          </FitBox>
          <div className="gb-frame-trades" key={`wtrades-${view}`}>
            <TradeList gains={wv.gains} costs={wv.costs} />
            <Why frame="work" />
          </div>
          <p className="gb-rule-note">
            <b>Where the screen goes is the whole question.</b> An answer closes
            a loop in the chat. Work opens a longer one, act, check, hand off,
            and the screen is that loop made visible. Put it where the people
            are, and the handoff gets caught. Hide it, and the handoff has to
            shout.
          </p>
        </div>
      </div>

      {/* mobile: a filter bar at the bottom, like a store, that opens a sheet
          with this step's options */}
      {inStory && (
        <div className="gb-sheetbar">
          <div className="gb-sheetbar-text">
            <span className="gb-mono">0{active + 1}</span>
            <b>{FRAMES[active].title}</b>
            <small>{cur?.label}</small>
          </div>
          <button
            type="button"
            className="gb-seg-btn on"
            onClick={() => setSheet(true)}
          >
            Change
          </button>
        </div>
      )}
      {sheet && (
        <div className="gb-sheet-scrim" onClick={() => setSheet(false)}>
          <div className="gb-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="gb-sheet-handle" aria-hidden="true" />
            <p className="gb-story-title">{FRAMES[active].title}</p>
            <div className="gb-story-opts" role="radiogroup">
              {optionsFor(active).map((o) => (
                <button
                  key={o.key}
                  type="button"
                  role="radio"
                  aria-checked={o.on}
                  className={`gb-story-opt${o.on ? " on" : ""}`}
                  onClick={() => {
                    o.pick();
                    setSheet(false);
                  }}
                >
                  <span className="gb-story-dot" aria-hidden="true" />
                  <span>
                    <b>{o.label}</b>
                    <small>{o.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const HYPOTHESES = [
  {
    id: "H1",
    claim:
      "2 people correcting the same bot together make it better, faster, than 1 person alone.",
    measure:
      "Corrections per bot from 2+ people; repeat asks on the same topic, compared with solo bots.",
    kill: "Corrections cancel each other out and it gets worse. 2 steerers need a rule for who wins.",
  },
  {
    id: "H2",
    claim:
      "A bot that speaks unprompted gets kept, if it speaks rarely and only with something new.",
    measure: "Bots with 2+ humans still active at day 30; mutes by day 3.",
    kill: "Muted by day 3. The speak rules were the product. Dial to 0; the room is @-only until they exist.",
  },
] as const;

// Tag vs Teammate, side by side: what each gains, what each costs, and how

// Section 02: the 5 options as tabs, each with its own scenario and mock.
const OPTIONS = [
  {
    key: "tag",
    letter: "A",
    title: "The Tag",
    serves: "The humans' space, bot on call",
    scenario: "Kira and Sam, hunting for a 2BR. Nestie is the apartment bot.",
    blurb:
      "The humans host. @ the bot, it answers in the chat. When it has to act, the work forks into a thread with a live screen. Nothing reaches it without an @.",
    gains: [
      "Nothing new to learn.",
      "Quiet by default. It speaks when asked; work stays out of the chat until it is done.",
    ],
    costs: [
      "It reads the whole chat, so it has the context, but a cycle only starts on an @. It never picks one up on its own.",
      "The chat is human-first and the bot is an add-on.",
    ],
    fail: "Nobody remembers to tag it. It sits in the room unused.",
  },
  {
    key: "teammate",
    letter: "B",
    title: "The Teammate",
    serves: "The humans' space, bot as peer",
    scenario:
      "An engineering team. Standup is the bot that runs the morning digest.",
    blurb:
      "The humans host, and the bot is a full member. No @. It picks cycles up from the room, answers when it has something, posts its routine on its own schedule.",
    gains: [
      "Compounds. Every conversation it reads is context for the next, a positive feedback loop on context.",
      "Nobody has to remember to loop it in.",
    ],
    costs: [
      "Reads everything, so it needs its own identity.",
      "Needs rules for when to speak. A loop that can start itself can also run away; wrong defaults and it is the loudest one in the room.",
    ],
    fail: "It talks too much and gets muted by day 3.",
  },
] as const;

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
            transition={{
              duration: 0.7,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            A Grok bot is a closed loop around 1 person. The jobs it does are
            not. What changes when the loop has to close around a group.
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
            <h2 className="gb-h2 gb-display">The problem</h2>
            <p>
              A Grok bot is a feedback loop with 1 person in it. Kira asks, it
              answers, Kira corrects, it remembers. The loop is what makes it
              good. When someone else needs it, the owner relays: copy out, copy
              back. The relay breaks the loop. Sam&rsquo;s corrections never
              return to the bot as signal, so its model of the job stays 1
              person wide.
            </p>
            <p className="gb-observed">
              <span className="gb-mono">Observed</span>
              In my own hunt, every answer Sam needed left the app as a
              screenshot, and none of his replies came back in.
            </p>
            <p>2 jobs, ordered by how many loops they add.</p>

            <div className="gb-why">
              <div className="gb-why-item">
                <span className="gb-why-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* two wobbly arrows meeting at one dot */}
                    <path d="M6.5 9.2c4.1 3.6 8.4 7.1 12.6 11.3" />
                    <path d="M8.3 10.6c1.9-.4 3.4-1.6 4.9-2.9" />
                    <path d="M8.1 10.4c.3 1.9-.2 3.7-.9 5.4" />
                    <path d="M41.2 8.6c-4.6 3.9-8.7 7.6-12.4 11.9" />
                    <path d="M39.6 10.1c-1.7-.6-3.3-1.5-4.7-3.1" />
                    <path d="M39.8 9.9c-.5 1.8-.1 3.6.6 5.3" />
                    <path d="M24.3 21.4c3.2-.2 5.6 2.1 5.4 5.1-.2 3.1-2.8 5.2-5.9 4.9-3-.3-4.9-2.7-4.6-5.6.3-2.6 2.2-4.3 5.1-4.4z" />
                    <path d="M12.1 41.3c3.4-3.6 7.6-5.7 12.3-5.9 4.6-.2 8.7 1.9 11.9 5.4" />
                  </svg>
                </span>
                <h3 className="gb-h3 gb-display">Steer it together</h3>
                <p>
                  Two people correct the same bot in the same chat. Every
                  correction is signal the bot keeps, so the loop closes around
                  the group. Its memory becomes the group&rsquo;s.
                </p>
              </div>
              <div className="gb-why-item">
                <span className="gb-why-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* a wobbly roof with 2 people and the blob under it */}
                    <path d="M5.8 21.9c6.3-5.4 12.4-10.5 18.4-15.6 5.9 4.9 12.1 10.1 18.3 15.2" />
                    <path d="M9.1 20.3c.2 6.9.1 13.8-.3 20.7 9.9.4 20.1.5 30.3.2-.3-7-.4-13.9-.2-20.9" />
                    <path d="M14.2 30.4c-.1-2 1.4-3.3 3.1-3.2 1.8.1 2.9 1.6 2.7 3.4-.2 1.7-1.5 2.7-3.1 2.6-1.6-.1-2.7-1.2-2.7-2.8z" />
                    <path d="M12.3 38.6c1.2-2.4 2.8-3.4 4.9-3.3 2 .1 3.5 1.2 4.6 3.4" />
                    <path d="M28.1 30.1c-.2-2 1.2-3.4 3-3.3 1.9.1 3.1 1.5 2.9 3.4-.2 1.8-1.4 2.8-3.1 2.7-1.7-.1-2.8-1.2-2.8-2.8z" />
                    <path d="M26.4 38.4c1.1-2.4 2.7-3.4 4.8-3.3 2 .1 3.6 1.2 4.7 3.5" />
                    <path d="M20.1 16.3c-.1-1.9 1.6-3.4 3.9-3.3 2.3.1 3.9 1.6 3.8 3.5-.1 1.8-1.8 3.1-4 3-2.2-.1-3.7-1.4-3.7-3.2z" />
                    <path d="M22.9 15.4v1.9M25.1 15.3v1.9" />
                  </svg>
                </span>
                <h3 className="gb-h3 gb-display">Make it a member</h3>
                <p>
                  The bot lives in the group: routines, a screen, files. Its
                  work is visible by default, so observation is free and
                  correction is immediate. A second loop opens: it acts, the
                  group reacts, it adjusts, and nobody had to ask.
                </p>
              </div>
            </div>

            <h3 className="gb-h3 gb-display">1 bot or many?</h3>
            <p>
              Design for 1 bot and many humans. More bots is more loops in the
              same room, and that only works if a bot is a participant, not a
              feature of one account.
            </p>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">02 · Options</p>
            <h2 className="gb-h2 gb-display">Whose space is it?</h2>
            <p>
              3 questions, in the order a group hits them. Each option is a real
              screen with what it gains, what it costs, and how it fails in week
              1. The one I would ship is stamped. Scroll the story; flip the
              options to compare.
            </p>
          </Reveal>
          <Storyboard />
        </section>
        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">03 · Bets</p>
            <h2 className="gb-h2 gb-display">What has to be true</h2>
            <p>
              2 bets: that people steer a bot together, and that it can speak
              without being asked. How I would test each, and what would prove
              it wrong.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="gb-hyp-table" role="table">
              <div className="gb-hyp-head" role="row">
                <span>Hypothesis</span>
                <span>Measure</span>
                <span>Kill signal</span>
              </div>
              {HYPOTHESES.map((h) => (
                <div className="gb-hyp-row" role="row" key={h.id}>
                  <span>
                    <b className="gb-mono">{h.id}</b>
                    {h.claim}
                  </span>
                  <span>{h.measure}</span>
                  <span>{h.kill}</span>
                </div>
              ))}
            </div>
            <div className="gb-assume">
              <p>
                <b>Assumed: the brand wants the agent visible.</b> A face, a
                name, a screen everyone can watch. Every stamp above is built on
                that. If Grok wants the bot invisible, the Side panel and the
                Teammate are the wrong calls.
              </p>
              <p>
                <b>Assumed: listening is a model bet, not a feature.</b> How
                often the bot speaks unprompted is a dial tied to how well it
                reads intent from loose talk. It starts near 0 and opens as the
                speak rules get learned. The @ path does not depend on it.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">04 · Constraints</p>
            <h2 className="gb-h2 gb-display">The hard problems</h2>
            <p>
              With 1 person these answer themselves. With 2, each needs a call.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="gb-calls">
              <div className="gb-call">
                <h3>Can a chat have no bot?</h3>
                <p className="gb-call-verdict">
                  No. Every room has a bot. Grok is not a messaging app, so
                  people are added from inside a bot&rsquo;s chat.
                </p>
              </div>
              <div className="gb-call">
                <h3>What is the chat called?</h3>
                <p className="gb-call-verdict">
                  Like any group chat: the members, bot included. &ldquo;Kira,
                  Sam, Nestie&rdquo; by default, and anyone can rename it.
                </p>
              </div>
              <div className="gb-call">
                <h3>Does Sam need an account?</h3>
                <p className="gb-call-verdict">
                  Yes. The link goes to sign-up, then into the room. Every
                  message and run has a real name on it.
                </p>
              </div>
              <div className="gb-call">
                <h3>Does it learn from Sam too?</h3>
                <p className="gb-call-verdict">
                  Yes. Anything either of you tells it in the room, it keeps:
                  Sam says &ldquo;skip the BQE&rdquo; once and it stays skipped.
                  Your private chat with it stays private, in both directions.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="gb-section">
          <Reveal>
            <p className="gb-kicker gb-mono">05 · Iterate</p>
            <h2 className="gb-h2 gb-display">Open questions</h2>
            <ul className="gb-openq">
              <li>
                2 bots in 1 room. Does the To: field scale, or does a second
                name need a second kind of row?
              </li>
              <li>
                Can a thread be pinned and become a room, so long work gets a
                door of its own without hiding the loop?
              </li>
              <li>
                Can someone be invited to 1 thread without joining the whole
                room?
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
