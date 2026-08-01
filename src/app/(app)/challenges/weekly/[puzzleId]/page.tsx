import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { isoWeekId, weeklyPuzzleIds } from "@/lib/challenges";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default async function WeeklyChallengePlayPage({ params }: { params: Promise<{ puzzleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { puzzleId } = await params;

  const db = getDb();
  const weekId = isoWeekId();
  const published = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);
  const allowed = new Set(weeklyPuzzleIds(weekId, published.map((p) => p.id)));
  if (!allowed.has(puzzleId)) notFound();

  const puzzle = published.find((p) => p.id === puzzleId);
  if (!puzzle) {
    return <PhasePlaceholder title="Puzzle unavailable" note="This weekly puzzle is no longer published." />;
  }

  const [existing] = await db
    .select()
    .from(attempts)
    .where(
      and(eq(attempts.userId, userId), eq(attempts.puzzleId, puzzleId), eq(attempts.mode, "weekly"), eq(attempts.periodKey, weekId))
    )
    .limit(1);

  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <ReplaySession
      mode="weekly"
      puzzleId={puzzle.id}
      symbol={puzzle.symbol}
      timeframe={puzzle.timeframe}
      historyCandles={historyCandles}
      outcomeCandles={outcomeCandles}
      lesson={null}
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
      doneMessage="Back to Challenges for the rest of this week's set."
    />
  );
}
