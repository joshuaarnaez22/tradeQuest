import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { getStruggleForPatternType } from "@/lib/learning";
import { LESSONS } from "@/lib/lessons";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default async function ReplayPage() {
  const { userId } = await auth();
  if (!userId) return null; // (app)/layout.tsx already redirects; defensive only

  const db = getDb();
  const attemptDate = todayUtcDateString();

  const [existing] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.attemptDate, attemptDate)))
    .limit(1);

  // An existing attempt pins which puzzle "today" actually was — re-deriving
  // via puzzleIndexForToday(count) here would drift if the published puzzle
  // count changes (publish/unpublish) after the attempt was graded, showing
  // today's *new* puzzle next to the *old* cached grade/explanation.
  let puzzle;
  if (existing) {
    [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, existing.puzzleId)).limit(1);
  } else {
    const publishedPuzzles = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);
    if (publishedPuzzles.length === 0) {
      return <PhasePlaceholder title="No puzzles yet" note="Run scripts/seed-dev-puzzles.ts to add dev puzzles." />;
    }
    puzzle = publishedPuzzles[puzzleIndexForToday(publishedPuzzles.length)];
  }

  if (!puzzle) {
    return <PhasePlaceholder title="Puzzle unavailable" note="Today's graded puzzle is no longer published." />;
  }

  // Only worth checking (and only meaningful) for a fresh puzzle — an
  // already-graded today doesn't need a lesson gate in front of it.
  const lesson = !existing && (await getStruggleForPatternType(userId, puzzle.patternType)) ? LESSONS[puzzle.patternType] : null;

  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <ReplaySession
      symbol={puzzle.symbol}
      timeframe={puzzle.timeframe}
      historyCandles={historyCandles}
      outcomeCandles={outcomeCandles}
      lesson={lesson}
      initialDecision={existing?.decision ?? null}
      initialResult={
        existing
          ? {
              isCorrect: existing.isCorrect,
              forwardReturnPct: Number(existing.forwardReturnPct),
              explanation: existing.aiExplanation,
              xpAwarded: existing.xpAwarded,
              newBadges: [],
            }
          : null
      }
    />
  );
}
