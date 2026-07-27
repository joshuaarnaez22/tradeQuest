# TradeQuest v1 — Implementation Plan

## Context

[PRD-v1.md](../PRD-v1.md) and [TECH-STACK.md](../TECH-STACK.md) define what to build and what stack to build it on, but the repo currently contains **only the marketing landing page** — no auth, no database, no puzzle engine, nothing under `src/app/` besides the root layout and the landing page itself. This plan is the bridge from "PRD + stack decision" to a working v1: sign up → solve today's puzzle → get graded with a one-line AI explanation → watch XP/streak update → come back tomorrow, per PRD §10's literal "done" bar.

Two things shape how this plan is sequenced rather than just listed as tasks:
1. **Real blocking dependencies exist.** Auth needs a DB table to sync into; the replay screen needs ported design-system components; the AI explanation needs the grading logic it explains. Phases are ordered by what unblocks what, not by guesswork.
2. **Two things are explicitly deferred, on confirmation**, rather than defaulted silently (per PRD §9's compliance gate): the historical OHLCV data provider, and the cron cadence (Hobby vs. Pro Vercel plan). Both are noted inline below with what unblocks them.

This plan was produced with a Plan agent that verified several Next.js 16 API changes directly against this project's own `node_modules/next/dist/docs/` (per this repo's own AGENTS.md instruction to do so) rather than trusting training-data memory — notably that `middleware.ts` is renamed to `proxy.ts` in Next 16, and that Vercel Cron is configured via `vercel.json`, not `vercel.ts` (TECH-STACK.md's reference to `vercel.ts` is for general project config, not crons specifically). Both were independently re-verified before writing this plan.

## Decisions resolved for this pass

- **Data provider: deferred.** Phases 1–9 (all engineering) build and test against 3–5 fabricated dev-only puzzles (Phase 4). The real provider decision — gated by PRD §9's "license must permit redisplay" requirement — only blocks Phase 10 (real content seeding). Revisit before Phase 10 starts.
- **Cron cadence: defaults to daily.** Since the Vercel plan tier is unconfirmed, Phase 8's streak-reminder cron ships as a once-daily job (works on any plan tier). Bump to hourly later if/when the project is confirmed on Pro — it's a one-line schedule change in `vercel.json`, not a re-architecture.

## Phase 0 — Bootstrap (mostly human, partly non-blocking)

**Human-blocking (cannot be scripted end-to-end — needs you at the keyboard for OAuth/dashboard steps):**
- `npm i -g vercel`, `vercel link`, then `vercel integration add neon --yes`, `vercel integration add clerk --yes`, `vercel integration add upstash --yes`, `vercel integration add resend --yes`. Some integrations are "connectable" and hand off to a dashboard step (`vercel integration open <name>`) rather than completing fully via CLI — expect to click through each once.
- `vercel env pull --yes` once all four are provisioned, to get env vars locally.

**Non-blocking, can happen anytime:**
- Fix `.claude/launch.json` to add a real `runtimeExecutable`/`runtimeArgs` (`npm`, `["run", "dev"]`, `autoPort: true`) so the preview tool can start its own dev server instead of depending on a stray leftover process.
- `npm install ai drizzle-orm @neondatabase/serverless` once Neon is provisioned.
- At build time (not now): confirm the live AI Gateway model ID via `gateway.getAvailableModels()` rather than hardcoding a slug from memory (per this project's `ai-sdk` skill guidance) — store the chosen slug as `AI_MENTOR_MODEL` env var.

## Phase 1 — Route architecture skeleton

No auth, no DB yet — pure scaffolding so later phases have a place to land.

```
src/app/
  page.tsx, layout.tsx              # marketing landing — UNTOUCHED
  (app)/
    layout.tsx                      # authed shell: Nav (Replay/Dashboard/Leaderboard)
    replay/page.tsx                 # today's puzzle — post-signup landing screen
    dashboard/page.tsx
    leaderboard/page.tsx
  sign-in/[[...sign-in]]/page.tsx   # Clerk catch-all, public
  sign-up/[[...sign-up]]/page.tsx
  api/
    attempts/route.ts               # grade + persist + AI explanation
    webhooks/clerk/route.ts
    cron/streak-reminders/route.ts
proxy.ts                            # NOT middleware.ts — Next 16 rename, verified
vercel.json                         # crons array — NOT vercel.ts
```

The `(app)` route group keeps the marketing page's `"use client"` + local theme state fully isolated from the authed shell — they share only the CSS token layer in `globals.css`. `proxy.ts` does optimistic cookie-presence auth checks on `(app)/*` and `/api/attempts` (matcher via `createRouteMatcher`); `/api/cron/*` and `/api/webhooks/clerk` are excluded (secured by `CRON_SECRET` and Clerk's webhook signature respectively, not session cookies). Every server component/action under `(app)/` still calls `auth()` itself — Proxy is the first line, not the only one.

## Phase 2 — Database schema (Drizzle + Neon)

Files: `src/db/schema.ts`, `src/db/index.ts` (lazy `getDb()` accessor — **not** a top-level `neon()` call, which throws at import time before `DATABASE_URL` exists; **not** a JS `Proxy` wrapper either, which breaks Clerk's adapter introspection), `drizzle.config.ts`.

- **`users`** — Clerk owns identity; this table holds only what Clerk doesn't: `id` (Clerk user ID, PK), `display_name`, `created_at`, `last_reminder_sent_at` (date, nullable — cron idempotency). Populated via `POST /api/webhooks/clerk` on `user.created`/`user.updated`.
- **`puzzles`** — 100 hand-authored rows (seeded once, never mutated by traffic): `id`, `order_index` (unique 0-99, drives `puzzles[dayOfYear % 100]`, decoupled from `id` so puzzles can be reordered without renumbering), `symbol`, `timeframe` (default `'1H'`), `candles` (jsonb array of `{t,open,high,low,close,volume}` — small enough per-puzzle that a normalized table buys nothing), `decision_index`, `outcome_window_candles`, `forward_return_threshold_pct`, `setup_note` (feeds the AI explanation prompt), `is_published`.
- **`attempts`** — `id`, `user_id` FK, `puzzle_id` FK, `decision` (buy/sell/wait), `forward_return_pct`, `is_correct`, `xp_awarded`, `ai_explanation` (nullable, cached so a revisit doesn't re-call the model), `attempt_date` (UTC date), `created_at`.
  **Unique constraint on `(user_id, attempt_date)`, not `(user_id, puzzle_id)`** — `puzzles[dayOfYear % 100]` repeats every 100 days, so the same `puzzle_id` legitimately recurs as "today's puzzle" 3-4x/year. Constraining on `puzzle_id` would permanently lock a user out of that puzzle after their first encounter. `attempt_date` matches the actual product rule: one graded attempt per user per calendar day (UTC, no per-user timezone in v1).
- **Grading is a pure function** (`lib/grading.ts`), not a stored column — computed from `candles[decision_index].close` vs. `candles[decision_index + outcome_window_candles].close` against `forward_return_threshold_pct`, so the threshold can be tuned without re-authoring puzzles.
- **XP and streak are derived, not stored** (per TECH-STACK.md's explicit instruction — don't build a mutable counter table until querying `attempts` measurably doesn't scale): XP = `SUM(xp_awarded) WHERE user_id = $1`; streak = fetch distinct `attempt_date`s descending, walk them in a pure `computeStreak(dates): number` function in `lib/streak.ts` (testable independent of the DB). Leaderboard = `GROUP BY user_id ORDER BY SUM(xp_awarded) DESC LIMIT 50`, cached via route-segment `revalidate = 60` (no realtime, per TECH-STACK.md).

## Phase 3 — Auth wiring (Clerk)

- `npm install @clerk/nextjs`. `<ClerkProvider>` wraps `layout.tsx`.
- `src/proxy.ts` — `clerkMiddleware()` wrapped in the `proxy` export, matcher on `(app)/*` + `/api/attempts`.
- `sign-in`/`sign-up` catch-all routes using Clerk's prebuilt components, styled via the `appearance` prop against existing CSS tokens (no fighting Clerk's default CSS).
- `api/webhooks/clerk/route.ts` — verifies signature (svix headers), upserts `users`.
- Post-sign-up redirect → `/replay` directly, **not** `/dashboard` — PRD §5: "land straight in a puzzle, no onboarding wall."
- Auth pattern everywhere under `(app)/` and in `/api/attempts`: `const { userId } = await auth(); if (!userId) redirect("/sign-in")` (async form — no sync `auth()` left in current Clerk).

## Phase 4 — Design system port + replay engine

Port `Card`, `Button`, `Badge`, `Tag`, `IconButton` (`components/core/`) and `StreakFlame` (`components/gamification/`) from the Claude Design project (project ID `940dde76-c05f-4f2c-87c9-174b2398896e`) using the same process already used for `src/components/ui/CandleCallBadge.tsx` and `XPBar.tsx`: fetch the `.jsx` source, translate to typed TSX against `globals.css`'s existing custom properties. No Tailwind, no new styling system.

Seed **3-5 fabricated dev-only puzzles** (`scripts/seed-dev-puzzles.ts`) so Phase 4-9 aren't blocked on the deferred data-provider decision — replaced once Phase 10's real seed script runs.

- `npm install lightweight-charts`.
- `src/app/(app)/replay/page.tsx` — resolves today's puzzle via `lib/puzzle-of-day.ts` (`puzzles[dayOfYear % 100]`, pure function on UTC day-of-year), checks for an existing today's-attempt row (if present, renders the already-graded state — this is also the "come back tomorrow" prompt from PRD §5).
- `src/components/replay/ReplayChart.tsx` (client) — wraps `lightweight-charts`, slices `puzzle.candles` client-side for the reveal-one-candle-at-a-time mechanic. No server involvement in the reveal itself — the full array ships with the page.
- `src/components/replay/DecisionControls.tsx` — Buy/Sell/Wait, enabled at `decision_index`.
- A permanent, reused disclaimer component for PRD §9's "label this on every puzzle screen" requirement.

## Phase 5 — Grading + attempt submission

- `lib/grading.ts` (Phase 2's pure function) — unit-testable independent of DB/AI.
- `POST /api/attempts` — re-derives `userId` server-side (never trusts a client-supplied ID), checks for an existing today's-attempt first (idempotent — duplicate submits return the cached result, never double-grant XP), grades, inserts.
- XP award = flat constant in `lib/xp.ts` (PRD doesn't specify a formula) — one-line change later, not a migration.

## Phase 6 — AI Mentor explanation

Lives inside `/api/attempts`, not a separate endpoint or server action — TECH-STACK.md's own framing ("the AI explanation endpoint is public... cap it") describes the route-handler idiom, and folding it into the same request means the existing-attempt check runs **before** the model is ever called (without that ordering, rapid duplicate submits could trigger duplicate paid calls before the DB uniqueness constraint gets a chance to reject them).

1. `auth()` check.
2. Upstash `Ratelimit.slidingWindow` keyed on `userId` (~10 req/min) — reject with 429 before touching DB or model.
3. Existing-attempt check → return cached `ai_explanation` if present.
4. Grade (Phase 5).
5. `generateText({ model: process.env.AI_MENTOR_MODEL, prompt })` via the `ai` package — single call, no tools, no memory, no multi-turn.
6. **Compliance guardrail in the prompt itself**: explicit system instruction never to use the word "advice," never phrase output as personalized guidance/confidence scores/psychology commentary — this is a system-prompt constraint, not a post-hoc filter, per PRD §9. A cheap regex check on the returned text for "advice" as a second safety net.
7. Store on the `attempts` row (caching), return `{isCorrect, forwardReturnPct, explanation, xpAwarded}`.

`npm install ai @ai-sdk/gateway @upstash/ratelimit @upstash/redis`.

## Phase 7 — Dashboard + leaderboard UI

- `(app)/dashboard/page.tsx` — server component using Phase 2's derivation functions, renders `StreakFlame` + `XPBar` + a recent-sessions list (`CandleCallBadge` per row).
- `(app)/leaderboard/page.tsx` — the `GROUP BY`/`revalidate=60` query.
- `(app)/layout.tsx` — Nav with Replay/Dashboard/Leaderboard tabs (Phase 4's ported components).

## Phase 8 — Streak-break reminders (cron + email)

- `npm install resend`.
- `vercel.json` `crons` array → `/api/cron/streak-reminders`, **daily** cadence (see "Decisions resolved" above).
- Route validates `Authorization: Bearer $CRON_SECRET`, queries users whose streak is about to lapse and `last_reminder_sent_at` isn't already today, sends via Resend, updates the column. Idempotent by construction — a crash mid-run self-heals on the next tick, no queue product needed.

## Phase 9 — Compliance verification pass

Audit, not new code — PRD §9 non-negotiables are easy to violate incrementally across Phases 4-8's UI copy:
- Repo-wide grep for the literal word "advice" across all user-facing copy, the AI system prompt, and email templates.
- Confirm the simulated-data disclaimer renders on every puzzle state (fresh, already-completed-today, empty).
- Confirm any new up/down UI stays on the existing colorblind-safe `--market-up`/`--market-down` tokens, never an ad hoc red/green pair.

## Phase 10 — Content production (100 puzzles) — parallel track

Not auto-generated (PRD §7 is explicit this needs a human owner/deadline). Runs in parallel with Phases 3-9, blocked only on the deferred data-provider decision.

`scripts/seed-puzzles.ts` takes hand-authored `{symbol, startTimestamp, decisionIndex, outcomeWindow, thresholdPct, setupNote}` entries, fetches the OHLCV window once per puzzle from the chosen provider, previews the computed `correct_call` so the author can sanity-check before committing, writes to `puzzles`.

## Phase 11 — "Done bar" verification + deploy

- Manual walk of PRD §10's literal bar: sign up → solve today's puzzle → correct/incorrect grade + explanation → streak/XP update → return tomorrow with zero manual DB work.
- Confirm the cron actually fires against a real Vercel deployment — cron jobs don't run under `next dev`.
- Confirm `vercel env pull --yes` reflects all four Marketplace integrations before first production deploy.

## Explicitly out of scope (PRD §4)

Multiplayer/guilds/tournaments, historical campaigns, chart-drawing tools, trading journal, marketplace/instructor/admin tools, native app, paid tiers, AI content generators, non-crypto assets, non-1H timeframes, skill trees/ranks/shop, realtime leaderboard, any queue product, Vercel Blob, Edge Config, live/runtime market-data feed. If implementation tempts toward any of these, stop and check PRD §4's unlock condition first.

## Critical files

- [PRD-v1.md](../PRD-v1.md), [TECH-STACK.md](../TECH-STACK.md)
- [src/app/globals.css](../src/app/globals.css) — design tokens, reuse as-is
- [src/app/layout.tsx](../src/app/layout.tsx), [src/app/page.tsx](../src/app/page.tsx) — untouched by this plan
- [src/components/ui/CandleCallBadge.tsx](../src/components/ui/CandleCallBadge.tsx), [XPBar.tsx](../src/components/ui/XPBar.tsx) — pattern to replicate for the rest of the design-system port
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — source of truth for Next 16 API changes (proxy.ts, async dynamic APIs) referenced throughout

## Verification

- After Phase 1-3: `npm run dev`, sign up with a test account, confirm redirect to `/replay` and a `users` row appears in Neon.
- After Phase 4-5: solve a dev-seeded puzzle end to end, confirm an `attempts` row is written with the correct grade and a duplicate submit doesn't double-grant XP.
- After Phase 6: confirm the AI explanation returns, is cached on revisit (no second model call — check via Upstash/Gateway logs), and never contains the word "advice."
- After Phase 7: confirm XP/streak/leaderboard numbers match a hand-computed expectation from the `attempts` rows seeded so far.
- After Phase 8: trigger the cron route handler manually with the correct `CRON_SECRET` header, confirm it emails only users who should be reminded and sets `last_reminder_sent_at`.
- After Phase 11: full PRD §10 walk-through against a real Vercel preview deployment, plus `npx tsc --noEmit` and `npx eslint src` clean (matching this repo's existing verification pattern from the landing-page build).
