# Learning & Progression Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tag every puzzle with a pattern type (breakout / trend continuation / reversal / range), and surface a short, skippable lesson before a fresh puzzle when the player is clearly struggling with that pattern type.

**Architecture:** One new nullable-then-backfilled `pattern_type` column on `puzzles`, computed purely from data already on each row (no new fetches). A pure classification function and a pure struggle-detection function, both independently testable without the DB. Lesson content is a static code file, not a DB table. The replay page's existing "fresh puzzle" branch gains one query and passes an optional `lesson` prop down to `ReplaySession`, which gates the chart behind a dismissible card when present.

**Tech Stack:** Drizzle ORM / Neon Postgres, Next.js Server Components, no test framework in this repo — verification is small `tsx` scripts with plain `assert`, matching `scripts/seed-puzzles.ts`'s existing style.

---

### Task 1: Add `pattern_type` to the schema + migration

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0002_<name>.sql` (via `drizzle-kit generate`, then hand-check per Task 1 Step 3)

**Step 1: Add the enum + column**

In `src/db/schema.ts`, near `decisionEnum`, add:

```ts
export const patternTypeEnum = ["breakout", "trend_continuation", "reversal", "range"] as const;
export type PatternType = (typeof patternTypeEnum)[number];
```

In the `puzzles` table definition, add a field after `setupNote`:

```ts
    patternType: text("pattern_type", { enum: patternTypeEnum }).notNull(),
```

**Step 2: Generate the migration**

Run: `npx drizzle-kit generate`
Expected: a new file `drizzle/0002_<generated-name>.sql` containing roughly `ALTER TABLE "puzzles" ADD COLUMN "pattern_type" text NOT NULL;`

**Step 3: Fix the migration for existing rows**

100 puzzle rows already exist — a bare `NOT NULL` add with no default will fail against live data. Edit the generated SQL to add a temporary default, since Task 2's backfill immediately overwrites every row with the real value anyway:

```sql
ALTER TABLE "puzzles" ADD COLUMN "pattern_type" text NOT NULL DEFAULT 'range';
```

(Same class of fix as `drizzle/0001_special_paibok.sql` needed — see [docs/reference/REFERENCE-DATABASE.md](../reference/REFERENCE-DATABASE.md) for why generated migrations here can't be trusted blindly against populated tables.)

**Step 4: Apply it**

Run: `npx drizzle-kit migrate`
If that fails the way `0001` did, apply the corrected SQL directly against `DATABASE_URL_UNPOOLED` the same way `0001` was recovered (see the reference doc above) — don't spend more than one retry fighting the CLI before falling back to direct SQL.

**Step 5: Verify**

Run a quick query confirming the column exists and all 100 rows currently read `'range'`:
```bash
node --env-file=.env.local -e '
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
sql`select pattern_type, count(*)::int from puzzles group by pattern_type`.then(r => console.log(r));
'
```
Expected: one row, `{ pattern_type: "range", count: 100 }`.

**Step 6: Commit**
```bash
git add src/db/schema.ts drizzle/
git commit -m "Add pattern_type column to puzzles"
```

---

### Task 2: Pure classification function + backfill script

**Files:**
- Create: `src/lib/pattern-type.ts`
- Create: `scripts/backfill-pattern-types.ts`

**Step 1: Write the pure function**

`src/lib/pattern-type.ts`:
```ts
import type { PatternType } from "@/db/schema";

