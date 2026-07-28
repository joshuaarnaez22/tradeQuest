# TradeQuest — Backlog Status

> Last updated: 2026-07-28. Tracks everything from [PRD-vision.md](PRD-vision.md) that isn't built, plus the *reason* it isn't, so the "why" survives past whoever wrote it. PRD-v1.md §4 already covers 9 items with unlock conditions — reproduced here alongside the rest of the vision doc for one place to check.

## v1 itself isn't finished — this blocks everything below

Per [PRD-v1.md](PRD-v1.md) §10 and its own philosophy ("if it's not in §3, it's not being built yet"), nothing in the vision-doc backlog should be started before v1 ships and produces real D7 retention data (§6). Right now:

| Item | Status | Reason |
|---|---|---|
| 100-puzzle content library (§7, Phase 10) | ✅ 100/100 real puzzles seeded (2026-07-28) | Data provider: Binance public API (free, no key, real hourly OHLCV) — picked over CoinGecko's free tier because that tier is daily-only and PRD-v1 needs 1H candles. Binance's ToS bans profiting from the data (ads/fees); fine for v1 (free, no ads), **must revisit before monetizing**. 16 hand-picked named events + 84 systematically-discovered real setups across 8 top-volume symbols — see [HANDOFF.md](../HANDOFF.md) for the split. |
| Streak-reminder emails (Phase 8) | Stubbed, returns 501 | Blocked on a Resend domain the user actually owns/controls DNS for. Deprioritized by user 2026-07-28 — revisit when ready. |
| Cron cadence (Phase 8) | Not started | Depends on Vercel plan tier (Hobby = daily, Pro = hourly). Deprioritized by user 2026-07-28. |
| Deploy verification pass (Phase 11) | 🟡 Local done (2026-07-28) | Signed in, solved a real seeded puzzle, correct grade + AI explanation, XP/streak/leaderboard all confirmed in-browser. `tsc --noEmit` + `eslint src` clean. Verifying against a real Vercel deployment (not just `next dev`) still open — cron in particular only runs on a real deployment. |

**So: the real "next step" isn't anything from PRD-vision.md — it's the rows above: more puzzle content, Resend/cron (on hold), and a real deploy verification pass.**

**Update, 2026-07-28, later the same day:** the user overrode this gate on their own judgment — v1 felt too thin (one puzzle a day, no real learning, bare-bones dashboard/leaderboard) to wait on retention data that can't exist yet anyway without a launch. See [V2-PLAN.md](../v2/V2-PLAN.md) for the four pillars picked from the vision doc below, and [LEARNING-PROGRESSION-SPEC.md](../v2/LEARNING-PROGRESSION-SPEC.md) for the first one's detailed design. The gate reasoning below is kept as-is since it's still the right *default* — this was a deliberate, informed exception, not a reason to drop the default for future decisions.

## Deferred by design (PRD-v1.md §4 — reproduced for reference)

| Deferred | Unlock condition |
|---|---|
| Stocks / forex / commodities | Crypto loop hits retention target (§6) — new asset class = new data licensing deal |
| Historical Campaigns | Core loop retains; campaigns are a content investment, not a mechanic risk |
| Chart drawing tools (trendlines, FVG, order blocks, Fibonacci) | Users ask for it / puzzle format feels shallow after weeks of data |
| Multiplayer, guilds, tournaments | Have a retained cohort worth competing inside |
| Trading Journal | Build once users have enough history to journal |
| Marketplace, instructor tools, admin CMS builder | Only matters at scale we don't have yet |
| Native mobile app | Web retention proves the loop first |
| Paid tiers | Needs a wedge feature first (§8) |
| AI Quiz/Chart/Campaign generators | Only once hand-authored puzzles show what "good" looks like (§7) |

## Everything else in PRD-vision.md — out of v1 scope entirely

Grouped by the vision doc's own section headers. Default reason unless noted: **unscoped — not in PRD-v1 §3's build table, gated behind D7 retention data (§6) that doesn't exist yet.**

