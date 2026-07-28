# Product

## Register

brand

## Users

Retail-curious learners who want to get better at reading crypto candlestick charts without risking money or getting sold a "trading advice" product. They land on the marketing site cold (ad, social, word of mouth), and the job to be done is: *convince me this is a legitimate, honest practice tool, not a gambling or signals product, in the time it takes to scroll one page.* Five-minute daily habit, not a trading platform.

## Product Purpose

TradeQuest is "Duolingo for reading candlestick charts" — daily historical-replay puzzles graded on decision quality (Buy/Sell/Wait), not profit. The marketing site's job is to sell the loop (replay → decide → learn → streak) and pre-empt the two objections everyone will have on sight: *is this gambling?* and *is this financial advice?* Success looks like a visitor understanding the loop and joining the waitlist within one scroll-through, already primed for the "not gambling" framing before they hit that section.

## Brand Personality

Confident, precise, honest. Copy is blunt and declarative ("Straight answer", "It already happened", "No wallet, ever", "Not advice") — it reads like the product is comfortable enough to just tell you the truth rather than hype you. Gamification (streaks, XP, daily loop) is the one deliberately warm/playful layer on top of an otherwise serious, disciplined tone — never juvenile, never hypey.

## Anti-references

- Crypto-bro hype aesthetics: rockets, neon-green pump arrows, moon/lambo imagery, urgency copy ("don't miss out")
- Generic navy-and-gold SaaS-fintech dashboard look — the templated "trust us, we're finance" cliché
- Casino/slot-machine gamification cues (spinning wheels, jackpot flourishes, chip/coin imagery) — directly contradicts the "not gambling" positioning that's core to the product

## Design Principles

1. **Show, don't hype.** Every claim of honesty ("simulated data", "not advice") is stated plainly in copy and reinforced visually — no fine print, no burying disclaimers.
2. **Discipline over dopamine.** Gamification rewards patient, well-read calls (including Wait) — motion and color should never make a wrong-but-fast call feel better than a right-but-slow one.
3. **Colorblind-safe by convention.** Up/down market state uses blue/orange, never red/green — already encoded in `globals.css` tokens (`--market-up`, `--market-down`); preserve this in all new work.
4. **One loop, no clutter.** The page/product exists to sell and support a single loop (replay → decide → learn → streak). Resist adding visual complexity that doesn't serve that loop.
5. **Dark-first, light-honest.** The design comp and current tokens default to a dark, focused "chart-room" surface (`--surface-page: #151022`) with a maintained light-mode override — both must stay production-quality, not light-mode-as-afterthought.

## Accessibility & Inclusion

WCAG AA minimum. Colorblind-safe candle/market-state colors (blue/orange, never red/green) are a hard requirement, not a nice-to-have — already reflected in `globals.css`. Respect `prefers-reduced-motion` for the `tq*` keyframe and Motion-driven animations already in use.
