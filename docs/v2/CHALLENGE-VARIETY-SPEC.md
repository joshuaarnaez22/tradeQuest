# Challenge Variety — Design Spec (v2 pillar #3)

> Status: ✅ shipped 2026-08-01. See [V2-PLAN.md](V2-PLAN.md) for how this fits the wider roadmap.

## Goal

The only reason to open the app today is "today's one puzzle." This adds three challenge modes on shared plumbing so players have a reason to come back later in the day and a way to work on specific weaknesses — without diluting the daily habit loop.

## Scoring model

| | Daily | Challenge modes (`mistake` / `speed` / `weekly`) |
|---|---|---|
| Grade + AI explanation | yes | yes |
| XP (same 15 / 5 / 0 rules) | yes | yes (with anti-farm caps below) |
| Streak | yes | no |
| Weekly/monthly goal bars | yes | no |
| Volume / accuracy badges (`solved_*`, `first_correct`) | yes | yes |
| Streak badges / `perfect_week` / goal badges | daily attempts only | n/a |

Daily remains the streak/habit anchor. Challenge play still feeds XP and volume badges.

### Anti-farm

- **Mistake replay** — only puzzles with at least one incorrect *daily* attempt. XP once per puzzle on the first *correct* mistake-mode attempt; further retries grade normally but award 0 XP.
- **Weekly** — exactly 5 puzzles per ISO week (deterministic). One graded attempt per puzzle per week.
- **Speed** — hard cap **3 runs per UTC day**. Timeout (no decision in 30s) grades as incorrect with 0 XP.

## The three modes

1. **Replay Mistakes** — queue of distinct puzzles the user got wrong on a daily. Correct practice removes them from the active queue (they already have a correct mistake attempt); wrong keeps them in.
2. **Speed Mode** — random published puzzle. If today's daily is still unsolved, exclude it (no spoilers). Candles auto-advance at ~2×; once history finishes, a **30s decision timer** starts. Same Buy/Sell/Wait.
3. **Weekly Challenge** — 5 puzzles for the ISO week via `weeklyPuzzles(weekId, published[])` (stable shuffle seeded by week id). Hub shows `n/5`. Completing all 5 unlocks permanent badge `first_weekly_challenge` the first time ever.

## Data model

`attempts` gains:

- `mode` — `daily | mistake | speed | weekly` (default `daily`; existing rows backfilled)
- `period_key` — nullable text; ISO week `YYYY-Www` for weekly rows

Constraints:

- Partial unique `(user_id, attempt_date) WHERE mode = 'daily'` (replaces the old always-on unique)
- Partial unique `(user_id, puzzle_id, mode, period_key) WHERE mode = 'weekly'`

Streak, period goals, streak/`perfect_week`/goal badges filter `mode = 'daily'`. XP sums and volume badges count all modes.

## API

`POST /api/attempts` body:

```ts
{ decision?: Decision; mode?: AttemptMode; puzzleId?: string; timedOut?: boolean }
```

- `mode` defaults to `daily`. Non-daily requires `puzzleId`.
- Daily still resolves today's puzzle server-side and ignores client `puzzleId`.
- Mode-specific guards before insert (idempotency, caps, membership in mistake queue / weekly set, speed cap, XP-once).

## UI

- Hub at `/challenges` with three cards (mistakes queue, speed, weekly progress).
- Play routes reuse `ReplaySession` parameterized by mode (no cloned replay pages).
- App nav adds **Challenges**.
- Struggle lessons stay on the daily replay screen only.

## Deliberately out of scope

- Separate `challenge_attempts` table
- Friend challenges / tournaments / endless / boss battles
- Hand-authored weekly packs
- Reduced XP rates (caps + XP-once instead)
- Struggle lessons on challenge modes

## Rough shape of the work

1. Spec (this doc) + HANDOFF / V2-PLAN pointers.
2. Schema migration + backfill.
3. Filter streak/goals/badges; add `first_weekly_challenge`.
4. Extend `/api/attempts` with mode guards.
5. Challenges hub + shared session UI (speed timer + 2× chart).
6. E2E coverage; confirm daily streak/goals unchanged when grinding challenges.
