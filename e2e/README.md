# E2E tests

Playwright, against the real dev server and real Neon dev DB (no separate test DB exists yet). Tests only touch rows they create themselves and clean up after — never a blanket wipe.

## One-time setup — you do this yourself

Signing in isn't something an agent should do on your behalf, so the auth session is captured once, manually, by you:

```bash
npx playwright test -g "nothing" # ensures browsers are installed; or just run the codegen command below directly
npx playwright codegen --save-storage=e2e/.auth/user.json http://localhost:3000/sign-in
```

Sign in in the browser window that opens (email or Google, whichever you normally use), wait for it to land on `/replay`, then close the window. This saves your session cookies to `e2e/.auth/user.json` — gitignored, it's your personal session, not something to commit.

Re-run this whenever the saved session expires (tests will fail at the `/replay` navigation with a redirect to `/sign-in` if it has).

## Running

```bash
npm run test:e2e
```

Starts the dev server automatically if it isn't already running (`reuseExistingServer: true` in `playwright.config.ts`, so it won't fight an existing `next dev`).

## What's covered

- `auth.spec.ts` — unauthenticated visitors get redirected to `/sign-in` from every `(app)` route; the marketing landing page stays public. Runs with a deliberately empty `storageState`, overriding the signed-in session.
- `replay.spec.ts` — core grading: submitting a decision grades it and shows XP; revisiting the same day returns the cached result instead of re-grading.
- `learning-progression.spec.ts` — v2 pillar #1. Manufactures a "struggling" state against whichever pattern type today's actual puzzle happens to be (computed the same way `lib/puzzle-of-day.ts` does, so this test works on any day, not just the day it was written), confirms the lesson card appears with the exact right lesson text, "Continue to puzzle" reveals the chart, and submitting a decision grades normally. Also covers pattern-tagging data integrity and the struggle-detection SQL directly.
- `dashboard.spec.ts` — streak, level/XP progress, and recent-sessions list render real data.
- `leaderboard.spec.ts` — ranked rows with medals; adapts its assertions if `seed:dummy-data` has been run.
- `gamification.spec.ts` — v2 pillar #2. Dashboard shows the level title, goal bars, and badge grid. The actual award-on-grade path (badges appearing after a real submission) is exercised for real by `replay.spec.ts`'s grading test, not duplicated here — see `scripts/seed-gamification-demo.ts` for how to trigger it manually.
