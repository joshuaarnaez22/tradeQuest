// Gives the real signed-in user a rich (directly-inserted) 30-day correct
// attempt history, so most badge thresholds are already crossed by the
// time they next solve TODAY'S real puzzle through the UI. Badges are only
// checked/awarded at grading time (POST /api/attempts), so this seed alone
// doesn't create any user_badges rows — solving today's puzzle for real
// right after running this is what triggers the actual award +
// celebration banner, exercising the real pipeline instead of faking it.
// Never touches today's date. Dry-run by default; --commit writes.
import { not, like } from "drizzle-orm";
import { getDb } from "../src/db";
import { users, puzzles, attempts, type Decision } from "../src/db/schema";

const DAYS = 30; // 1..30 days ago — enough to cross streak_30, solved_10,
// perfect_week (contains full ISO weeks), and both goal badges at once.

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const commit = process.argv.includes("--commit");
  const db = getDb();

  const [realUser] = await db.select().from(users).where(not(like(users.id, "dummy_user_%")));
  if (!realUser) {
    console.log("No real user found — sign in via the app once, then re-run this.");
    return;
  }

  const allPuzzles = await db.select().from(puzzles);
  if (allPuzzles.length === 0) throw new Error("No puzzles found — run scripts/seed-puzzles.ts --commit first.");

  console.log(`Seeding ${DAYS} days of correct history for ${realUser.id}...`);
  for (let daysAgo = 1; daysAgo <= DAYS; daysAgo++) {
    const puzzle = allPuzzles[daysAgo % allPuzzles.length];
    const attemptDate = isoDateDaysAgo(daysAgo);
    console.log(`  ${attemptDate}: buy, correct, +15 XP (${puzzle.symbol})`);
    if (commit) {
      const row = {
        userId: realUser.id,
        puzzleId: puzzle.id,
        decision: "buy" as Decision,
        forwardReturnPct: "5.00",
        isCorrect: true,
        xpAwarded: 15,
        attemptDate,
      };
      await db.insert(attempts).values(row).onConflictDoUpdate({ target: [attempts.userId, attempts.attemptDate], set: row });
    }
  }

  console.log(
    commit
      ? `Seeded ${DAYS} days. Now solve today's real puzzle on /replay — that submission triggers the actual badge-award + celebration banner for everything this history newly qualifies for.`
      : `Dry run — would seed ${DAYS} days. Re-run with --commit.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
