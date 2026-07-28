<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TradeQuest

Marketing/landing page for TradeQuest — replay historical crypto candles, call buy/sell/wait, build a streak. Currently a **frontend-only static page**: no auth, DB, or API wired up yet. Full backend scope (Neon, Drizzle, Clerk, AI SDK, etc.) is planned in [TECH-STACK.md](TECH-STACK.md) but not yet implemented — check there before assuming a piece of infra exists. Product intent lives in [PRD-v1.md](docs/planning/PRD-v1.md) (current scope) and [PRD-vision.md](docs/planning/PRD-vision.md) (long-term backlog).

## Structure

`src/app/page.tsx` composes the whole page from `src/components/*.tsx` section components in order: `Nav`, `Hero`, `Marquee`, `HowItWorks`, `DailyLoop`, `WhyNotGambling`, `Waitlist`, `Footer`. Small reusable pieces (not full sections) live in `src/components/ui/` (`CandleCallBadge`, `XPBar`).

## Styling

No Tailwind/CSS-in-JS library — plain **inline `style={{}}` objects** reading **CSS custom properties** defined in `src/app/globals.css`. That file is organized as commented-out virtual token files (`tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`, `tokens/effects.css`, `tokens/base.css`) — keep new tokens grouped under the matching comment block rather than adding a separate section. Light/dark theme is a `data-theme` attribute (`[data-theme="dark"]` overrides) toggled by state in `page.tsx`, not persisted or synced to system preference.

Fonts (Anton/display, Plus Jakarta Sans/sans, IBM Plex Mono/mono) are loaded via `next/font` in `layout.tsx` into `--font-*-raw` variables, then re-exposed as `--font-display`/`--font-sans`/`--font-mono` with a generic fallback appended — always reference the second set, never the `-raw` ones directly.

Known inconsistency: `--container-max: 1200px` exists as a token but section containers hardcode `maxWidth` inline instead (mostly `1120`, `Hero`/`WhyNotGambling` use `1400`) — match whatever the neighboring sections use rather than introducing a third value.

## Animation

Two systems, used together intentionally — they share easing curves so neither feels out of place next to the other:

- **CSS keyframes** named `tq*` (`tqDraw`, `tqCandle`, `tqRevealIn`, …) defined in `globals.css`. Played either via inline `animation` styles for continuous/looping effects (candle ghost-flicker, marquee scroll), or once-on-scroll via the `<RevealOnScroll animation="tqX 500ms ...">` wrapper (`src/components/RevealOnScroll.tsx`), which uses Motion's `useInView` to trigger a named keyframe rather than hand-rolling an `IntersectionObserver`.
- **Motion** (`motion/react`, the Framer Motion successor — already a dependency, don't add `framer-motion`) for interaction state (`whileHover`/`whileTap`) and mount-in transitions (`initial`/`animate`), mainly in `Hero.tsx`.

Shared easing lives in `src/lib/motion.ts` (`EASE_OUT`, `EASE_BOUNCE`, `LIFT_TRANSITION`) as bezier arrays that numerically match `--ease-out`/`--ease-bounce` in `globals.css` — reuse these constants for new Motion animations instead of re-declaring the bezier inline (`Nav.tsx` currently duplicates one as a local `liftTransition`; prefer the shared one in new code).
