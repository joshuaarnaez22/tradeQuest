import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { isoWeekId, weeklyPuzzleIds, SPEED_DAILY_CAP } from "@/lib/challenges";
import { todayUtcDateString } from "@/lib/puzzle-of-day";

export type MistakeQueueItem = { id: string; symbol: string; patternType: string };

// Distinct puzzles with ≥1 incorrect daily attempt, minus those already
// cleared with a correct mistake-mode attempt.
export async function getMistakeQueue(userId: string): Promise<MistakeQueueItem[]> {
  const db = getDb();
  const wrong = await db
    .selectDistinct({ puzzleId: attempts.puzzleId })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "daily"), eq(attempts.isCorrect, false)));
  if (wrong.length === 0) return [];

  const cleared = await db
    .selectDistinct({ puzzleId: attempts.puzzleId })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "mistake"), eq(attempts.isCorrect, true)));
  const clearedSet = new Set(cleared.map((r) => r.puzzleId));
  const activeIds = wrong.map((r) => r.puzzleId).filter((id) => !clearedSet.has(id));
  if (activeIds.length === 0) return [];

  const rows = await db
    .select({ id: puzzles.id, symbol: puzzles.symbol, patternType: puzzles.patternType })
    .from(puzzles)
    .where(and(eq(puzzles.isPublished, true), inArray(puzzles.id, activeIds)))
    .orderBy(puzzles.orderIndex);
  return rows;
}

export async function getWeeklyChallengeState(userId: string) {
  const db = getDb();
  const weekId = isoWeekId();
  const published = await db
    .select({ id: puzzles.id, symbol: puzzles.symbol })
    .from(puzzles)
    .where(eq(puzzles.isPublished, true))
    .orderBy(puzzles.orderIndex);
  const ids = weeklyPuzzleIds(
    weekId,
    published.map((p) => p.id)
  );
  const byId = new Map(published.map((p) => [p.id, p]));
  const attempted = await db
    .select({ puzzleId: attempts.puzzleId, isCorrect: attempts.isCorrect })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "weekly"), eq(attempts.periodKey, weekId)));
  const attemptedMap = new Map(attempted.map((a) => [a.puzzleId, a]));

  return {
    weekId,
    completed: attempted.length,
    total: ids.length,
    puzzles: ids.map((id) => ({
      id,
      symbol: byId.get(id)?.symbol ?? "?",
      attempted: attemptedMap.has(id),
      isCorrect: attemptedMap.get(id)?.isCorrect ?? null,
    })),
  };
}

export async function getSpeedRunsToday(userId: string): Promise<number> {
  const db = getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "speed"), eq(attempts.attemptDate, todayUtcDateString())));
  return Number(count);
}

export { SPEED_DAILY_CAP };
