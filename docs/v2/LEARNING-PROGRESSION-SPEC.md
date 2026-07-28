# Learning & Progression — Design Spec (v2 pillar #1)

> Status: ✅ shipped 2026-07-28, verified in the browser (see [docs/plans/2026-07-28-learning-progression.md](../plans/2026-07-28-learning-progression.md) for how it was built). See [V2-PLAN.md](V2-PLAN.md) for how this fits the wider roadmap.

## Goal

Right now, missing a puzzle teaches nothing beyond one throwaway sentence. This adds real pattern recognition: puzzles get tagged by what kind of setup they are, and when someone's clearly struggling with one kind, a short lesson surfaces before their next puzzle of that type. Skippable nudge, not a gate.

## Pattern taxonomy

Four categories, covering every puzzle already in the library:

| Type | What it looks like |
|---|---|
| `breakout` | Price sits flat/quiet, then makes a real move — snapping out of consolidation |
| `trend_continuation` | Price is already trending, and keeps going the same direction |
| `reversal` | Price is trending one way, then flips and goes the other |
| `range` | Price goes nowhere the whole time — the "correct" read is Wait |

## Classifying the 100 existing puzzles

No manual re-tagging needed — it's derived from data already stored on each puzzle:

1. If the correct call is **Wait** → `range`.
2. Otherwise, compare two numbers we already compute today:
   - **history move%**: how much price moved from the first candle to the decision point
   - **outcome move%**: how much price moved from the decision point to the end (the number that already drives grading)
3. History move roughly flat (under ~1.5%) but a real outcome move → `breakout`
4. History move and outcome move same direction → `trend_continuation`
5. Opposite directions → `reversal`

A small backfill script runs this against the candles already in the database and sets the tag on all 100 rows. One new column on `puzzles`, nothing else changes shape-wise.

## Lesson content

Four short lessons (title + 2-4 sentences each), same length/tone as the existing puzzle setup notes. Lives as a plain code file (`src/lib/lessons.ts`), not a database table — this project already keeps small fixed constants like this in code (see `lib/xp.ts`), and four lessons don't need a CMS. Editing a lesson later means editing the file and redeploying, not spinning up an admin panel that doesn't otherwise exist.

I'll draft the actual lesson text as part of implementation, for your review same as the puzzle notes were.

## Detecting "struggling"

- Look at the user's last 3 attempts on puzzles tagged with today's puzzle's pattern type.
- Need at least 2 of those to exist (a brand new player hasn't done enough of a pattern type yet to be "struggling" at it).
- 2 or more of the last 3 wrong → struggling.
- This is recalculated fresh every time the puzzle page loads — nothing is saved about whether you've "seen" the lesson before. Since it's a nudge and not a gate, once your accuracy on that pattern improves, the lesson naturally stops showing up on its own. No extra tracking needed.

## Where it appears

- Only on the replay screen, only for a fresh puzzle you haven't attempted yet today (same code path we already fixed a bug in earlier this week).
- If struggling with today's pattern type: a small card appears above the chart with the lesson's title and text, and a "Continue to puzzle" button. Clicking it reveals the puzzle underneath.
- Not struggling, or not enough history yet: the screen looks exactly like it does today — nothing changes for most days.

## What this deliberately leaves out

- No admin UI for editing lessons (edit the code file)
- No "mark as read" / dismissal tracking (recomputing each visit already handles this)
- No quizzes, video, or a browsable glossary — that's the fuller PRD-vision "Core Learning System," a bigger separate scope, not this

## Testing

Two small, focused checks (no test framework needed, matching this project's existing style):
- The pattern-classification math: given known history/outcome numbers, confirm it returns the right category.
- The struggle-detection math: confirm "2 of last 3 wrong" triggers it, and confirm fewer than 2 prior attempts never does.

## Rough shape of the work

1. Add the pattern-type column + backfill script, run it against the live 100 puzzles.
2. Write the 4 lesson entries.
3. Add the struggle-detection query.
4. Add the lesson card to the replay screen.
5. Verify in the browser: force a struggling state, confirm the lesson shows and "Continue" reveals the puzzle; confirm a non-struggling day looks unchanged.