| Vision-doc section | Reason it's not built |
|---|---|
| Core Learning System (lessons, quizzes, videos, flashcards, cheat sheets, glossary, exams) | Explicitly excluded — PRD-v1 §5: "No lesson library, no glossary, no flashcards in v1 — the puzzle *is* the lesson." |
| Chart Questions (multiple choice, T/F, fill-blank, drag&drop, sequencing) | Puzzle format is fixed to Buy/Sell/Wait only (§3) |
| Chart Interaction (trendlines, S/R, supply/demand, FVG, order blocks, Fibonacci) | Explicitly deferred (§4) |
| Chart Puzzle Library breadth (ICT/SMC, scalping, day trading, forex, stocks, commodities) | Asset class fixed to crypto only (§3); other categories unscoped |
| Historical Campaigns | Explicitly deferred (§4) |
| AI Mentor extras (better alternatives, missed opportunities, risk/psychology analysis, confidence score, personalized advice) | Not just deferred — "personalized advice" and confidence scoring are **banned** by the compliance gate (§9), not a someday feature |
| Personalized Learning (weakness/strength tracking, recommendations) | Unscoped, no defer reason given in PRD-v1 — genuine gap, not a deliberate cut |
| Gamification extras (coins, levels, badges, titles, weekly/monthly goals, skill trees, unlockables, avatars, themes) | v1 progression is XP + streak + single leaderboard only — §3: "No skill trees, no ranks, no coins/shop" |
| RPG System (ranks, skill trees, mastery tiers) | Same as above |
| Challenge Types beyond the daily puzzle | Unscoped |
| Multiplayer (friend challenges, guilds, tournaments) | Explicitly deferred (§4) |
| Trading Journal | Explicitly deferred (§4) |
| Progress Tracking extras (risk/psychology/discipline scores, heatmap) | Unscoped — and psychology/confidence scoring should get a compliance re-check (§9) before ever building, not just an engineering pass |
| Rewards beyond XP (coins, cosmetics, certificates, season rewards) | Unscoped |
| Marketplace (community puzzles/campaigns/lessons) | Explicitly deferred (§4) |
| AI Features beyond the 1-line mentor explanation (tutor, chat, generators, journal review, weakness detection, roadmap) | Same logic as the explicit generator deferral (§4, §7) — don't automate what hasn't been hand-authored yet |
| Social Features (profiles, followers, comments, feed, guild chat) | Unscoped |
| Mobile Features (offline, push widget, tablet) | Native app explicitly deferred (§4). Web push/email streak reminder *is* v1-in-spirit (§5) but isn't built yet — see Phase 8 blocker above |
| Instructor Features | Explicitly deferred (§4, "instructor tools") |
| Admin Features (CMS, builders, moderation, feature flags) | Explicitly deferred (§4) |
| Monetization beyond free tier | Explicitly deferred (§4, §8) |
| Analytics (retention/DAU/completion dashboards) | Unscoped — but these are literally the §6 numbers everything else is gated behind, so this should probably be built *before* anything else on this list |
| Accessibility (screen reader, color-blind mode, i18n, captions, reduced motion) | Partially present (11 files already use `aria-*`/`role`/`prefers-reduced-motion`) but never audited against this checklist. Not called out as deferred anywhere in PRD-v1 — silent gap, not a deliberate cut |
| Platforms beyond web (tablet, desktop app) | Native mobile explicitly deferred (§4); tablet/desktop app unscoped |
| Integrations (TradingView, CoinGecko, Binance, Yahoo Finance, news APIs, Discord, Apple/GitHub login) | v1 auth is email + Google only (§3); v1 data is a single OHLCV provider (§3); the rest unscoped |
| Future Ideas (season pass, fantasy trading, AI coach, voice mentor, VR/AR, live classes, certifications, open API, plugins) | Pure long-term backlog, unscoped |

## How to use this

Before starting anything below the first table: check whether real D7 retention data exists yet (§6). If not, don't — that's the whole point of PRD-v1's scoping philosophy. When retention data does exist, this table is the shortlist to re-prioritize from.
