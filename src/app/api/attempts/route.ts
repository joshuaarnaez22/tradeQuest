import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles, type Decision, decisionEnum } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { gradeDecision } from "@/lib/grading";
import { xpForAttempt } from "@/lib/xp";
import { generateExplanation } from "@/lib/ai-mentor";
import { attemptsRatelimit } from "@/lib/ratelimit";

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

  return NextResponse.json({ isCorrect, forwardReturnPct, explanation, xpAwarded });
}
