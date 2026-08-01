import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, users, userBadges } from "@/db/schema";

// Derived, not stored — TECH-STACK.md: don't build a mutable counter table
// until querying `attempts` measurably doesn't scale.
export async function getUserXp(userId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${attempts.xpAwarded}), 0)` })
    .from(attempts)
    .where(eq(attempts.userId, userId));
  return Number(row?.total ?? 0);
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
  return db
    .select({
      userId: attempts.userId,
      displayName: users.displayName,
      xp: sql<number>`coalesce(sum(${attempts.xpAwarded}), 0)`,
    })
    .from(attempts)
    .innerJoin(users, eq(users.id, attempts.userId))
    .groupBy(attempts.userId, users.displayName)
    .orderBy(desc(sql`coalesce(sum(${attempts.xpAwarded}), 0)`))
    .limit(limit);
}
