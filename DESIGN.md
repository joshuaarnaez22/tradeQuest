---
name: TradeQuest
description: Duolingo for reading candlestick charts — daily historical-replay puzzles, graded on decision quality, not profit.
colors:
  ink-900: "#0b0b0f"
  ink-700: "#211f2b"
  ink-500: "#4a4757"
  ink-300: "#8a8698"
  ink-100: "#d9d6e0"
  paper-0: "#ffffff"
  paper-50: "#faf8f4"
  paper-100: "#f1eee6"
  blue-500: "#2f6fed"
  blue-700: "#1e4fc2"
  blue-100: "#dce7fe"
  violet-500: "#6c4cf1"
  violet-300: "#c9b8f5"
  violet-100: "#ede6fc"
  amber-500: "#ffc93c"
  amber-700: "#e8a400"
  amber-100: "#fff3d2"
  orange-500: "#ff5a1f"
  orange-700: "#d63f0c"
  orange-100: "#ffe1d2"
  mint-500: "#2fd9a8"
  mint-700: "#149c77"
  mint-100: "#d8fbf0"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(48px, 7vw, 120px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(32px, 4.5vw, 72px)"
    fontWeight: 400
    lineHeight: 0.92
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "32px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  24: "96px"
  32: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink-900}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-accent:
    backgroundColor: "{colors.violet-500}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  card-paper:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-inverse:
    backgroundColor: "{colors.ink-900}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "24px"
  tag-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
---

# Design System: TradeQuest

## Overview

**Creative North Star: "The Chart Room"**

TradeQuest reads like a focused, after-hours study room for charts — not a casino floor, not a generic fintech dashboard. The default surface is a deep violet-black (`#151022`) that puts candle motion and typography in the spotlight, with a maintained light-mode counterpart (`#faf8f4`) that stays equally deliberate rather than an afterthought. UI elements are drawn with confidence: thick 2.5px borders, pill-shaped buttons, and flat offset shadows that read like panels stacked on a desk, not glass floating above it. The tone is confident, precise, and honest — copy and interface alike are comfortable stating plain facts ("Not advice", "No wallet, ever") rather than dressing up hype.

The one deliberately playful layer is gamification: XP fills, streak flames, and tactile press feedback on buttons. Everything else — color discipline (colorblind-safe blue/orange market state, never red/green), flat construction, and blunt typography — stays serious. This is a practice tool that respects the user's intelligence.

**Key Characteristics:**
- Deep violet-black dark mode as the primary surface, with a fully realized cream/ink light mode as an equal citizen
- Thick, hand-drawn-confident borders (2.5px) on every interactive shape
- Flat, comic-panel offset shadows instead of blurred elevation
- Anton display type (uppercase, italic, condensed) for headlines against a humanist Plus Jakarta Sans body
- IBM Plex Mono reserved for data, labels, and ticker-style content
- Colorblind-safe market state: blue for up, orange for down — never red/green

## Colors

Two flat neutral ramps (ink and paper) anchor the system; violet is the single brand accent, with blue/amber/orange/mint reserved for semantic and data roles.

