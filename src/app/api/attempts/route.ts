import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles, userBadges, type AttemptMode, type Decision, decisionEnum } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { gradeDecision } from "@/lib/grading";
import { xpForAttempt } from "@/lib/xp";
import { generateExplanation } from "@/lib/ai-mentor";
import { attemptsRatelimit } from "@/lib/ratelimit";
import { checkNewlyEarnedBadges, type AttemptRecord } from "@/lib/badges";
import { isAttemptMode, isoWeekId, SPEED_DAILY_CAP, weeklyPuzzleIds } from "@/lib/challenges";
import { campaignPeriodKey, getCampaign, parseCampaignPeriodKey } from "@/lib/campaigns";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ahead of DB/model: a legitimate user only ever needs one successful call
  // per day for daily mode (the existing-attempt check below short-circuits
  // repeats), so this only has to survive rapid-retry hammering, not real traffic.
  const { success } = await attemptsRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const mode: AttemptMode = isAttemptMode(body?.mode) ? body.mode : "daily";
  const timedOut = body?.timedOut === true;
  const clientPuzzleId = typeof body?.puzzleId === "string" ? body.puzzleId : undefined;
  const clientPeriodKey = typeof body?.periodKey === "string" ? body.periodKey : undefined;

  let decision = body?.decision as Decision | undefined;
  if (timedOut && mode === "speed") {
    decision = "wait"; // stored shape only — graded as incorrect with 0 XP below
  } else if (!decision || !decisionEnum.includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  if (mode !== "daily" && !clientPuzzleId) {
    return NextResponse.json({ error: "puzzleId required for challenge modes" }, { status: 400 });
  }
  if (mode === "campaign" && !clientPeriodKey) {
    return NextResponse.json({ error: "periodKey required for campaign mode" }, { status: 400 });
  }

  const db = getDb();
  const attemptDate = todayUtcDateString();
  const weekId = isoWeekId();

  // --- Daily idempotency (one per UTC day) ---
  if (mode === "daily") {
    const [existing] = await db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.attemptDate, attemptDate), eq(attempts.mode, "daily")))
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
  }

  // --- Weekly idempotency (one per puzzle per ISO week) ---
  if (mode === "weekly" && clientPuzzleId) {
    const [existing] = await db
      .select()
      .from(attempts)
      .where(
        and(
          eq(attempts.userId, userId),
          eq(attempts.puzzleId, clientPuzzleId),
          eq(attempts.mode, "weekly"),
          eq(attempts.periodKey, weekId)
        )
      )
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
  }

  // --- Campaign idempotency (one per mission) ---
  if (mode === "campaign" && clientPeriodKey) {
    const [existing] = await db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.mode, "campaign"), eq(attempts.periodKey, clientPeriodKey)))
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
  }

  const publishedPuzzles = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);
  if (publishedPuzzles.length === 0) {
    return NextResponse.json({ error: "No puzzles available" }, { status: 503 });
  }

  let puzzle;
  let periodKey: string | null = null;

  if (mode === "daily") {
    puzzle = publishedPuzzles[puzzleIndexForToday(publishedPuzzles.length)];
  } else {
    puzzle = publishedPuzzles.find((p) => p.id === clientPuzzleId);
    if (!puzzle) return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });

    if (mode === "mistake") {
      // Must have an incorrect daily attempt on this puzzle.
      const [wrongDaily] = await db
        .select({ id: attempts.id })
        .from(attempts)
        .where(
          and(
            eq(attempts.userId, userId),
            eq(attempts.puzzleId, puzzle.id),
            eq(attempts.mode, "daily"),
            eq(attempts.isCorrect, false)
          )
        )
        .limit(1);
      if (!wrongDaily) {
        return NextResponse.json({ error: "Puzzle is not in your mistakes queue" }, { status: 400 });
      }
    }

    if (mode === "weekly") {
      const allowed = new Set(weeklyPuzzleIds(weekId, publishedPuzzles.map((p) => p.id)));
      if (!allowed.has(puzzle.id)) {
        return NextResponse.json({ error: "Puzzle is not in this week's challenge" }, { status: 400 });
      }
      periodKey = weekId;
    }

    if (mode === "speed") {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(attempts)
        .where(and(eq(attempts.userId, userId), eq(attempts.mode, "speed"), eq(attempts.attemptDate, attemptDate)));
      if (Number(count) >= SPEED_DAILY_CAP) {
        return NextResponse.json({ error: `Speed mode capped at ${SPEED_DAILY_CAP} runs per day` }, { status: 429 });
      }
    }

    if (mode === "campaign" && clientPeriodKey) {
      const parsed = parseCampaignPeriodKey(clientPeriodKey);
      if (!parsed || !getCampaign(parsed.slug)) {
        return NextResponse.json({ error: "Unknown campaign mission" }, { status: 400 });
      }
      const campaign = getCampaign(parsed.slug)!;
      const mission = campaign.missions[parsed.missionIndex];
      if (!mission || mission.orderIndex !== puzzle.orderIndex) {
        return NextResponse.json({ error: "Puzzle does not match campaign mission" }, { status: 400 });
      }
      if (parsed.missionIndex > 0) {
        const priorKey = campaignPeriodKey(parsed.slug, parsed.missionIndex - 1);
        const [prior] = await db
          .select({ id: attempts.id })
          .from(attempts)
          .where(and(eq(attempts.userId, userId), eq(attempts.mode, "campaign"), eq(attempts.periodKey, priorKey)))
          .limit(1);
        if (!prior) {
          return NextResponse.json({ error: "Previous mission not completed" }, { status: 400 });
        }
      }
      periodKey = clientPeriodKey;
    }
  }

  const decisionClose = puzzle.candles[puzzle.decisionIndex - 1].close;
  const outcomeClose = puzzle.candles[puzzle.decisionIndex + puzzle.outcomeWindowCandles - 1].close;

  let forwardReturnPct: number;
  let isCorrect: boolean;
  let xpAwarded: number;

  if (timedOut && mode === "speed") {
    // Timeout: always incorrect, 0 XP — don't use wait-consolation.
    const graded = gradeDecision({
      decision: "wait",
      decisionClose,
      outcomeClose,
      thresholdPct: Number(puzzle.forwardReturnThresholdPct),
    });
    forwardReturnPct = graded.forwardReturnPct;
    isCorrect = false;
    xpAwarded = 0;
  } else {
    const graded = gradeDecision({
      decision: decision!,
      decisionClose,
      outcomeClose,
      thresholdPct: Number(puzzle.forwardReturnThresholdPct),
    });
    forwardReturnPct = graded.forwardReturnPct;
    isCorrect = graded.isCorrect;
    xpAwarded = xpForAttempt(decision!, isCorrect);

    // Mistake XP-once: already earned XP on a correct mistake attempt for this puzzle → 0.
    if (mode === "mistake" && isCorrect) {
      const [priorCorrect] = await db
        .select({ id: attempts.id })
        .from(attempts)
        .where(
          and(
            eq(attempts.userId, userId),
            eq(attempts.puzzleId, puzzle.id),
            eq(attempts.mode, "mistake"),
            eq(attempts.isCorrect, true)
          )
        )
        .limit(1);
      if (priorCorrect) xpAwarded = 0;
    }
  }

  const explanation = await generateExplanation({
    setupNote: puzzle.setupNote,
    decision: decision!,
    isCorrect,
    forwardReturnPct,
  });

  await db.insert(attempts).values({
    userId,
    puzzleId: puzzle.id,
    decision: decision!,
    forwardReturnPct: forwardReturnPct.toFixed(2),
    isCorrect,
    xpAwarded,
    aiExplanation: explanation,
    attemptDate,
    mode,
    periodKey,
  });

  // Badges are a bonus layer on top of grading, not the critical path — a
  // failure here must never turn a successful grade into a failed request.
  let newBadges: { id: string; title: string; description: string }[] = [];
  try {
    const earnedRows = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
    const alreadyEarned = new Set(earnedRows.map((r) => r.badgeId));
    const history: AttemptRecord[] = await db
      .select({
        date: attempts.attemptDate,
        isCorrect: attempts.isCorrect,
        mode: attempts.mode,
        periodKey: attempts.periodKey,
      })
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
