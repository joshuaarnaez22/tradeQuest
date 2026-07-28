# Reference: database schema notes

## Row-Level Security

`src/db/schema.ts` has Row-Level Security policies (Neon + Clerk integration, `authenticatedRole`/`authUid`). The app's own queries run through `getDb()` on what's almost certainly the Neon owner-role connection, which bypasses RLS entirely (standard Postgres behavior) — so this doesn't change how the app behaves today. It's defense-in-depth for if/when a Neon Data API or direct-from-browser Clerk-JWT-authenticated connection ever gets added, which nothing currently does.

## puzzles.id / attempts.id are uuid, not serial

Per user request (2026-07-28) — sequential integer PKs replaced with `uuid` (`defaultRandom()`, i.e. `gen_random_uuid()`), for both `puzzles.id` and `attempts.id` (`attempts.puzzle_id` FK follows). `users.id` is untouched (already Clerk's external string ID, never sequential).

Migration is `drizzle/0001_special_paibok.sql`. Since `int -> uuid` isn't a valid Postgres cast, and the data at the time was 100 seeded puzzles + one test attempt (all disposable), the migration **wipes both tables** (`DELETE FROM attempts; DELETE FROM puzzles;`) rather than attempting an in-place data-preserving conversion. Puzzles were immediately reseeded via `scripts/seed-puzzles.ts --commit` after.

**Gotcha for next time:** this project's `drizzle.__drizzle_migrations` tracking table is empty — schema was evidently synced via `drizzle-kit push` originally, not `migrate`, even though migration files exist in `drizzle/`. `npx drizzle-kit migrate` failed on this migration (Postgres error: "default for column can't be cast automatically to uuid" — the generated SQL was missing `ALTER COLUMN ... DROP DEFAULT` before the type change; fixed by hand in the migration file). Applied by running the corrected SQL directly against `DATABASE_URL_UNPOOLED`, not via the CLI, after the CLI's partial failure had already left the tables empty with the old FK constraint dropped. If you generate another migration that changes a column's underlying type, check the generated SQL for a missing `DROP DEFAULT` before trusting `drizzle-kit migrate` to apply it cleanly.

## A related bug this surfaced

Growing the puzzle catalog (16 → 100 puzzles) exposed a real bug, now fixed: [replay/page.tsx](../../src/app/(app)/replay/page.tsx) was re-deriving "today's puzzle" via `dayOfYear % publishedPuzzles.length` even when a cached attempt already existed for today, instead of trusting `existing.puzzleId`. Harmless while the puzzle count never changes, but the moment it does, a same-day revisit renders the *new* puzzle's chart next to the *old* cached grade/explanation. Now fixed to look up the puzzle by `existing.puzzleId` when an attempt exists — keep this pattern (trust the attempt's own FK over re-deriving) if this logic is touched again.