### Primary
- **Violet** (`--violet-500`, #6c4cf1): The one brand accent — XP fills, primary CTAs on inverse surfaces, brand marks. Used deliberately, not spread across every element.

### Secondary
- **Signal Blue** (`--blue-500`, #2f6fed): Market "up" state and the focus ring color. Never used decoratively — it's reserved for state meaning.
- **Signal Orange** (`--orange-500`, #ff5a1f): Market "down" state and the streak-flame motif. Paired with blue as the colorblind-safe up/down convention — red/green is a hard don't.

### Tertiary
- **Amber** (`--amber-500`, #ffc93c) and **Mint** (`--mint-500`, #2fd9a8): Supporting accent tones for card variants and incidental highlights (badges, secondary data callouts). Used sparingly — not part of the core brand statement.

### Neutral
- **Deep Ink** (`--ink-900`, #0b0b0f): Primary text on light surfaces; the dark-mode-adjacent near-black used for borders and inverse surfaces.
- **Paper** (`--paper-0` / `--paper-50`, #ffffff / #faf8f4): Light-mode page and card background.
- **Chart Room Violet-Black** (dark `--surface-page`, #151022): The dark-mode default surface — not a flat black, a violet-tinted near-black that ties the neutral ramp back to the brand hue.

### Named Rules
**The Never Red/Green Rule.** Market up/down state is always rendered in blue/orange. Red/green is reserved for nothing in this system — it reads as generic finance-app gambling cues, which directly contradicts the "not gambling" brand position.

## Typography

**Display Font:** Anton (with sans-serif fallback)
**Body Font:** Plus Jakarta Sans (with sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono (with monospace fallback)

**Character:** Anton is condensed, uppercase, and italicized wherever `.font-display` is applied — it shouts headlines with confidence. Plus Jakarta Sans carries all body reading with a warm, humanist geometry that keeps long explanations approachable. IBM Plex Mono marks anything data-flavored (prices, tickers, timestamps) as precise and terminal-adjacent, contrasting against the rounder display/body pairing.

### Hierarchy
- **Display** (400, `clamp(48px, 7vw, 120px)`, line-height 1): Hero headlines only. Rendered uppercase + italic via `.font-display`, transform-origin left for entrance animation.
- **Headline** (400, `clamp(32px, 4.5vw, 72px)`, line-height 0.92): Section headers.
- **Title** (700, 32px, line-height 1.15): Card and module titles.
- **Body** (400, 16px, line-height 1.5): Paragraph copy; cap at 65–75ch for readability.
- **Label** (500, 12px, letter-spacing 0.06em, uppercase where used): Tags, captions, mono data labels.

### Named Rules
**The One Display Voice Rule.** Anton is reserved for the `.font-display` treatment (uppercase, italic, tight line-height) — never set in mixed case or without italic, or it loses the shouting quality that makes it legible as "this is a headline, not a UI label."

## Layout

Section containers use a max-width of either `1120px` or `1400px` (Hero and "Why Not Gambling" use the wider 1400px for their more spacious compositions; other sections use 1120px) — inline `maxWidth` per section, not the `--container-max: 1200px` token, which exists but isn't the actual source of truth. New sections should match whichever value their visual neighbors use rather than introducing a third. Spacing follows the 4px-based scale (`--space-1` through `--space-32`), with generous section padding (64–128px) and tighter internal rhythm (12–24px) inside cards and components.

## Elevation & Depth

Flat, graphic, comic-panel depth — not glass or blur. Depth comes from thick borders and hard offset shadows (`--shadow-flat-sm/md/lg`: 2px/4px/6px offset, zero blur, solid color) that read like panels physically stacked on top of each other. One soft ambient shadow token (`--shadow-soft-md`, blurred, low-opacity) exists for rare cases needing genuine lift — it is the exception, not the default. Buttons and icon buttons press down on tap (`whileTap: { y: 1 }` / `scale: 0.92`) rather than lifting on hover, reinforcing the physical, tactile feel over a floating-glass one.

### Shadow Vocabulary
- **Flat Small** (`box-shadow: 2px 2px 0 0 var(--shadow-color)`): Default offset shadow for small interactive elements.
- **Flat Medium** (`box-shadow: 4px 4px 0 0 var(--shadow-color)`): Cards and mid-size components.
- **Flat Large** (`box-shadow: 6px 6px 0 0 var(--shadow-color)`): Hero-level or featured elements.
- **Soft Ambient** (`box-shadow: 0 8px 24px -8px rgba(11, 11, 15, 0.18)`): Rare genuine elevation — use sparingly, not as a default card shadow.

### Named Rules
**The Panel, Not Glass Rule.** Depth is drawn with hard offset shadows and thick borders, never blur or backdrop-filter as a default. If something needs to look "elevated," give it a harder offset shadow or a thicker border before reaching for blur.

## Shapes

Two silhouettes dominate: **pill** (`--radius-pill`, 999px) for every interactive control — buttons, icon buttons, tags — and **soft rectangle** (`--radius-lg` 24px, `--radius-xl` 32px) for cards and containers. Borders are thick by convention (`--border-width-thick`, 2.5px) on every bordered shape; a 1px hairline border exists but is the exception, not the rule. Nothing in the system uses sharp 0px corners — even the flattest card carries at least `--radius-sm` (8px).

## Components

### Buttons
- **Shape:** Pill (`border-radius: 999px`), always with a 2.5px solid border.
- **Primary:** Inverse surface background (`--surface-inverse`) with on-inverse text — the default high-contrast CTA.
- **Accent:** Brand violet background (`--brand-primary`) with a bordered outline in `--border-default` — reserved for the single most important action on a screen (e.g. "Join the waitlist").
- **Secondary / Ghost:** Card-surface or transparent background respectively; ghost keeps a transparent border to preserve layout without visual weight.
- **Press feedback:** `whileTap: { y: 1 }` — buttons physically depress rather than glow or scale up.
- **Disabled:** 45% opacity, `cursor: not-allowed`.

### Tags
- **Style:** Pill-shaped, 13px/600-weight text, either outlined (2px border, transparent background) or filled (`--surface-sunken` background, no border).
- **Padding:** `6px 14px`.

### Cards / Containers
- **Corner Style:** `--radius-lg` (24px) by default; other radii available per context.
- **Background:** Flat tone blocks — paper, inverse, or one of the brand accent colors (blue/violet/amber/mint) at full saturation. No gradients.
- **Shadow Strategy:** Thick border only by default; add a Flat shadow token when a card needs to read as "on top of" its surroundings.
- **Border:** 2.5px solid `--border-default` on every card.
- **Internal Padding:** 24px default, adjustable per instance.

### Icon Buttons
- **Style:** Circular, sized to content (default 40px), same 2.5px border convention as Buttons.
- **Variants:** `outline` (card-surface background) and `solid` (inverse background).
- **Press feedback:** `whileTap: { scale: 0.92 }` — a squeeze rather than a lift.

### Navigation
- Desktop nav links (`.nav-links`) hide below 900px in favor of a mobile pattern; uses CSS media queries natively rather than a JS resize listener.

## Do's and Don'ts

### Do:
- **Do** use blue/orange exclusively for market up/down state — never red/green.
- **Do** keep borders thick (2.5px) on every interactive and card element; a thin border reads as an error state, not a stylistic choice.
- **Do** use flat offset shadows (no blur) as the default elevation language; reserve the soft ambient shadow for rare genuine lift.
- **Do** reserve Anton/`.font-display` for headline-scale text, always uppercase + italic — never body copy.
- **Do** respect `prefers-reduced-motion` — already enforced globally in `globals.css` (disables all `animation`/`transition`).
- **Do** match section container width (1120px or 1400px) to whichever neighboring sections already use, rather than introducing a third value.

### Don't:
- **Don't** introduce gradients, especially gradient text — flat saturated tone blocks only.
- **Don't** use glassmorphism or backdrop-filter as a default elevation strategy — this system is flat and graphic, not glass.
- **Don't** use casino/gambling visual cues (spinning wheels, jackpot flourishes, coin/chip imagery) — directly contradicts the "not gambling" brand position.
- **Don't** set Anton in mixed case or without italic — it loses its shouting headline quality.
- **Don't** reference `--font-display-raw` / `--font-sans-raw` / `--font-mono-raw` directly in new code — always use the re-exposed `--font-display` / `--font-sans` / `--font-mono`.
