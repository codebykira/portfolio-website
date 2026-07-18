---
version: alpha
name: Notion Clean
description: A bright, minimal, editorial SaaS system with bold typography, subtle borders, and a single vivid blue action color.
colors:
  primary: "#455DD3"
  secondary: "#213183"
  tertiary: "#0075DE"
  neutral: "#F7F7F5"
  surface: "#FFFFFF"
  on-surface: "#000000"
  border: "#0000001A"
  muted: "#6B7280"
  success: "#22C55E"
  error: "#EF4444"
typography:
  headline-display:
    fontFamily: "NotionInter"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: "64px"
    letterSpacing: "-2.125px"
  headline-lg:
    fontFamily: "NotionInter"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: "53px"
    letterSpacing: "-0.75px"
  headline-md:
    fontFamily: "NotionInter"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: "36px"
  headline-sm:
    fontFamily: "NotionInter"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: "24px"
  body-lg:
    fontFamily: "NotionInter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-md:
    fontFamily: "NotionInter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-sm:
    fontFamily: "NotionInter"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  label-lg:
    fontFamily: "NotionInter"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  label-md:
    fontFamily: "NotionInter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  label-sm:
    fontFamily: "NotionInter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.01em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 50px
  xl: 70px
  xxl: 100px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 15px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "6px 15px"
    height: "38px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "0px"
    height: "auto"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  chip:
    backgroundColor: "#F2F4FF"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
---

# Notion Clean

## Overview
The visual language is airy, confident, and product-forward, with a distinctly editorial feel. It is designed for a broad professional audience that needs clarity, trust, and quick scanning rather than decorative flourish. The tone is calm and minimal, but the bold headline treatment and bright blue actions keep the interface energetic and conversion-oriented.

## Colors
- **Primary (#455DD3):** The main Notion blue, used for primary buttons and key interactive emphasis. It feels crisp, digital, and trustworthy.
- **Secondary (#213183):** A deeper indigo support color for stronger emphasis states and alternate action treatments when a darker blue is needed.
- **Tertiary (#0075DE):** A brighter link blue for text actions and navigational affordances, keeping links clearly distinct from solid buttons.
- **Surface (#FFFFFF):** The dominant canvas color. Most of the interface rests on pure white, which makes the layout feel open and lightweight.
- **Neutral (#F7F7F5):** A soft off-white neutral used for subtle sectional contrast without introducing gray heaviness.
- **On-surface (#000000):** Pure black text gives the brand its sharp editorial contrast and makes large headlines visually powerful.
- **Border (#0000001A):** A very faint hairline border used for cards, panels, and UI containment. It supports structure without adding visual weight.
- **Muted (#6B7280):** A restrained mid-gray for secondary metadata and supporting copy.
- **Success (#22C55E):** A fresh green accent for positive status, live indicators, and success cues.
- **Error (#EF4444):** A clear red for destructive actions and critical feedback.

## Typography
The system uses NotionInter as the primary voice, with Inter as the fallback family. Headlines are large, bold, and tightly tracked: `headline-display` and `headline-lg` carry the brand’s hero moments, while `headline-md` and `headline-sm` support secondary sections with a lighter weight. Body text is clean and highly legible, with `body-md` as the default reading size and `body-lg` reserved for more prominent supporting copy.

Labels and controls use medium weight for better affordance, especially on buttons and navigation. The brand does not rely on uppercase UI labels; instead, it uses size, weight, and spacing for hierarchy. Letter spacing is minimal and only becomes slightly tighter in the largest display styles, reinforcing the editorial, refined tone.

## Layout
The layout is centered and spacious, with a strong vertical rhythm and generous whitespace around the hero area. Content feels built on a wide fixed-max-width container rather than a dense grid, allowing the headline, CTA cluster, and supporting product preview to breathe. Spacing steps are broad and intentional, with `xs` and `sm` for inline UI spacing and `lg` through `xxl` for section separation and hero composition.

Cards and embedded product previews use comfortable internal padding, typically around 24px, while buttons maintain compact vertical padding to keep the interface efficient. The overall rhythm favors large blocks of empty space over tightly packed modules, which reinforces clarity and premium restraint.

## Elevation & Depth
Depth is handled very lightly. The design relies more on tonal separation, faint borders, and contrast than on strong shadows or layered elevation. Where shadow appears, it is subtle and soft, supporting the floating product mockup feel without breaking the flat, airy aesthetic.

This approach keeps the interface feeling modern and calm. Interactive and structural elements are separated primarily by outline, spacing, and the crisp difference between white surfaces and black text.

## Shapes
The shape language is soft and practical rather than playful. Controls use small to medium radii, with `rounded.md` for buttons and inputs and `rounded.lg` for cards and larger containers. Pills and badges can use `rounded.full` when the component should read as a chip or status capsule.

Overall, the system feels gently rounded but still disciplined. There are no heavy curves or expressive blobs; the geometry stays tidy and product-centric.

## Components
### Buttons
Primary buttons use `button-primary` with a filled blue surface, white text, and `rounded.md` corners. They are compact, with 6px vertical padding and a 38px target height, making them feel efficient and polished. Secondary buttons use `button-secondary` for lighter emphasis; they should remain clear but less dominant than primary actions. Tertiary buttons use `button-tertiary` for text-only interactions such as nav links or inline actions.

Buttons should remain medium weight and highly legible. Hover states should preserve the clean blue family and avoid heavy shadows or oversized motion.

### Cards
Cards use `card` with a white background, 1px translucent border, `rounded.lg`, and 24px padding. They should feel like organized containers, not floating panels. Keep card content structured with clear internal hierarchy and generous spacing between sections.

### Inputs
Inputs should mirror the card language: white background, faint border, and `rounded.md`. Padding should be comfortable enough for editing but visually compact, matching the product’s efficient SaaS character. Focus states should rely on blue border or ring accents rather than shadow.

### Chips and Pills
Chips and badges should be small, rounded, and color-light. Use `chip` for contextual markers, status pills, and feature tags. They should feel informative rather than decorative, with soft fills and concise text.

### Navigation
Top navigation is minimal, text-led, and low-friction. Links should stay neutral by default and rely on spacing and placement for hierarchy. Dropdown indicators are tiny and understated, reinforcing the calm, utilitarian tone.

### Illustration and Product Previews
Product mockups and decorative icon clusters should stay playful but contained. They can use brighter accent colors and small circular containers, but the surrounding interface must remain restrained so the hero still reads as professional and trustworthy.

## Do's and Don'ts
- Do keep the interface mostly white with only one dominant blue accent for core actions.
- Do use bold, oversized headlines with tight tracking for hero messaging.
- Do separate panels and cards with faint borders instead of heavy shadows.
- Do maintain generous whitespace around major marketing sections and previews.
- Don't introduce elaborate gradients, glassmorphism, or dark-mode styling into this system.
- Don't use multiple competing accent colors for primary CTAs.
- Don't over-round components; preserve the clean, disciplined geometry.
- Don't crowd sections with dense copy or tightly packed visual modules.
