import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default async function ReplayPage() {
  const { userId } = await auth();
  if (!userId) return null; // (app)/layout.tsx already redirects; defensive only

  const db = getDb();
  const publishedPuzzles = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);

  if (publishedPuzzles.length === 0) {
    return <PhasePlaceholder title="No puzzles yet" note="Run scripts/seed-dev-puzzles.ts to add dev puzzles." />;
  }

  const puzzle = publishedPuzzles[puzzleIndexForToday(publishedPuzzles.length)];
  const attemptDate = todayUtcDateString();

  const [existing] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.attemptDate, attemptDate)))
    .limit(1);

  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <ReplaySession
      symbol={puzzle.symbol}
      timeframe={puzzle.timeframe}
      historyCandles={historyCandles}
      outcomeCandles={outcomeCandles}
      initialDecision={existing?.decision ?? null}
      initialResult={
        existing
          ? {
              isCorrect: existing.isCorrect,
              forwardReturnPct: Number(existing.forwardReturnPct),
              explanation: existing.aiExplanation,
              xpAwarded: existing.xpAwarded,
            }
          : null
      }
    />
  );
}
