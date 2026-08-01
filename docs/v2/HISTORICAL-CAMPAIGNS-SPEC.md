# Historical Campaigns — Design Spec (v2 pillar #4)

> Status: ✅ shipped 2026-08-02. See [V2-PLAN.md](V2-PLAN.md) for how this fits the wider roadmap.

## Goal

Every puzzle today is an isolated moment. This adds story-driven multi-puzzle arcs built from real historical events already in the library — a narrative thread, sequential missions, and a tougher-feeling final boss beat.

## Locked decisions

**Ship real plumbing + 2 campaigns**, not a single hardcoded demo page. Content uses existing named puzzles (`orderIndex` 0–15); no new OHLCV seeding required for this pass.

**Scoring matches Challenge Variety:** grade + AI + XP yes; streak / weekly-monthly goals no.

**Sequential unlock:** mission N unlocks after mission N−1 has any graded campaign attempt (correct or not — you lived through the beat). Replays of completed missions show the cached result.

**Campaign definitions live in code** (`src/lib/campaigns.ts`), same pattern as lessons/badges. Missions reference puzzles by `orderIndex` (stable across reseeds).

## The two campaigns

### 1. `contagion-2022` — Contagion 2022

Crypto winter cascade: Terra/Luna → Merge aftermath → FTX collapse → bear-market low bounce.

| Step | orderIndex | Role |
|---|---|---|
| 0 | 10 (Terra/Luna ETH) | Mission |
| 1 | 11 (ETH Merge) | Mission |
| 2 | 6 (FTX BTC) | Mission |
| 3 | 7 (Jan 2023 recovery BTC) | Final boss |

### 2. `covid-shock` — COVID Shock

Black Thursday panic → DeFi summer recovery → autumn ATH breakout.

| Step | orderIndex | Role |
|---|---|---|
| 0 | 1 (COVID Black Thursday BTC) | Mission |
| 1 | 14 (DeFi summer ETH) | Mission |
| 2 | 2 (Oct 2020 ATH BTC) | Final boss |

Each mission has a short beat title + story paragraph shown before the chart. Final boss uses the same grading rules — the “boss” is narrative framing, not a separate mechanic.

## Data model

Extend `attempts.mode` with `campaign`.

- `period_key` = `{slug}:{missionIndex}` (e.g. `contagion-2022:2`)
- Partial unique `(user_id, mode, period_key) WHERE mode = 'campaign'` — one graded attempt per mission forever
- Streak/goals still filter `mode = 'daily'`

No new campaign/progress tables — progress is derived from campaign-mode attempts, same philosophy as streak/XP.

## API

`POST /api/attempts` accepts `mode: "campaign"` + `puzzleId` + `periodKey` (required).

Guards:
1. `periodKey` must match a known campaign mission
2. That mission’s puzzle must be the one referenced by `puzzleId`
3. Prior mission must already be attempted (except index 0)
4. Idempotent return if this mission was already graded

## UI

- Hub `/campaigns` — both campaigns with progress `n/total`
- Detail `/campaigns/[slug]` — story + mission list (locked / play / done)
- Play `/campaigns/[slug]/[step]` — beat card then shared `ReplaySession`
- App nav adds **Campaigns**

## Badges

Two permanent badges (one per campaign), earned when every mission in that campaign has a campaign-mode attempt:

- `campaign_contagion_2022`
- `campaign_covid_shock`

## Deliberately out of scope

- Stocks / 2008 / GameStop (wrong asset class for current library)
- Campaign builder / CMS / marketplace
- Unlock gates by level/streak
- Harder grading thresholds on boss missions
- New candle data beyond the existing 100 puzzles
- Lessons-learned quiz screens (beat copy is enough for this pass)

## Rough shape of the work

1. Spec + HANDOFF / V2-PLAN pointers
2. Schema: add `campaign` mode + unique index; migrate
3. `campaigns.ts` catalog + progress queries
4. Extend `/api/attempts` + badges
5. Hub / detail / play UI + nav
6. E2e: hub renders, sequential lock, completing a mission writes `mode=campaign`
