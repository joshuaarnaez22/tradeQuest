# TradeQuest docs — map

Start with [HANDOFF.md](HANDOFF.md) — it's the single source of truth for what's actually true right now (what's built, what's blocked, what's next). Everything else here is either a planning document HANDOFF points back to, or a reference doc HANDOFF links out to so it doesn't have to hold every detail itself.

## Start here

| Doc | What it's for |
|---|---|
| [HANDOFF.md](HANDOFF.md) | **Read this first.** Current state, what's live/provisioned, what's blocked, phase status, next steps. |

## Product & v1 planning (stable — rarely changes)

| Doc | What it's for |
|---|---|
| [PRD-v1.md](planning/PRD-v1.md) | What v1 actually is: the one loop, scope table, explicitly deferred features + unlock conditions, compliance guardrails. |
| [PRD-v1-IMPLEMENTATION-PLAN.md](planning/PRD-v1-IMPLEMENTATION-PLAN.md) | The phase-by-phase engineering plan that built v1. HANDOFF's phase table tracks status against this. |
| [PRD-vision.md](planning/PRD-vision.md) | The original full brainstorm — every feature ever considered, unsequenced. Long-term backlog, not a build list. |

## v2 planning (active)

| Doc | What it's for |
|---|---|
| [V2-PLAN.md](v2/V2-PLAN.md) | The four v2 pillars picked from PRD-vision.md (Learning & Progression, Deeper Gamification, Challenge Variety, Historical Campaigns), in build order, plain English. |
| [LEARNING-PROGRESSION-SPEC.md](v2/LEARNING-PROGRESSION-SPEC.md) | Full technical design for v2 pillar #1. ✅ Shipped. |
| [DEEPER-GAMIFICATION-SPEC.md](v2/DEEPER-GAMIFICATION-SPEC.md) | Full technical design for v2 pillar #2. ✅ Shipped. |

## Backlog tracking

| Doc | What it's for |
|---|---|
| [BACKLOG-STATUS.md](planning/BACKLOG-STATUS.md) | Everything in PRD-vision.md that isn't built, and *why* — distinguishes deliberate scope cuts from genuine unscoped gaps (e.g. accessibility, analytics). |

## Reference (deep-dive detail, linked from HANDOFF rather than read top-to-bottom)

| Doc | What it's for |
|---|---|
| [REFERENCE-REPLAY-CHART.md](reference/REFERENCE-REPLAY-CHART.md) | Why the candle-reveal chart is built the way it is. Read before touching `ReplayChart.tsx`. |
| [REFERENCE-DATABASE.md](reference/REFERENCE-DATABASE.md) | RLS policies, the serial→uuid primary key migration, a related bug it surfaced. |
| [REFERENCE-PUZZLE-CONTENT.md](reference/REFERENCE-PUZZLE-CONTENT.md) | How the 100 real puzzles were sourced (Binance) and picked (16 named events + 84 systematically discovered). |

## Keeping this from getting messy again

- New "what's currently true" facts go in **HANDOFF.md**, not a new file — update it in place, don't let stale sections pile up.
- New deep-dive/how-it-works detail that would bloat HANDOFF goes in its own `REFERENCE-*.md` file, linked from HANDOFF.
- New planning docs (roadmaps, specs) get added to this README's table the same day they're created.
