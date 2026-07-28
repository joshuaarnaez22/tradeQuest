// One-shot dummy data seed: many fake users with realistic-looking attempt
// history, so the leaderboard/dashboard have real volume to render and the
// e2e leaderboard test has something meaningful to check. These are NOT
// real accounts — never logged into, no Clerk identity behind them, ids
// prefixed "dummy_user_" so they can never be confused with a real
// webhook-synced row (see users_last_reminder_sent_at_idx etc., all
// untouched — this only writes users.id/display_name and attempts rows).
// Every attempt is graded with the real gradeDecision/xpForAttempt logic
// against a real puzzle's real candles, so the data is internally
// consistent, not just random numbers. Dry-run by default; --commit writes.
//
// For giving the real signed-in user a Learning & Progression struggle
// history to manually test with, see scripts/seed-learning-progression-demo.ts
// instead — kept separate since it's a different purpose (manual testing
// vs. bulk leaderboard/dashboard volume).
import { getDb } from "../src/db";
import { users, puzzles, attempts, decisionEnum, type Decision } from "../src/db/schema";
import { gradeDecision } from "../src/lib/grading";
import { xpForAttempt } from "../src/lib/xp";

const USER_COUNT = 60;
const MAX_HISTORY_DAYS = 45; // how far back a dummy attempt can be dated
const MIN_HISTORY_DAYS = 5;
const MAX_ACTIVE_DAYS = 30; // upper bound on distinct days a dummy user played

const HANDLES = [
  "Nova", "Rook", "Vega", "Cipher", "Delta", "Echo", "Flux", "Griffin", "Halo", "Ion",
  "Jett", "Kite", "Lynx", "Mako", "Nyx", "Onyx", "Pyre", "Quill", "Raze", "Slate",
  "Talon", "Umbra", "Vector", "Wraith", "Xen", "Yara", "Zephyr", "Astra", "Blaze", "Comet",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const commit = process.argv.includes("--commit");
  const db = getDb();

  const allPuzzles = await db.select().from(puzzles);
  if (allPuzzles.length === 0) throw new Error("No puzzles found — run scripts/seed-puzzles.ts --commit first.");

  let totalAttempts = 0;

  for (let i = 0; i < USER_COUNT; i++) {
    const id = `dummy_user_${String(i).padStart(3, "0")}`;
    const displayName = `${pick(HANDLES)}${randomInt(10, 999)}`;

    if (commit) {
      await db.insert(users).values({ id, displayName }).onConflictDoUpdate({ target: users.id, set: { displayName } });
    }

    // One attempt per chosen day, matching the real one-per-calendar-day rule.
    const historyDays = randomInt(MIN_HISTORY_DAYS, MAX_ACTIVE_DAYS);
    const days = new Set<number>();
    while (days.size < historyDays) days.add(randomInt(0, MAX_HISTORY_DAYS));

    let userAttemptCount = 0;
    for (const daysAgo of days) {
      const puzzle = pick(allPuzzles);
      const decision = pick(decisionEnum) as Decision;
      const decisionClose = puzzle.candles[puzzle.decisionIndex - 1].close;
      const outcomeClose = puzzle.candles[puzzle.decisionIndex + puzzle.outcomeWindowCandles - 1].close;
      const { forwardReturnPct, isCorrect } = gradeDecision({
        decision,
        decisionClose,
        outcomeClose,
        thresholdPct: Number(puzzle.forwardReturnThresholdPct),
      });
      const xpAwarded = xpForAttempt(decision, isCorrect);

      totalAttempts++;
      userAttemptCount++;
      if (commit) {
        await db
          .insert(attempts)
          .values({
            userId: id,
            puzzleId: puzzle.id,
            decision,
            forwardReturnPct: forwardReturnPct.toFixed(2),
            isCorrect,
            xpAwarded,
            attemptDate: isoDateDaysAgo(daysAgo),
          })
          .onConflictDoNothing({ target: [attempts.userId, attempts.attemptDate] });
      }
    }

    console.log(`${id} -> ${displayName} (${userAttemptCount} attempts)`);
  }

  console.log(
    commit
      ? `Seeded ${USER_COUNT} dummy users with ${totalAttempts} attempts.`
      : `Dry run — would seed ${USER_COUNT} dummy users with ~${totalAttempts} attempts. Re-run with --commit.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
