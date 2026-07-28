import assert from "node:assert";
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

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(isStruggling([]), false);
  assert.equal(isStruggling([false]), false); // only 1 data point
  assert.equal(isStruggling([true, false]), false); // 1 of 2 wrong
  assert.equal(isStruggling([false, false]), true); // 2 of 2 wrong
  assert.equal(isStruggling([true, false, false]), true); // 2 of 3 wrong
  assert.equal(isStruggling([true, true, false]), false); // 1 of 3 wrong
  console.log("isStruggling: all checks passed");
}
