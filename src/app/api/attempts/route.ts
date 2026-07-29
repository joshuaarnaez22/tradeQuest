import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles, userBadges, type Decision, decisionEnum } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { gradeDecision } from "@/lib/grading";
import { xpForAttempt } from "@/lib/xp";
import { generateExplanation } from "@/lib/ai-mentor";
import { attemptsRatelimit } from "@/lib/ratelimit";
import { checkNewlyEarnedBadges, type AttemptRecord } from "@/lib/badges";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ahead of DB/model: a legitimate user only ever needs one successful call
  // per day (the existing-attempt check below short-circuits repeats), so
  // this only has to survive rapid-retry hammering, not real traffic.
  const { success } = await attemptsRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const decision = body?.decision as Decision | undefined;
  if (!decision || !decisionEnum.includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const db = getDb();
  const attemptDate = todayUtcDateString();

  // Idempotent: a duplicate submit returns the cached result, never double-grants XP.
  const [existing] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.attemptDate, attemptDate)))
    .limit(1);
  if (existing) {
    return NextResponse.json({
      isCorrect: existing.isCorrect,
      forwardReturnPct: Number(existing.forwardReturnPct),
      explanation: existing.aiExplanation,
      xpAwarded: existing.xpAwarded,
      newBadges: [],
    });
  }

  const publishedPuzzles = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);
  if (publishedPuzzles.length === 0) {
    return NextResponse.json({ error: "No puzzles available" }, { status: 503 });
  }
  const puzzle = publishedPuzzles[puzzleIndexForToday(publishedPuzzles.length)];

  const decisionClose = puzzle.candles[puzzle.decisionIndex - 1].close;
  const outcomeClose = puzzle.candles[puzzle.decisionIndex + puzzle.outcomeWindowCandles - 1].close;
  const { forwardReturnPct, isCorrect } = gradeDecision({
    decision,
    decisionClose,
    outcomeClose,
    thresholdPct: Number(puzzle.forwardReturnThresholdPct),
  });
  const xpAwarded = xpForAttempt(decision, isCorrect);
  const explanation = await generateExplanation({ setupNote: puzzle.setupNote, decision, isCorrect, forwardReturnPct });

  await db.insert(attempts).values({
    userId,
    puzzleId: puzzle.id,
    decision,
    forwardReturnPct: forwardReturnPct.toFixed(2),
    isCorrect,
    xpAwarded,
    aiExplanation: explanation,
    attemptDate,
  });

  // Badges are a bonus layer on top of grading, not the critical path — a
  // failure here must never turn a successful grade into a failed request.
  let newBadges: { id: string; title: string; description: string }[] = [];
  try {
    const earnedRows = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
    const alreadyEarned = new Set(earnedRows.map((r) => r.badgeId));
    const history: AttemptRecord[] = await db
      .select({ date: attempts.attemptDate, isCorrect: attempts.isCorrect })
      .from(attempts)
      .where(eq(attempts.userId, userId));
    const justEarned = checkNewlyEarnedBadges(history, alreadyEarned);
    for (const badge of justEarned) {
      await db.insert(userBadges).values({ userId, badgeId: badge.id }).onConflictDoNothing({ target: [userBadges.userId, userBadges.badgeId] });
    }
    newBadges = justEarned.map(({ id, title, description }) => ({ id, title, description }));
  } catch (err) {
    console.error("Badge check failed (grading still succeeded):", err);
  }

  return NextResponse.json({ isCorrect, forwardReturnPct, explanation, xpAwarded, newBadges });
}
