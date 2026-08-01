import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { quizCompletions, userBadges } from "@/db/schema";
import { getLearnModule, gradeQuiz, QUIZ_PASS_XP } from "@/lib/learn-modules";
import { attemptsRatelimit } from "@/lib/ratelimit";
import { checkNewlyEarnedLearnBadges } from "@/lib/badges";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await attemptsRatelimit.limit(`quiz:${userId}`);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const moduleId = typeof body?.moduleId === "string" ? body.moduleId : "";
  const answers = Array.isArray(body?.answers) ? (body.answers as unknown[]) : null;
  const mod = getLearnModule(moduleId);
  if (!mod || !answers || answers.length !== mod.questions.length || answers.some((a) => typeof a !== "number")) {
    return NextResponse.json({ error: "Invalid quiz submission" }, { status: 400 });
  }

  const graded = gradeQuiz(mod, answers as number[]);
  const db = getDb();

  const [existing] = await db
    .select()
    .from(quizCompletions)
    .where(and(eq(quizCompletions.userId, userId), eq(quizCompletions.moduleId, moduleId)))
    .limit(1);

  const alreadyAwardedXp = (existing?.xpAwarded ?? 0) > 0;
  // On retry after a prior pass that already got XP, keep the stored xp_awarded.
  const xpToStore = alreadyAwardedXp ? existing!.xpAwarded : graded.passed ? QUIZ_PASS_XP : 0;

  if (existing) {
    await db
      .update(quizCompletions)
      .set({
        score: graded.score,
        total: graded.total,
        passed: graded.passed || existing.passed, // once passed, stay passed
        xpAwarded: xpToStore,
        updatedAt: new Date(),
      })
      .where(and(eq(quizCompletions.userId, userId), eq(quizCompletions.moduleId, moduleId)));
  } else {
    await db.insert(quizCompletions).values({
      userId,
      moduleId,
      score: graded.score,
      total: graded.total,
      passed: graded.passed,
      xpAwarded: xpToStore,
    });
  }

  let newBadges: { id: string; title: string; description: string }[] = [];
  try {
    const passedRows = await db
      .select({ moduleId: quizCompletions.moduleId })
      .from(quizCompletions)
      .where(and(eq(quizCompletions.userId, userId), eq(quizCompletions.passed, true)));
    // Include this submission if it just passed but the update race hasn't reflected yet.
    const passedIds = new Set(passedRows.map((r) => r.moduleId));
    if (graded.passed) passedIds.add(moduleId);

    const earnedRows = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
    const alreadyEarned = new Set(earnedRows.map((r) => r.badgeId));
    const justEarned = checkNewlyEarnedLearnBadges(passedIds, alreadyEarned);
    for (const badge of justEarned) {
      await db.insert(userBadges).values({ userId, badgeId: badge.id }).onConflictDoNothing({ target: [userBadges.userId, userBadges.badgeId] });
    }
    newBadges = justEarned.map(({ id, title, description }) => ({ id, title, description }));
  } catch (err) {
    console.error("Learn badge check failed (quiz still graded):", err);
  }

  return NextResponse.json({
    score: graded.score,
    total: graded.total,
    passed: graded.passed,
    xpAwarded: alreadyAwardedXp ? 0 : graded.passed ? QUIZ_PASS_XP : 0,
    correctIndexes: graded.correctIndexes,
    newBadges,
  });
}