// Derives a puzzle's pattern type from data already on the row — no new
// fetches. Mirrors the same forward-return math as lib/grading.ts.
export function classifyPatternType({
  historyMovePct,
  outcomeMovePct,
  thresholdPct,
}: {
  historyMovePct: number;
  outcomeMovePct: number;
  thresholdPct: number;
}): PatternType {
  const isWait = Math.abs(outcomeMovePct) < thresholdPct;
  if (isWait) return "range";

  const historyFlat = Math.abs(historyMovePct) < 1.5;
  if (historyFlat) return "breakout";

  const sameDirection = Math.sign(historyMovePct) === Math.sign(outcomeMovePct);
  return sameDirection ? "trend_continuation" : "reversal";
}
```

**Step 2: Write a runnable self-check (no test framework in this repo)**

Append to the bottom of `src/lib/pattern-type.ts`, guarded so it only runs when executed directly:
```ts
if (require.main === module) {
  const assert = require("node:assert");
  assert.equal(classifyPatternType({ historyMovePct: 0.5, outcomeMovePct: -5, thresholdPct: 1 }), "breakout");
  assert.equal(classifyPatternType({ historyMovePct: 4, outcomeMovePct: 6, thresholdPct: 1 }), "trend_continuation");
  assert.equal(classifyPatternType({ historyMovePct: 4, outcomeMovePct: -6, thresholdPct: 1 }), "reversal");
  assert.equal(classifyPatternType({ historyMovePct: 0.2, outcomeMovePct: 0.3, thresholdPct: 1 }), "range");
  console.log("classifyPatternType: all checks passed");
}
```

**Step 3: Run it**

Run: `npx tsx src/lib/pattern-type.ts`
Expected: `classifyPatternType: all checks passed`

**Step 4: Write the backfill script**

`scripts/backfill-pattern-types.ts` — same dry-run-by-default / `--commit` convention as `scripts/seed-puzzles.ts`:
```ts
import { getDb } from "../src/db";
import { puzzles } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { classifyPatternType } from "../src/lib/pattern-type";

