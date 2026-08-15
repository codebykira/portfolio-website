# DESIGN.md — Résumé Builder: "Editorial Technical / Blueprint"

The visual system for `/builder` (the résumé builder inside the portfolio site).
Implemented in **`src/app/builder/builder.css`** (scoped under `.builder-root`);
fonts are wired in **`src/lib/fonts.ts`**.

---

## 1. Lineage & Naming

**Editorial Technical / Blueprint.** The look sits at the intersection of three
traditions:

- **Swiss / editorial minimalism** — a strict hairline grid, generous negative
  space, oversized bold grotesque display type, near-monochrome ink-on-paper.
- **Patent-drawing / blueprint** — thin black line work, exploded isometric
  layer stacks, dotted leader lines with small arrowheads, spec-sheet callouts.
- **Spec sheet / technical documentation** — monospace uppercase annotation
  labels, huge index numerals (`STEP / 01`), square outline bullet markers.

The mood is *engineering-grade*: serious, considered, restrained. Ink on pale
paper. Reference: the Alkares concrete-coating marketing site (product-step and
lab-durability sections).

> We are deliberately moving **away** from the previous "neubrutalist" theme
> (periwinkle grid, loud orange bricks, hard offset drop-shadows, navy borders).
> Class names remain `lego-*` for now; only the skin changed.

---

## 2. Design Principles

1. **Ink on paper.** Near-black type on a pale, faintly cool-tinted background.
   Colour is almost absent.
2. **Hairlines, not boxes.** Structure is drawn with 1px rules, not heavy
   borders or fills. Nothing has a hard offset shadow.
3. **One restrained accent.** A single muted clay/terracotta accent, used
   sparingly (focus rings, a metric chip, an error). Never as a field of colour.
4. **Negative space is structural.** Whitespace does the framing; let layouts
   breathe inside the panel.
5. **Type carries the hierarchy.** A huge grotesque display headline + tiny
   letter-spaced mono meta labels do most of the work — size contrast, not
   colour contrast.
6. **Technical honesty.** Monospace for anything that reads as data, a label, a
   coordinate, or an index. Diagrams look like patent drawings, not
   illustrations.

---

## 3. Palette (tokens)

All tokens are defined on `.builder-root` and consumed by components either
through CSS classes or inline `style={{ color: "var(--x)" }}`. **Names are
fixed; only values changed** in the pivot to blueprint.

| Token | Hex | Role / usage |
|---|---|---|
| `--blue` | `#EAF1EE` | **Pale paper background** (repurposed). The page canvas — off-white with a faint cool mint-gray tint. |
| `--blue-deep` | `#DDE7E2` | Slightly deeper paper, for optional inset zones. |
| `--paper` | `#FFFFFF` | Crisp white card / input surface, floating above the tinted canvas. |
| `--ink` | `#15191B` | Near-black primary text and ink fills. |
| `--navy` | `#15191B` | Repurposed to the same near-black ink (was navy). Used for borders/text on cards. |
| `--navy-soft` | `#3B4348` | Muted ink, for secondary strokes. |
| `--muted` | `#6B7671` | Gray-green secondary text (meta, captions, help). |
| `--orange` | `#B85C38` | **The single restrained accent** — muted clay/terracotta (was loud orange). Fills, metric chips. |
| `--orange-deep` | `#97432A` | Deeper accent, readable as text on white (links, errors). |
| `--grid` | `rgba(21,25,27,0.05)` | Hairline colour for the faint background grid. |
| `--rule` | `rgba(21,25,27,0.14)` | Hairline colour for borders, dividers, panel edges. *(additive helper token.)* |
| `--rule-strong` | `rgba(21,25,27,0.28)` | Slightly stronger hairline for the outer frame / emphasis. *(additive.)* |
| `--accent-ring` | `rgba(184,92,56,0.30)` | Thin focus ring tint. *(additive.)* |

Font tokens (from `src/lib/fonts.ts`):

| Token | Font | Role |
|---|---|---|
| `--font-display` | Space Grotesk (bold) | Large editorial display headings. |
| `--font-pixel` | Departure Mono | Monospace technical labels, callouts, index numerals, meta. |
| `--font-body` | Inter | Body copy inside cards. |

**Contrast note:** `--ink`, `--navy`, `--muted`, and `--orange-deep` are all
readable on both the pale canvas (`--blue`) and white cards (`--paper`).

---

## 4. Type System

Three roles, each with a clear job:

