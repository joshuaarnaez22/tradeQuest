import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, users, userBadges, quizCompletions } from "@/db/schema";

// Derived, not stored — TECH-STACK.md: don't build a mutable counter table
// until querying `attempts` measurably doesn't scale. Quiz XP is added from
// quiz_completions so Learn passes count toward level/leaderboard.
export async function getUserXp(userId: string): Promise<number> {
  const db = getDb();
  const [[attemptRow], [quizRow]] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${attempts.xpAwarded}), 0)` })
      .from(attempts)
      .where(eq(attempts.userId, userId)),
    db
      .select({ total: sql<number>`coalesce(sum(${quizCompletions.xpAwarded}), 0)` })
      .from(quizCompletions)
      .where(eq(quizCompletions.userId, userId)),
  ]);
  return Number(attemptRow?.total ?? 0) + Number(quizRow?.total ?? 0);
}

// Pure function: walks distinct attempt dates (already sorted descending)
// counting back consecutive UTC days from today. Independently testable
// without touching the DB.
export function computeStreak(attemptDates: string[], today = new Date()): number {
  const days = new Set(attemptDates);
  let streak = 0;
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Grace: if today's puzzle isn't solved yet, the streak isn't broken until
  // the day actually ends — start counting from yesterday in that case.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function getUserStreak(userId: string): Promise<number> {
  const db = getDb();
  // Challenge modes never feed the streak — daily habit only.
  const rows = await db
    .selectDistinct({ attemptDate: attempts.attemptDate })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "daily")))
    .orderBy(desc(attempts.attemptDate));
  return computeStreak(rows.map((r) => r.attemptDate));
}

export async function getRecentSessions(userId: string, limit = 5) {
  const db = getDb();
  return db
    .select({
      decision: attempts.decision,
      isCorrect: attempts.isCorrect,
      forwardReturnPct: attempts.forwardReturnPct,
      attemptDate: attempts.attemptDate,
      mode: attempts.mode,
    })
    .from(attempts)
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(limit);
}

export async function getEarnedBadgeIds(userId: string): Promise<Set<string>> {
  const db = getDb();
  const rows = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
  return new Set(rows.map((r) => r.badgeId));
}

export async function getAttemptRecords(userId: string) {
  const db = getDb();
  return db
    .select({
      date: attempts.attemptDate,
      isCorrect: attempts.isCorrect,
      mode: attempts.mode,
      periodKey: attempts.periodKey,
    })
    .from(attempts)
    .where(eq(attempts.userId, userId));
}

export async function getLeaderboard(limit = 50) {
  const db = getDb();
  // Attempt XP + quiz XP so Learn passes count on the board.
  const attemptXp = db
    .select({
      userId: attempts.userId,
      xp: sql<number>`coalesce(sum(${attempts.xpAwarded}), 0)`.as("xp"),
    })
    .from(attempts)
    .groupBy(attempts.userId)
    .as("attempt_xp");
  const quizXp = db
    .select({
      userId: quizCompletions.userId,
      xp: sql<number>`coalesce(sum(${quizCompletions.xpAwarded}), 0)`.as("xp"),
    })
    .from(quizCompletions)
    .groupBy(quizCompletions.userId)
    .as("quiz_xp");

  return db
    .select({
      userId: users.id,
      displayName: users.displayName,
      xp: sql<number>`coalesce(${attemptXp.xp}, 0) + coalesce(${quizXp.xp}, 0)`,
    })
    .from(users)
    .leftJoin(attemptXp, eq(attemptXp.userId, users.id))
    .leftJoin(quizXp, eq(quizXp.userId, users.id))
    .where(sql`coalesce(${attemptXp.xp}, 0) + coalesce(${quizXp.xp}, 0) > 0`)
    .orderBy(desc(sql`coalesce(${attemptXp.xp}, 0) + coalesce(${quizXp.xp}, 0)`))
    .limit(limit);
}
