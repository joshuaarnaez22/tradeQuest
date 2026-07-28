# TradeQuest — Session Handoff

> Last updated: 2026-07-28. Written for whoever (human or a fresh Claude session) picks this up next — read this before touching the replay engine or infra.

## TL;DR

The core v1 loop works end to end and is verified against real infra: sign in → solve today's puzzle → grade → AI explanation → XP/streak/leaderboard update. Phases 1–7 of [PRD-v1-IMPLEMENTATION-PLAN.md](PRD-v1-IMPLEMENTATION-PLAN.md) are done. What's left is mostly polish (Phase 7 nav), one deploy-time step (Clerk webhook secret in production), and two decisions only you can make (Resend domain, real OHLCV data provider) — see "Blocked on you" below.

## What's actually live and provisioned

Not mocked, not placeholder — these are real, working, verified this session:

| Service | Status | Notes |
|---|---|---|
| **Neon Postgres** | ✅ Provisioned, schema pushed | `users`/`puzzles`/`attempts` tables live, RLS policies added (see "RLS note" below) |
| **Clerk** | ✅ Provisioned, auth verified in browser | Email + Google sign-in, custom `/sign-in`/`/sign-up` pages (not the hosted Account Portal), webhook syncs `users` row on `user.created`/`user.updated` |
| **Upstash Redis** | ✅ Provisioned | Rate-limits `/api/attempts` at 10 req/min per user (env vars are `KV_*`, not `UPSTASH_REDIS_REST_*` — see `src/lib/ratelimit.ts` for why) |
| **DeepSeek (AI Mentor)** | ✅ Working, tested with a real API call | Not the Vercel AI Gateway — gateway wanted a credit card on file, user has DeepSeek/Mistral keys and wanted to stay free. `@ai-sdk/deepseek`, model `deepseek-chat` |
| **Resend (email)** | ❌ Not provisioned | Needs a domain the user actually owns and controls DNS for — a `.vercel.app` subdomain doesn't work (can't add verification records to it). Phase 8 cron route exists as a stub returning 501 until this is resolved |
| **Vercel project** | ✅ Linked, GitHub-connected | `joshuaarnaez22s-projects/trade-quest`, auto-deploys on push to the connected repo |

Vercel CLI is 58.0.0 — several flags from TECH-STACK.md's original bootstrap commands are stale for this version (`--yes` doesn't exist on `vercel integration add`; use `--non-interactive` instead). Confirmed by running `--help`, not memory.

## Blocked on you

1. **Resend domain.** Pick a domain you actually own (Namecheap, Cloudflare, whatever), give it to me, and Phase 8 (streak-reminder emails) can finish. Until then the cron route is a stub.
2. **Real OHLCV data provider.** Deferred per PRD §9's compliance gate ("license must permit redisplay"). All engineering so far runs against 3 fabricated dev puzzles (`scripts/seed-dev-puzzles.ts`) — Phase 10 (the real 100-puzzle content) can't start until this is picked.
3. **Vercel plan tier.** Determines cron cadence — Hobby caps cron at once/day, Pro allows hourly. Currently defaulted to daily in the plan; confirm if you're on Pro and want it bumped.
4. **Clerk webhook signing secret in production.** Set up locally and tested — but the Clerk Dashboard webhook endpoint pointing at the deployed URL needs the correct path: `https://<your-domain>/api/webhooks/clerk` (not `/webhooks/clerk` — this tripped us up once already). Get the `whsec_...` secret from Clerk's dashboard, run `vercel env add CLERK_WEBHOOK_SIGNING_SECRET production` yourself (keeps it out of chat).

## Phase status (see [PRD-v1-IMPLEMENTATION-PLAN.md](PRD-v1-IMPLEMENTATION-PLAN.md) for full detail)

