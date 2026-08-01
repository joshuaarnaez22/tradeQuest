// Gives the one real (signed-in) user a small, deliberate struggle
// history — 2 wrong attempts per pattern type, dated in the past (never
// today, so it never collides with a real daily attempt) — so Learning &
// Progression's lesson card is guaranteed to show up on /replay no matter
// which pattern type today's actual puzzle happens to be. Exists purely so
// you can manually see/click through the feature without hand-crafting
// test data through the DB every time. Safe to re-run whenever the
// lesson stops showing (e.g. after solving today's puzzle consumes the
// "no attempt yet today" state, or an e2e run cleared these rows).
// Dry-run by default; --commit writes.
import { not, like, sql } from "drizzle-orm";
import { getDb } from "../src/db";
import { users, puzzles, attempts, decisionEnum, patternTypeEnum, type Decision, type PatternType } from "../src/db/schema";
import { gradeDecision } from "../src/lib/grading";
import { xpForAttempt } from "../src/lib/xp";

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

  const [realUser] = await db.select().from(users).where(not(like(users.id, "dummy_user_%")));
  if (!realUser) {
    console.log("No real user found — sign in via the app once, then re-run this.");
    return;
  }

  console.log(`Seeding struggle history for ${realUser.id}...`);
  let dayOffset = 1; // start at yesterday — never touch today's real attempt
  for (const patternType of patternTypeEnum as readonly PatternType[]) {
    const candidates = allPuzzles.filter((p) => p.patternType === patternType);
    if (candidates.length < 2) {
      console.log(`  ${patternType}: only ${candidates.length} puzzles exist, skipping`);
      continue;
    }
    for (const puzzle of candidates.slice(0, 2)) {
      const decisionClose = puzzle.candles[puzzle.decisionIndex - 1].close;
      const outcomeClose = puzzle.candles[puzzle.decisionIndex + puzzle.outcomeWindowCandles - 1].close;
      // Any decision other than the actual correct one is guaranteed wrong.
      const wrongDecision = decisionEnum.find(
        (d) => !gradeDecision({ decision: d, decisionClose, outcomeClose, thresholdPct: Number(puzzle.forwardReturnThresholdPct) }).isCorrect
      ) as Decision;
      const { forwardReturnPct } = gradeDecision({ decision: wrongDecision, decisionClose, outcomeClose, thresholdPct: Number(puzzle.forwardReturnThresholdPct) });
      const attemptDate = isoDateDaysAgo(dayOffset);

      console.log(`  ${patternType} (${puzzle.symbol}) -> ${attemptDate}: ${wrongDecision} (wrong, by design)`);
      if (commit) {
        const row = {
          userId: realUser.id,
          puzzleId: puzzle.id,
          decision: wrongDecision,
          forwardReturnPct: forwardReturnPct.toFixed(2),
          isCorrect: false,
          xpAwarded: xpForAttempt(wrongDecision, false),
          attemptDate,
        };
        await db.insert(attempts).values(row).onConflictDoUpdate({
          target: [attempts.userId, attempts.attemptDate],
          targetWhere: sql`${attempts.mode} = 'daily'`,
          set: row,
        });
      }
      dayOffset++;
    }
  }

  console.log(
    commit
      ? `Seeded ${dayOffset - 1} struggle-history attempts for ${realUser.id} — the lesson card should now show on /replay for any pattern type.`
      : `Dry run — would seed ${dayOffset - 1} struggle-history attempts for ${realUser.id}. Re-run with --commit.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
