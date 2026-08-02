# Learn + Quiz — Design Spec

> Status: ✅ shipped 2026-08-02. Concept lessons with a graded quiz after each — a shippable first slice of the vision “Core Learning System.”

## Goal

Players want explicit teaching (e.g. support & resistance) plus a quiz — not only struggle-triggered pattern cards on the daily puzzle. This adds a browsable Learn hub: short concept lesson → multiple-choice quiz → XP on first pass.

## Locked decisions

- **4 modules:** Support & Resistance, Trends, Breakouts, Ranges (Wait).
- **Lesson then quiz** — sequential within a module; hub shows progress.
- **Multiple choice only** (4 questions each). No chart drawing / click-S/R yet.
- **Pass = ≥ 75%** correct (3 of 4). Fail → retry anytime.
- **XP once on first pass** (flat 25 XP — 4 modules = 100 XP → Level 2 / Replay unlock). Retries grade but award 0. Does **not** affect streak or weekly/monthly goals.
- **Definitions in code** (`src/lib/learn-modules.ts`), same pattern as lessons/campaigns.
- **Compliance:** educational framing only — never “advice,” never personalized guidance.

## Data model

New table `quiz_completions`:

| Column | Notes |
|---|---|
| id | uuid PK |
| user_id | FK → users |
| module_id | text — matches catalog id |
| score | int — number correct |
| total | int — question count |
| passed | boolean |
| xp_awarded | int — 25 on first pass, else 0 |
| created_at / updated_at | timestamptz |

Unique on `(user_id, module_id)` — one row per module; retries update score/passed but only the first successful pass sets `xp_awarded = 25`.

`getUserXp` / leaderboard sum **attempts.xp_awarded + quiz_completions.xp_awarded**.

## API

`POST /api/quiz` body: `{ moduleId, answers: number[] }` (selected option index per question).

- Auth + rate limit
- Grade against catalog
- Upsert completion; award XP only if newly passing and prior row had no XP
- Return `{ score, total, passed, xpAwarded, correctIndexes }`
- Also run badge checks for learn badges

## UI

- `/learn` — hub of 4 modules
- `/learn/[moduleId]` — lesson + “Take quiz” CTA
- `/learn/[moduleId]/quiz` — client quiz form
- App nav: **Learn**

## Badges

- `first_quiz_pass` — any module passed
- `learn_all_modules` — all 4 modules passed

## Testing

- Pure checks in `learn-modules.ts` (grading math)
- `e2e/learn.spec.ts` — hub renders, complete S/R quiz, row in `quiz_completions`, XP awarded once

## Deliberately out of scope

- Chart interaction (draw/click S/R)
- Videos, flashcards, glossary CMS
- Fill-blank / drag-drop question types
- AI-generated lessons
- Soft tutorial instead of level gates (level gates live in [FEATURE-UNLOCKS-SPEC.md](FEATURE-UNLOCKS-SPEC.md))

## Rough shape of the work

1. Spec + HANDOFF / README pointers
2. Schema + migration; XP aggregation
3. Module catalog + `/api/quiz` + badges
4. Learn UI + nav
5. E2e + docs
