# TradeQuest v2 Plan (draft — for your review)

## Why this exists

v1 works, but it's thin: one puzzle a day, a number that goes up, a leaderboard. Nothing teaches you anything beyond trial and error, and there's no reason to open the app more than once a day. This doc lays out four features to fix that, and the order we'd build them in.

This is a **plan to review, not a build in progress.** Nothing here gets coded until you sign off. Once you approve, we'll write a proper detailed spec for the first item and build that one before moving to the next.

## How to read this

Four separate projects, each gets built and shipped on its own — not all at once. For each one: what it is in plain terms, why it's positioned where it is, and roughly how big a job it looks like. Only #1 has been talked through in real detail so far; #2–#4 are still rough shapes we'd nail down properly before building each one.

---

## 1. Learning & Progression — ✅ shipped 2026-07-28

Verified in the browser: puzzles are tagged by pattern type, a struggling player sees a skippable lesson card before a fresh puzzle, dismissing it reveals the puzzle normally, and grading/XP/streak all still work. See [LEARNING-PROGRESSION-SPEC.md](LEARNING-PROGRESSION-SPEC.md) for the design and [../plans/2026-07-28-learning-progression.md](../plans/2026-07-28-learning-progression.md) for how it was built.

**The problem it fixes:** right now, missing a puzzle teaches you nothing. You get one short sentence ("you were wrong because X") and move on. There's no sense of "I'm bad at spotting range-bound charts, let me learn that."

**What it'd do:** every puzzle already fits one of a few natural categories — a sharp breakout out of a quiet range, a trend that just keeps going, a trend that suddenly reverses, or a market going nowhere. We'd label each of the 100 puzzles with its category (no manual work — it can be worked out automatically from the price data we already have). Then we'd watch your recent results: if you keep getting "range" puzzles wrong, the next time one comes up you'd see a short, plain explanation of what a range actually looks like and why it fooled you — before you attempt it, not after. It's a nudge you can skip, not a wall you have to click through.

**Why first:** it's the smallest of the four to build, it directly answers "there's no learning here," and the category labels it introduces are useful groundwork for #3 and #4 later (e.g. "practice your weak spot" mode, or grouping campaign puzzles by theme).

**Size:** small. One new label on each puzzle, a handful of short lessons to write, and one new check on the puzzle screen.

---

## 2. Deeper Gamification — ✅ shipped 2026-07-29

Full design in [DEEPER-GAMIFICATION-SPEC.md](DEEPER-GAMIFICATION-SPEC.md): level titles, 10 permanent badges (streak/volume/accuracy/goals), and weekly/monthly goal progress bars, with a real-time "new badge" celebration on the replay screen.

**The problem it fixes:** the dashboard is one flame icon and a number. It doesn't feel like a game yet.

**What it'd do:** levels with real titles (not just "Level 1"), badges/achievements for milestones (first correct call, first 7-day streak, first perfect week), and weekly/monthly goals you can actually see progress toward — not just an infinite XP counter.

**Why second:** it doesn't depend on anything from #1, so it could technically run in parallel — but sequencing it right after keeps us focused on one thing landing at a time. Mostly builds on what already exists (XP, streak) rather than requiring new mechanics.

**Size:** medium. Needs a way to track "have you earned this badge yet," plus new dashboard UI.

---

## 3. Challenge Variety — build this third

**The problem it fixes:** the only reason to open the app is "today's one puzzle." No reason to come back later in the day, and no way to work on a specific weakness on demand.

**What it'd do:** options beyond the daily puzzle — a bigger weekly challenge, a timed "speed mode" for people who want a quicker/harder version, and a "replay your mistakes" mode that pulls specifically from puzzles you got wrong before.

**Why third:** meaningfully better once #1 (pattern labels, so "replay your mistakes" can be smart about *which* mistakes) and #2 (badges to reward finishing a weekly challenge) already exist.

**Size:** medium-large. Several new modes, each with its own small twist on the existing puzzle screen.

---

## 4. Historical Campaigns — build this last

**The problem it fixes:** right now every puzzle is a disconnected, isolated moment. There's no "story" — nothing like living through the 2008 crash or the FTX collapse puzzle by puzzle.

**What it'd do:** multi-puzzle arcs built around real historical events, with a narrative thread and a tougher "final" puzzle at the end of each one. This is the flagship idea from the original product vision doc.

**Why last:** this one is a content problem, not really a coding problem — each campaign needs real historical research and puzzle curation, similar to (but bigger than) the work that went into the current 100-puzzle library. It's also the most rewarding to build once badges and pattern themes from #2/#1 already exist to tie into it.

**Size:** large, and the size is mostly research/content time, not engineering time.

---

## What happens next

Review this and tell me:
- Does the order make sense, or would you reprioritize?
- Anything you'd cut, or add that's missing?
- Anything in #1's description that doesn't match what you want?

Once you're happy with this doc, we'll write the full technical spec for #1 (Learning & Progression) — the actual data changes, exact wording for the "struggling" detection, what the lesson screen looks like — and only then start building it.
