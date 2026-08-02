# Feature Unlocks — Design Spec

> Status: ✅ shipped 2026-08-02. Level-gated access so new players start with Learn, then unlock play features as they level up.

## Goal

Lock advanced features until the player reaches a level. Level 1 is Learn-first; Replay / Challenges / Campaigns open as XP climbs. Dashboard and Leaderboard stay available so progress is always visible.

## Unlock ladder

| Feature | Min level | Notes |
|---|---|---|
| Learn | 1 | Always open |
| Dashboard | 1 | Always open |
| Leaderboard | 1 | Always open |
| Replay (daily puzzle) | 2 | Main habit loop |
| Challenges | 3 | Mistake / speed / weekly |
| Campaigns | 4 | Historical arcs |

Level formula unchanged: `floor(xp / 100) + 1` (`src/lib/xp.ts`).

## XP path for new players

Quiz first-pass XP is **25** (`QUIZ_PASS_XP`). Four modules × 25 = **100 XP → Level 2**, which unlocks Replay. Daily puzzles then feed Challenges (L3) and Campaigns (L4).

## Implementation

- Catalog: `src/lib/feature-unlocks.ts`
- Level resolve: `src/lib/user-level.ts` (sums attempt + quiz XP)
- Page gate: `requireFeature` → `FeatureLocked` UI + CTA to Learn
- Nav: locked items show `· L{n}` and reduced opacity; still navigable (page explains the lock)
- API: `POST /api/attempts` returns **403** when the mode’s feature is locked
- Auth landing: `/home` redirects to Learn (L1) or Replay (L2+)

## Dev / e2e override

In non-production, cookie `tq_e2e_level` forces the effective level for unlock checks (does not change stored XP). Used by `e2e/feature-unlocks.spec.ts`.

## Testing

- Pure checks in `feature-unlocks.ts`
- `e2e/feature-unlocks.spec.ts` — L1 locks Replay/Challenges/Campaigns; L4 opens them

## Deliberately out of scope

- Soft tutorial instead of hard locks
- Per-module Learn gating
- Changing the 100 XP/level curve
