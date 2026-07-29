# Deeper Gamification — Design Spec (v2 pillar #2)

> Status: draft for review. Nothing here is built yet. See [V2-PLAN.md](V2-PLAN.md) for how this fits the wider roadmap.

## Goal

The dashboard is currently one flame icon and a number. This adds three things that make it feel like a real game: level titles (not just "Level 1"), permanent badges/achievements for milestones, and weekly/monthly goals with visible progress. All three ship together — they're small individually and share the same dashboard work.

## Data model

**One new table, `user_badges`**: `id` (uuid), `user_id` (FK → users), `badge_id` (text — matches a static id in code, not a DB row), `earned_at` (timestamp). Unique on `(user_id, badge_id)` — a badge is earned once, permanently; re-triggering the check is a no-op (`onConflictDoNothing`).

**Badge definitions live in code**, not the database — `src/lib/badges.ts`, same pattern as `lib/lessons.ts`. Each entry: `{id, title, description}` plus a pure check function (see "Badge checks" below). No admin UI, no CMS — the badge catalog is a fixed list you edit by editing the file, matching how this project already treats small fixed content sets.

**Level titles**: `lib/xp.ts`'s `levelForXp` gets a title added to its return value, looked up from a small static tier ladder (level ranges → title), not one unique title per level number:

| Levels | Title |
|---|---|
| 1–4 | Novice |
| 5–9 | Apprentice |
| 10–19 | Analyst |
| 20–39 | Strategist |
| 40–69 | Expert |
| 70–99 | Master |
| 100+ | Grandmaster |

## The badge set (10, across 4 categories)

| Category | Badges |
|---|---|
| Streak | `streak_3`, `streak_7`, `streak_30` — the user's streak has **ever** reached 3 / 7 / 30 days (not just the current streak — a lapsed streak still counts once earned) |
| Volume | `solved_10`, `solved_50`, `solved_100` — total attempts ever ≥ 10 / 50 / 100 |
| Accuracy | `first_correct` — at least one correct attempt ever exists; `perfect_week` — some ISO calendar week (Mon–Sun) has 7 attempts, all correct |
| Goals | `first_weekly_goal`, `first_monthly_goal` — the **first time ever** the weekly/monthly goal (below) was met. One-time unlocks, not a badge re-earned every period — see "Why goals aren't repeating badges" below |

## Weekly/monthly goals

Fixed targets, same for every player: **5 puzzles solved this ISO week** (Mon–Sun), **20 this calendar month**. Both are comfortably below the max possible (7/week, ~30/month) — they reward consistency, not perfection.

The goal **progress bar** (e.g. "3/5 this week") is purely derived — a live count of this period's attempts against the target, recomputed on every dashboard load, same as streak/XP. It is NOT tied to the badge system and needs no storage.

**Why goals aren't repeating badges**: `user_badges` is permanent-once (unique per user+badge_id), which doesn't fit "hit your weekly goal" being something that could happen every week. Resolved by keeping the progress bar as a separate, ephemeral, always-current display, and adding just one permanent achievement each for the *first* time a player ever clears their weekly/monthly goal (`first_weekly_goal` / `first_monthly_goal`) — consistent with every other badge being a one-time unlock.

## Badge checks

Each badge's check is a pure function over a user's attempt history (dates + correctness), independently testable without the DB — same style as `computeStreak`/`isStruggling`:

- `streak_3`/`streak_7`/`streak_30` need a **longest-streak-ever** function (distinct from `computeStreak`, which only computes the *current* streak counting back from today) — walks all attempt dates once, returns the longest run of consecutive days found anywhere in the history.
- `solved_N` — `attempts.length >= N`.
- `first_correct` — `attempts.some(a => a.isCorrect)`.
- `perfect_week` — group attempts by ISO week, check any group has exactly 7 entries all correct.
- `first_weekly_goal`/`first_monthly_goal` — same grouping, check any week/month group has ≥ 5 / ≥ 20 entries.

## Where the check happens

Inside `POST /api/attempts`, immediately after the new attempt row is inserted — the one place a "new fact" enters the system. Loads the user's full attempt history (now including the just-graded one), runs it through every badge's check function, inserts any newly-true badges into `user_badges` (ignoring ones already earned), and includes the list of *newly* earned badges in the response. Wrapped so a failure in badge-checking never blocks grading itself — grading is the critical path, badges are a bonus layer bolted on after.

## UI changes

- **Dashboard**: level card shows the title next to the level number (e.g. "Level 12 — Analyst"); new badge grid below the existing cards (earned badges lit up with title/description, unearned ones dimmed with just the title, no spoiled description); new goals section with two progress bars.
- **Replay screen**: if `/api/attempts`'s response includes newly-earned badges, a small celebratory banner renders alongside the existing grade result — "🏅 New badge: 7-Day Streak!" — same visual weight as the existing correct/incorrect badge, not a separate popup/modal.

## What this deliberately leaves out

- No badge icons/artwork — text + title only for this pass, matching the plain-text lesson cards from Learning & Progression.
- No social sharing of badges, no public profile page.
- No admin UI for editing the badge catalog or goal targets (edit the code file).
- No per-user or difficulty-scaled goals — fixed targets only, per the earlier decision.
- No RPG-style skill trees, ranks, or coins — explicitly out of v1's scope per PRD-v1 §3, and not part of what was asked for here either.

## Testing

Pure-function self-checks (no test framework, matching this project's style): the longest-streak-ever function, the perfect-week/goal-grouping logic, and the level-title lookup. One new e2e spec, `e2e/gamification.spec.ts`, covering: dashboard shows a title next to the level, badge grid renders earned vs. unearned correctly, and grading an attempt that crosses a threshold returns and displays the new-badge banner.

## Rough shape of the work

1. `user_badges` table + migration.
2. `src/lib/badges.ts` — the 10 definitions + check functions, plus the longest-streak-ever and week/month-grouping helpers.
3. Extend `levelForXp` with the title ladder.
4. Wire badge-checking into `POST /api/attempts`, return newly-earned badges in the response.
5. Dashboard UI: title, badge grid, goals section.
6. Replay screen: new-badge celebratory banner.
7. e2e coverage + manual verification in the browser (forcing a threshold crossing, same style as the Learning & Progression demo seed script).
