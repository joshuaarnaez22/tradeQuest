# TradeQuest v1 — Tech Stack

> Scope: whatever [PRD-v1.md](docs/planning/PRD-v1.md) needs and nothing else. UI implementation deferred (Claude design pass later) — this covers framework, data, auth, AI, jobs, and caching.

## Summary

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** on **Vercel** | Fluid Compute by default — full Node.js, no cold-start penalty, no reason to reach for Edge runtime |
| Database | **Neon Postgres** (`@neondatabase/serverless`) via Vercel Marketplace | Serverless Postgres, auto-provisioned env vars, scales to zero — you don't pay for idle at this stage |
| ORM | **Drizzle** | Thin wrapper, no generated binary engine — faster cold starts than Prisma, matters on serverless |
| Auth | **Clerk** via Vercel Marketplace | Email + Google out of the box with prebuilt `<SignIn />` — this is the entire v1 auth requirement, no custom flow to write |
| AI | **AI SDK** (`ai` package) + **Vercel AI Gateway** | One `generateText` call per graded puzzle for the 1-2 sentence explanation. Not an agent — don't reach for `ToolLoopAgent` for a single classification call |
| Charts | **lightweight-charts** (TradingView OSS) | Purpose-built for candlestick rendering and replay — building this on raw canvas/D3 would be reinventing a solved, free library |
| Email | **Resend** via Vercel Marketplace | Transactional email for the one job that needs it: streak-break reminders |
| Rate limiting | **Upstash Redis** (`@upstash/ratelimit`) via Vercel Marketplace | The one caching need that's a real trust-boundary issue: the AI explanation endpoint is public and calls a paid model, cap it |
| Jobs | **Vercel Cron** (`vercel.ts`) | One scheduled job (streak reminders). Native platform feature — no queue product needed at this scale |

## What each piece is actually for

**Database (Neon + Drizzle)**
Tables: `users`, `puzzles` (the 100 hand-authored setups + cached OHLCV candles), `attempts` (user, puzzle, decision, grade, timestamp), `streaks`/`xp` (or just derive from `attempts` — don't build a separate mutable counter table until you've measured that querying `attempts` is too slow). Candle data for the 100 puzzles is seeded once via a script, not fetched live — see "What's not included" below.

**Auth (Clerk)**
Handles email + Google login, session management, and the sign-in UI. Nothing custom to write here — nail this down first since every other feature sits behind it.

**AI (AI SDK + Gateway)**
Single server action: given a puzzle's outcome and the user's decision, return a 1-2 sentence explanation. Use a gateway model string (e.g. `"anthropic/claude-sonnet-4-5"` — verify the current ID via the gateway's `/v1/models` before hardcoding). No memory, no tools, no multi-turn chat — the PRD explicitly excludes "AI chat" from v1.

**Charts (lightweight-charts)**
Renders the candle replay and reveals candles one at a time by slicing the data array client-side. No server involvement in the replay mechanic itself.

**Rate limiting (Upstash)**
Wrap the AI explanation route: `Ratelimit.slidingWindow(N, '1 m')` per user. This is the one piece of infra added ahead of strict necessity, because an unmetered public endpoint in front of a billed LLM call is a cost/abuse risk, not a nice-to-have.

**Cron (Vercel Cron)**
One job: find users whose streak expires today, send a reminder via Resend. Run it **hourly**, not daily, with a `last_reminder_sent` date column so already-emailed users are skipped. A crash halfway through the user list then self-heals on the next tick — that's retry and idempotency for one column and one `WHERE` clause, no job runner required.

"Today's puzzle" itself needs no job — it's `puzzles[dayOfYear % 100]`, computed on request.

## What's deliberately NOT included (and when to add it)

| Skipped | Add when |
|---|---|
| Vercel Queues / any queue product | You have background work that can fail and needs retries/ordering — v1 has none. One cron job doesn't need a queue in front of it. |
| **Inngest** (evaluated, deferred) | You hit any of: 3+ distinct job types, a job needing **durable sleep** ("nudge after 3 days inactive"), or a multi-step pipeline where partial failure is expensive to redo. The realistic trigger is **AI puzzle/campaign generation** (v2+) — re-running a failed batch means re-paying for tokens, which is exactly what step-level retries protect. Until then Inngest buys retries you already get from an hourly cron + a sent-date column, at the cost of a new service, account, and webhook endpoint. |
| Vercel Blob | You add avatars, campaign images, or user-uploaded screenshots (journal feature, deferred to v2+) |
| Realtime/websockets | Multiplayer/leaderboard-live-updates ship — v1 leaderboard can just be a polled/revalidated query |
| Edge Config | You add feature flags — not needed to ship the core loop |
| A live market-data feed (CoinGecko/Binance API at runtime) | v1's 100 puzzles are historical and curated — fetch each once via a seed script, store the candles in Postgres. A live-data dependency would be a runtime failure point for data you don't actually need live. |
| Vector DB / RAG | Any "search past puzzles" or knowledge-base AI feature — not in v1 |

## Bootstrap order

```bash
npm i -g vercel   # not installed yet — needed for the steps below
vercel link
vercel integration add neon
vercel integration add clerk
vercel integration add upstash
vercel integration add resend
npm install ai drizzle-orm @neondatabase/serverless
vercel env pull --yes
```

Charting and Clerk's React SDK (`@clerk/nextjs`, `lightweight-charts`) get installed when UI work starts.