| Phase | Status |
|---|---|
| 0 — Bootstrap | ✅ Done (Vercel CLI, launch.json, integrations provisioned) |
| 1 — Route skeleton | ✅ Done |
| 2 — DB schema | ✅ Done, pushed to Neon, RLS added |
| 3 — Clerk auth | ✅ Done, verified in browser (redirect gate, custom pages, webhook sync confirmed with a real user row) |
| 4 — Design system port + replay engine | ✅ Done (Card/Button/Badge/Tag/IconButton/StreakFlame ported, `lightweight-charts` wired) |
| 5 — Grading + attempt submission | ✅ Done, verified with a real graded attempt in the DB |
| 6 — AI Mentor explanation | ✅ Done, verified with a real DeepSeek response |
| 7 — Dashboard + leaderboard UI | ✅ Done (nav, streak/XP display, leaderboard with medals) |
| 8 — Streak-reminder cron | ⛔ Blocked on Resend domain (deprioritized by user 2026-07-28) |
| 9 — Compliance verification pass | ✅ Done — grep clean, only correct negations ("not advice") found, disclaimer confirmed on the real puzzle screen |
| 10 — Content production (100 real puzzles) | ✅ Done — 100/100 real puzzles seeded, verified in Neon (orderIndex 0-99). Data provider: Binance public API (free, no key) |
| 11 — Deploy verification | ✅ Local done — signed in, solved a real puzzle, graded correctly, XP/streak/leaderboard all confirmed in-browser. `tsc --noEmit` + `eslint src` clean. Real Vercel deploy verification still open |

## The replay chart — worth understanding before touching it again

`src/components/replay/ReplayChart.tsx` went through several iterations this session chasing real bugs (not perfectionism — each one was a genuine crash or visual defect):