### Display — `--font-display` (Space Grotesk bold)
Large editorial headlines. Tight tracking (`-0.02em`), near-black, natural
casing (do not force uppercase — let the content's own casing read).

### Mono — `--font-pixel` (Departure Mono)
Everything technical: meta labels, tags, status pills, index numerals,
diagram annotations, buttons. Uppercase + letter-spacing for labels.

### Body — `--font-body` (Inter)
Card copy and form values. Comfortable line-height (~1.55).

### Scale

| Role | Size | Weight | Tracking | Casing |
|---|---|---|---|---|
| Display XL (`.bp-numeral`) | 56–96px | 400–500 mono | `0` | numerals |
| Display (`.lego-title`) | 30–40px | 700 | `-0.02em` | as content |
| Section heading (h2/h3) | 18–22px | 600 | `-0.01em` | as content |
| Meta label (`.lego-label`) | 11–12px | mono | `0.14em` | UPPERCASE |
| Tag / status | 11px | mono | `0.06em` | UPPERCASE |
| Body | 14–15px | 400 | `0` | sentence |
| Caption / help | 12–13px | 400 | `0` | sentence |

**Casing rules:** UPPERCASE is reserved for mono meta (labels, tags, status,
annotations). Display and body keep their natural casing.

---

## 5. Grid & Layout

- **Framed panel.** All content lives inside `.builder-frame`: a floating panel
  with a **1px hairline border**, gently rounded corners (14px), no shadow (or a
  whisper-soft one), margin around it, sitting on the pale canvas.
- **Hairline structure.** Divide regions with 1px `--rule` lines (`.bp-hairline`),
  not filled boxes. Think of the page as a spec sheet ruled into cells.
- **Faint background grid.** The canvas carries a very subtle `--grid` grid so the
  paper reads as engineering paper, never as a loud pattern.
- **Negative space.** Prefer 24–48px gaps between blocks. Let single ideas own a
  row.
- **Index numerals anchor sections.** A section can open with a mono `STEP` /
  `STATION` label above a huge `.bp-numeral` (`01`), left-aligned.

---

## 6. Component Patterns

### Buttons
- **Primary (`.lego-btn`)** — solid near-black **ink** fill, light text, mono,
  1px ink border, **no offset shadow**. Hover: a hair lighter + very soft
  shadow. Active: subtle press. Disabled: reduced opacity.
- **Ghost (`.lego-btn--ghost`)** — transparent on paper, 1px `--rule` hairline
  outline, ink text; hover fills with a faint ink wash.
- **Small (`.lego-btn--sm`)** — same, tighter padding/size.

### Cards (`.lego-card`)
White `--paper` surface, 1px `--rule` hairline border, modest radius (10px),
minimal/none shadow. Content uses `--ink` / `--muted`.

### Panels (`.lego-panel`, `.lego-panel--dashed`)
Quiet grouping zones: faint tinted fill + hairline border. `--dashed` swaps to a
dashed hairline on transparent — for "add / empty" affordances.

### Inputs (`.lego-input`, `.lego-select`, `.lego-textarea`)
Paper surface, 1px `--rule` border, ink text, muted placeholder. Focus: border
goes ink + a **thin** `--accent-ring` (accent used sparingly), no thick glow.

### Tags / chips (`.lego-tag`)
Hairline-outlined mono chip, ink text, uppercase, tight. `--metric` = solid ink
fill with paper text (or the accent) for emphasised numbers. `--ghost` = faintest
version.

### Status pills (`.lego-status`)
Quiet mono pills. `--ready` = faint green-tinted outline; `--draft` = neutral
gray outline. Understated, not badges.

### Topbar (`.lego-topbar`) & nav
- Hairline **bottom rule** only (`--rule`), no fill.
- `.lego-brand` — mono, ink; `.lego-brand-mark` — a small **outline ink square**
  (blueprint marker), not a coloured block.
- `.lego-navlink` — quiet mono, muted; `.active` — ink text with an ink underline.

### Index numerals (`.bp-numeral`)
Huge mono numeral (`01`, `02`), near-black or muted, `line-height: 1`. Pair with a
small `.lego-label` above it (`STEP` / `STATION`).

### Square bullets (`.bp-square-bullet`)
Small hairline **outline square** (▢) used as a list marker — the signature
non-round bullet.

### Dotted-leader annotations (`.bp-dotted`, `.bp-annotation`)
A dotted leader line connecting a diagram part to a mono uppercase label — the
patent-drawing callout. `.bp-dotted` is the leader; `.bp-annotation` is the mono
label text.

---

## 7. Signature Motifs

1. **Isometric exploded line diagram.** Thin black lines on white showing a
   layer stack "exploded" apart, drawn like a patent figure (SVG, 1px strokes,
   no fills). This is the soul of the style — use it for the résumé "layer
   stack" (experience → bullets → tailored output).
2. **Spec-sheet callouts.** Mono uppercase labels tied to parts by dotted leader
   lines ending in small arrowheads (`AR 4000 PA POLYASPARTIC TOPCOAT` style).
3. **Oversized index numerals** anchoring each station/step.
4. **Hairline-ruled cells** organising the page like a datasheet.

---

## 8. Do / Don't

**Do**
- Draw structure with 1px hairlines and whitespace.
- Let one huge grotesque headline + tiny mono labels carry a screen.
- Keep to ink + paper; deploy the clay accent in single small doses.
- Use mono for anything that reads as data, a label, or an index.
- Draw diagrams as thin-line patent figures with mono callouts.

**Don't**
- No hard offset drop-shadows, no chunky coloured borders.
- No loud fields of orange (or any) colour.
- Don't force uppercase on display or body — mono meta only.
- Don't fill where a hairline will do.
- Don't add round, filled, "friendly" bullets — use the square outline marker.

---

## 9. Additive Utility Classes

These are additive (`bp-*`) helpers in `builder.css`, safe to wire into markup:

| Class | Purpose |
|---|---|
| `.bp-numeral` | Huge mono index numeral (`01`), `line-height:1`, tight. |
| `.bp-hairline` | 1px full-width divider rule (`--rule`). |
| `.bp-dotted` | Dotted leader line (horizontal), for callouts. |
| `.bp-square-bullet` | Small hairline outline square list marker (▢). |
| `.bp-annotation` | Mono uppercase annotation-label text for diagram callouts. |