async function main() {
  const commit = process.argv.includes("--commit");
  const db = getDb();
  const rows = await db.select().from(puzzles).orderBy(puzzles.orderIndex);

  for (const p of rows) {
    const decisionClose = p.candles[p.decisionIndex - 1].close;
    const outcomeClose = p.candles[p.decisionIndex + p.outcomeWindowCandles - 1].close;
    const historyMovePct = ((decisionClose - p.candles[0].close) / p.candles[0].close) * 100;
    const outcomeMovePct = ((outcomeClose - decisionClose) / decisionClose) * 100;
    const patternType = classifyPatternType({ historyMovePct, outcomeMovePct, thresholdPct: Number(p.forwardReturnThresholdPct) });

    console.log(`#${p.orderIndex} ${p.symbol.padEnd(8)} history=${historyMovePct.toFixed(2)}% outcome=${outcomeMovePct.toFixed(2)}% -> ${patternType}`);
    if (commit) {
      await db.update(puzzles).set({ patternType }).where(eq(puzzles.id, p.id));
    }
  }
  console.log(commit ? `Backfilled ${rows.length} puzzles.` : `Dry run — ${rows.length} previewed, nothing written. Re-run with --commit.`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
```

**Step 5: Dry run, sanity check the distribution**

Run: `npx tsx scripts/backfill-pattern-types.ts`
Expected: 100 lines, no errors. Eyeball that all four pattern types appear and the distribution looks plausible (not e.g. 100/100 the same type).

**Step 6: Commit for real**

Run: `npx tsx --env-file=.env.local scripts/backfill-pattern-types.ts --commit`
Then verify same as Task 1 Step 5, expecting a spread across all 4 types now instead of all `'range'`.

**Step 7: Commit**
```bash
git add src/lib/pattern-type.ts scripts/backfill-pattern-types.ts
git commit -m "Classify all 100 puzzles by pattern type"
```

---

### Task 3: Lesson content

**Files:**
- Create: `src/lib/lessons.ts`

**Step 1: Write the content**

```ts
import type { PatternType } from "@/db/schema";

export const LESSONS: Record<PatternType, { title: string; body: string }> = {
  breakout: {
    title: "Reading a breakout",
    body: "Price sits in a tight, quiet range for a while — each candle's high and low barely moves. That quiet is coiling energy, not a signal on its own. The tell is what happens when price finally clears the top or bottom of that range: a breakout candle is usually bigger than the ones before it, and it doesn't immediately snap back inside the range.",
  },
  trend_continuation: {
    title: "Reading a trend continuation",
    body: "When price is already making higher highs and higher lows (or the mirror, lower highs and lower lows), the trend is the base rate — it keeps going more often than it reverses. Look for pullbacks that stay shallow and don't break the prior structure; a trend that's still healthy rarely gives back most of its recent move before continuing.",
  },
  reversal: {
    title: "Reading a reversal",
    body: "A reversal shows up as the trend's rhythm breaking: higher highs stop happening, or a pullback goes deeper than every pullback before it. The clearest tell is momentum fading into the move's final leg — smaller candles, more overlap between them — right before price turns and erases the recent trend.",
  },
  range: {
    title: "Reading a range",
    body: "Not every setup is trying to break out or reverse — sometimes price just oscillates between a ceiling and a floor with no real edge either way. If highs and lows keep landing in roughly the same band candle after candle, with no expanding range or momentum building in one direction, sitting out is usually the correct read, not a guess.",
  },
};
```

**Step 2: Commit**
```bash
git add src/lib/lessons.ts
git commit -m "Add lesson content for each pattern type"
```

---

### Task 4: Struggle detection

**Files:**
- Create: `src/lib/learning.ts`

**Step 1: Write the pure function + DB wrapper together**

```ts
import { desc, eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles, type PatternType } from "@/db/schema";

// Pure, testable independent of the DB: given the user's most recent
// attempts of one pattern type (newest first, isCorrect only), decide if
// they're struggling. Needs at least 2 data points — a brand new player
// hasn't done enough of a pattern type yet to be "struggling" at it.
export function isStruggling(recentResults: boolean[]): boolean {
  if (recentResults.length < 2) return false;
  const wrongCount = recentResults.filter((correct) => !correct).length;
  return wrongCount >= 2;
}

export async function getStruggleForPatternType(userId: string, patternType: PatternType): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ isCorrect: attempts.isCorrect })
    .from(attempts)
    .innerJoin(puzzles, eq(puzzles.id, attempts.puzzleId))
    .where(and(eq(attempts.userId, userId), eq(puzzles.patternType, patternType)))
    .orderBy(desc(attempts.attemptDate))
    .limit(3);
  return isStruggling(rows.map((r) => r.isCorrect));
}
```

**Step 2: Runnable self-check**

Append to `src/lib/learning.ts`:
```ts
if (require.main === module) {
  const assert = require("node:assert");
  assert.equal(isStruggling([]), false);
  assert.equal(isStruggling([false]), false); // only 1 data point
  assert.equal(isStruggling([true, false]), false); // 1 of 2 wrong
  assert.equal(isStruggling([false, false]), true); // 2 of 2 wrong
  assert.equal(isStruggling([true, false, false]), true); // 2 of 3 wrong
  assert.equal(isStruggling([true, true, false]), false); // 1 of 3 wrong
  console.log("isStruggling: all checks passed");
}
```

**Step 3: Run it**

Run: `npx tsx src/lib/learning.ts`
Expected: `isStruggling: all checks passed`

**Step 4: Commit**
```bash
git add src/lib/learning.ts
git commit -m "Add pattern-type struggle detection"
```

---

### Task 5: Wire into the replay page + lesson card UI

**Files:**
- Modify: `src/app/(app)/replay/page.tsx`
- Modify: `src/components/replay/ReplaySession.tsx`

**Step 1: Fetch struggle state in the fresh-puzzle branch**

In `src/app/(app)/replay/page.tsx`, import `getStruggleForPatternType` from `@/lib/learning` and `LESSONS` from `@/lib/lessons`. After `puzzle` is resolved (both branches, since the lesson should be considered whenever there's no `existing` attempt — same condition that already gates the fresh-puzzle UI), compute:

```ts
const lesson = !existing && (await getStruggleForPatternType(userId, puzzle.patternType)) ? LESSONS[puzzle.patternType] : null;
```

Place this after the `if (!puzzle)` guard, before building `historyCandles`/`outcomeCandles`. Pass `lesson={lesson}` to `<ReplaySession>`.

**Step 2: Add the `lesson` prop and gating UI to ReplaySession**

In `src/components/replay/ReplaySession.tsx`:
- Add `lesson: { title: string; body: string } | null` to the props type.
- Add `const [lessonDismissed, setLessonDismissed] = useState(!lesson);` (starts true — i.e. already "dismissed" — when there's no lesson, so nothing changes on non-struggling days).
- Wrap the existing chart + decision-controls block: only render it when `lessonDismissed`. When `lesson && !lessonDismissed`, render a card above where the chart would go:

```tsx
{lesson && !lessonDismissed && (
  <div
    style={{
      display: "grid",
      gap: 12,
      background: "var(--surface-card)",
      border: "var(--border-width-thick) solid var(--border-default)",
      borderRadius: 24,
      padding: "20px 24px",
      boxShadow: "var(--shadow-flat-md)",
    }}
  >
    <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
      {lesson.title}
    </h2>
    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{lesson.body}</p>
    <button
      onClick={() => setLessonDismissed(true)}
      style={{
        justifySelf: "start",
        background: "var(--violet-500)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius-pill)",
        padding: "10px 20px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Continue to puzzle →
    </button>
  </div>
)}
```

This card replaces the chart/controls while shown; once dismissed, the screen renders exactly as it did before this feature existed.

**Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 4: Commit**
```bash
git add "src/app/(app)/replay/page.tsx" src/components/replay/ReplaySession.tsx
git commit -m "Surface a skippable lesson when struggling with a pattern type"
```

---

### Task 6: Verify in the browser

**Files:** none (verification only)

**Step 1: Manufacture a struggling state**

There's no real struggling user yet, so force one directly in the DB — insert two wrong attempts for the current signed-in test user against two different `range`-type puzzles (pick any two `range` `orderIndex` values from Task 2's backfill output), dated yesterday and the day before (not today, so they don't collide with today's attempt-uniqueness constraint):

```bash
node --env-file=.env.local -e '
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const [user] = await sql`select id from users limit 1`;
  const rangePuzzles = await sql`select id from puzzles where pattern_type = ${"range"} limit 2`;
  await sql`insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date)
    values (${user.id}, ${rangePuzzles[0].id}, ${"buy"}, 0, false, 0, current_date - 2)`;
  await sql`insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date)
    values (${user.id}, ${rangePuzzles[1].id}, ${"buy"}, 0, false, 0, current_date - 1)`;
  console.log("seeded 2 wrong range attempts");
})();
'
```

**Step 2: Load the replay page**

Only if today's puzzle (`dayOfYear % 100`) happens to be pattern type `range` will the lesson show today — check what today's puzzle's pattern type is first, and if it isn't `range`, either wait for a day it is, or temporarily note today's actual puzzle's pattern type and seed the two wrong attempts against *that* type instead of hardcoding `range`.

Navigate to `/replay` (`preview_start` with `{name: "tradequest"}` or attach to the already-running dev server per this repo's existing convention). Confirm:
- The lesson card renders with the correct title/body for today's puzzle's pattern type.
- Clicking "Continue to puzzle →" reveals the chart and decision controls underneath.
- Submitting a decision still grades normally.

**Step 3: Verify the non-struggling path is unchanged**

Delete the two seeded attempts (or pick a puzzle/pattern type you're not "struggling" in) and reload — confirm the screen looks exactly as it did before this feature (no lesson card, straight to the chart).

**Step 4: Clean up the manufactured test data**

```bash
node --env-file=.env.local -e '
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
sql`delete from attempts where attempt_date < current_date`.then(() => console.log("cleaned up"));
'
```

**Step 5: Update docs**

Update [docs/HANDOFF.md](../HANDOFF.md)'s "Immediate next steps" — this item is done. Update [docs/v2/V2-PLAN.md](V2-PLAN.md) to mark pillar #1 as shipped.

**Step 6: Final commit**
```bash
git add docs/
git commit -m "Update docs: Learning & Progression shipped"
```