1. **Crash**: `series.update()` per-tick depended on lightweight-charts' internal "last time" state, which didn't survive a chart being recreated mid-sequence (React Strict Mode's dev double-invoke, or an HMR remount of an ancestor). Fixed by switching to `series.setData()` (a full snapshot each tick) instead of incremental `update()`.
2. **Chart resetting your manual drag**: `scrollToRealTime()` was being called on every reveal tick, fighting any manual pan. Removed per-tick auto-scroll — then reintroduced deliberately as a "follow" behavior per a later request, then replaced again with the centering approach below.
3. **Rescale jump on every tick**: each `setData()` call re-triggered the price axis's `autoScale`. Fixed with an invisible `LineSeries` ("range lock") spanning the full known price range, added once — this holds the Y axis steady while the candlestick series grows underneath it.
4. **"Too zoomed in" / giant stretched candle**: an earlier attempt locked the *time* axis to the full range via `setVisibleRange` while only 1-2 real bars existed, so the renderer stretched them to fill the space. Removed that lock.
5. **Current behavior**: history reveals candle-by-candle, kept **centered** in the pane via `setVisibleLogicalRange({from: -margin, to: k-1+margin})` where margin shrinks as more candles arrive (not anchored to an edge). Once revealed, the outcome window reveals the same way, **offset to start only after history's sequence visually finishes** (`historyCandles.length * 70ms` delay) — this was the fix for a flicker bug where an already-decided puzzle (loaded fresh, `revealed=true` from mount) fired both reveal effects concurrently, and they fought over the same series data. The very last tick calls `fitContent()` for a clean edge-to-edge resting frame instead of leftover centering margin.

If this needs more work, read the whole file before changing it — the comments explain *why* each piece exists, and several look redundant until you know what they're preventing.

## RLS note

`src/db/schema.ts` has Row-Level Security policies (Neon + Clerk integration, `authenticatedRole`/`authUid`) added mid-session. The app's own queries run through `getDb()` on what's almost certainly the Neon owner-role connection, which bypasses RLS entirely (standard Postgres behavior) — so this shouldn't change how the app behaves today. It's defense-in-depth for if/when a Neon Data API or direct-from-browser Clerk-JWT-authenticated connection ever gets added, which nothing currently does. Verified this doesn't break anything by directly querying `puzzles` after the schema change (see git history for the `sql is not defined` incident — that was stale Turbopack cache, not a real code issue, fixed by clearing `.next/cache` and restarting).

## Uncommitted work

`git status` shows a lot of modified files not yet committed (the last commit is "Implement replay/dashboard/leaderboard feature set"). Also untracked: `DESIGN.md`, `PRODUCT.md`, `drizzle/`, `.impeccable/`, `src/components/ForceBodyDarkTheme.tsx`. Nobody's asked for a commit covering this round of work yet — don't commit without being asked, per this project's own git-safety norms.

## Puzzles currently seeded

100/100, real data, from `scripts/seed-puzzles.ts`, fully replacing the 3 fabricated ones. Two tiers:

- **orderIndex 0-15**: 16 hand-picked, named historical events (Dec 2017 top, COVID Black Thursday, May 2021 crash, FTX collapse, ETH Merge, DeFi summer, etc.) — each with a setup note describing the real-world event.
- **orderIndex 16-99**: 84 systematically-discovered real setups across 8 symbols (BTC, ETH, SOL, AVAX, BNB, XRP, ADA, DOGE — Binance's other top-volume pairs). A scan script pulled bulk historical klines and locally slid a 24-candle window across them, keeping only "clean" windows (forward return comfortably past the 1% threshold for Buy/Sell, or comfortably flat for Wait) spread at least 25 days apart per symbol/call-type to avoid near-duplicates. Setup notes for this tier are generated from the real observed numbers (e.g. "chopping sideways (+0.95%)... Correct read is Buy — price continues higher... +12.99%") rather than tied to a named news event — still 100% real Binance data, just without a headline attached.

All 100 entries' forward-return/correct-call were verified against live Binance data before commit (script defaults to a dry run; `--commit` writes; upserts by orderIndex). Same 16-history/8-outcome/1% threshold shape throughout. Distribution: 32 Buy / 28 Sell / 24 Wait across the algorithmic tier, roughly even across the 8 symbols.

Data provider: Binance public API, picked because it needs no signup/key and gives free hourly OHLCV (CoinGecko's free tier is daily-only). Binance's ToS bans profiting from this data (ads/fees) — fine for v1 (free, no ads) but **must be revisited before any monetization**, per [docs/BACKLOG-STATUS.md](BACKLOG-STATUS.md).

Discovery/selection scratch scripts aren't checked in (were scratchpad-only) — `scripts/seed-puzzles.ts` itself is the durable artifact and can be re-run or extended.

## Schema change: puzzles.id / attempts.id are now uuid, not serial

Per user request (2026-07-28) — sequential integer PKs replaced with `uuid` (`defaultRandom()`, i.e. `gen_random_uuid()`), for both `puzzles.id` and `attempts.id` (`attempts.puzzle_id` FK follows). `users.id` untouched (already Clerk's external string ID, never sequential).

Migration is `drizzle/0001_special_paibok.sql`. Since `int -> uuid` isn't a valid Postgres cast, and this project's data was 100 seeded puzzles + one test attempt (all disposable), the migration **wipes both tables** (`DELETE FROM attempts; DELETE FROM puzzles;`) rather than attempting an in-place data-preserving conversion. Puzzles were immediately reseeded via `scripts/seed-puzzles.ts --commit` after.

Note: this project's `drizzle.__drizzle_migrations` tracking table is empty — schema was evidently synced via `drizzle-kit push` originally, not `migrate`, even though migration files exist in `drizzle/`. `npx drizzle-kit migrate` failed on this migration (Postgres error: "default for column can't be cast automatically to uuid" — the generated SQL was missing `ALTER COLUMN ... DROP DEFAULT` before the type change; fixed by hand in the migration file). Applied by running the corrected SQL directly against `DATABASE_URL_UNPOOLED`, not via the CLI, after the CLI's partial failure had already left the tables empty with the old FK constraint dropped.

Found and fixed a related real bug while re-verifying post-migration: [replay/page.tsx](../src/app/(app)/replay/page.tsx) was re-deriving "today's puzzle" via `dayOfYear % publishedPuzzles.length` even when a cached attempt already existed for today, instead of trusting `existing.puzzleId`. Harmless while the puzzle count never changed, but the moment it does (growing 16→100 puzzles surfaced it), a same-day revisit renders the *new* puzzle's chart next to the *old* cached grade/explanation. Now fixed to look up the puzzle by `existing.puzzleId` when an attempt exists.

## Immediate next steps, roughly in order

1. Confirm Dashboard/Leaderboard render correctly (user was mid-verification when this doc was written).
2. Phase 9 compliance grep pass — cheap, no blockers, can happen anytime.
3. Get the Resend domain decision, finish Phase 8.
4. Get the data-provider decision, start Phase 10 content production in parallel.
5. Set up the production Clerk webhook (needs a deployed URL to point at).
6. Phase 11 full deploy verification pass.
