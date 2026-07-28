# TradeQuest — Session Handoff (single source of truth)

> Last updated: 2026-07-28. Written for whoever (human or a fresh Claude session) picks this up next. Start here — this doc says what's actually true right now and links out to details instead of holding everything itself. See [docs/README.md](README.md) for the full map of every doc in this folder.

## TL;DR

v1 is functionally complete per [PRD-v1.md](planning/PRD-v1.md) §10's literal done-bar: sign in → solve today's puzzle → grade → AI explanation → XP/streak/leaderboard update, verified end to end against real infra with 100 real puzzles. All Phase 0-11 work in [PRD-v1-IMPLEMENTATION-PLAN.md](planning/PRD-v1-IMPLEMENTATION-PLAN.md) is done except a real (non-`next dev`) Vercel deploy verification pass, and Phase 8 (streak-reminder cron) which is on hold by user choice. All code through 2026-07-28 is committed and pushed to `origin/main` — nothing outstanding.

Work has since moved on to a v2 roadmap — see [V2-PLAN.md](v2/V2-PLAN.md). Pillar #1 (Learning & Progression) is shipped and verified in the browser: puzzles are tagged by pattern type (breakout/trend_continuation/reversal/range), and a struggling player sees a skippable lesson before their next puzzle of that type. See [LEARNING-PROGRESSION-SPEC.md](v2/LEARNING-PROGRESSION-SPEC.md) for the design.

## What's actually live and provisioned

Not mocked, not placeholder — these are real, working, verified:

| Service | Status | Notes |
|---|---|---|
| **Neon Postgres** | ✅ Provisioned, schema pushed | `users`/`puzzles`/`attempts` tables live, RLS policies added — see [REFERENCE-DATABASE.md](reference/REFERENCE-DATABASE.md) |
| **Clerk** | ✅ Provisioned, auth verified in browser | Email + Google sign-in, custom `/sign-in`/`/sign-up` pages (not the hosted Account Portal), webhook syncs `users` row on `user.created`/`user.updated`. Production webhook signing secret is set up (confirmed by user) |
| **Upstash Redis** | ✅ Provisioned | Rate-limits `/api/attempts` at 10 req/min per user (env vars are `KV_*`, not `UPSTASH_REDIS_REST_*` — see `src/lib/ratelimit.ts` for why) |
| **DeepSeek (AI Mentor)** | ✅ Working, tested with a real API call | Not the Vercel AI Gateway — gateway wanted a credit card on file, user has DeepSeek/Mistral keys and wanted to stay free. `@ai-sdk/deepseek`, model `deepseek-chat` |
| **Binance (puzzle data)** | ✅ Working | Public API, no key needed. See [REFERENCE-PUZZLE-CONTENT.md](reference/REFERENCE-PUZZLE-CONTENT.md) |
| **Resend (email)** | ❌ Not provisioned, on hold | Needs a domain the user actually owns and controls DNS for — a `.vercel.app` subdomain doesn't work (can't add verification records to it). Phase 8 cron route exists as a stub returning 501. Deprioritized by user 2026-07-28 |
| **Vercel project** | ✅ Linked, GitHub-connected | `joshuaarnaez22s-projects/trade-quest`, auto-deploys on push to the connected repo. Plan tier (Hobby vs Pro) still unconfirmed — deprioritized by user 2026-07-28, only matters for cron cadence |

Vercel CLI is 58.0.0 — several flags from TECH-STACK.md's original bootstrap commands are stale for this version (`--yes` doesn't exist on `vercel integration add`; use `--non-interactive` instead). Confirmed by running `--help`, not memory.

## Blocked on you

Only two things left, both on hold by your own choice, not urgent:

1. **Resend domain.** Pick a domain you actually own, give it to me, and Phase 8 (streak-reminder emails) can finish.
2. **Vercel plan tier.** Determines cron cadence (Hobby = daily, Pro = hourly) once Phase 8 unblocks.

Everything else that used to be blocked (data provider, production Clerk webhook) is resolved — see the table above.

## Phase status (see [PRD-v1-IMPLEMENTATION-PLAN.md](planning/PRD-v1-IMPLEMENTATION-PLAN.md) for full detail)

| Phase | Status |
|---|---|
| 0 — Bootstrap | ✅ Done |
| 1 — Route skeleton | ✅ Done |
| 2 — DB schema | ✅ Done, pushed to Neon, RLS added |
| 3 — Clerk auth | ✅ Done, verified in browser |
| 4 — Design system port + replay engine | ✅ Done |
| 5 — Grading + attempt submission | ✅ Done, verified with a real graded attempt in the DB |
| 6 — AI Mentor explanation | ✅ Done, verified with a real DeepSeek response |
| 7 — Dashboard + leaderboard UI | ✅ Done |
| 8 — Streak-reminder cron | ⛔ On hold — blocked on Resend domain, deprioritized by user |
| 9 — Compliance verification pass | ✅ Done |
| 10 — Content production (100 real puzzles) | ✅ Done — see [REFERENCE-PUZZLE-CONTENT.md](reference/REFERENCE-PUZZLE-CONTENT.md) |
| 11 — Deploy verification | 🟡 Local done, real Vercel deployment check still open |

## Reference docs (details that don't need to live in this file)

- [REFERENCE-REPLAY-CHART.md](reference/REFERENCE-REPLAY-CHART.md) — why the chart is built the way it is; read before touching `ReplayChart.tsx` again
- [REFERENCE-DATABASE.md](reference/REFERENCE-DATABASE.md) — RLS policies, the serial→uuid migration, a related bug it surfaced
- [REFERENCE-PUZZLE-CONTENT.md](reference/REFERENCE-PUZZLE-CONTENT.md) — how the 100 real puzzles were sourced and picked

## Immediate next steps, roughly in order

1. V2 pillar #2 (Deeper Gamification) — see [V2-PLAN.md](v2/V2-PLAN.md) for what it is; not yet spec'd in detail.
2. Whenever you're ready: Resend domain + Vercel plan tier decisions to unblock Phase 8.
3. A real Vercel deploy verification pass (Phase 11's last piece — cron specifically can't be verified under `next dev`).
