import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { getMistakeQueue } from "@/lib/challenge-queries";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default async function MistakeReplayPage({ params }: { params: Promise<{ puzzleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { puzzleId } = await params;

  const queue = await getMistakeQueue(userId);
  const inQueue = queue.some((q) => q.id === puzzleId);

  const db = getDb();
  const [cleared] = await db
    .select()
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, userId),
        eq(attempts.puzzleId, puzzleId),
        eq(attempts.mode, "mistake"),
        eq(attempts.isCorrect, true)
      )
    )
    .limit(1);

  if (!inQueue && !cleared) notFound();

  const [puzzle] = await db.select().from(puzzles).where(and(eq(puzzles.id, puzzleId), eq(puzzles.isPublished, true))).limit(1);
  if (!puzzle) {
    return <PhasePlaceholder title="Puzzle unavailable" note="This mistake puzzle is no longer published." />;
  }

  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <ReplaySession
      mode="mistake"
      puzzleId={puzzle.id}
      symbol={puzzle.symbol}
      timeframe={puzzle.timeframe}
      historyCandles={historyCandles}
      outcomeCandles={outcomeCandles}
      lesson={null}
      initialDecision={cleared?.decision ?? null}
      initialResult={
        cleared
          ? {
              isCorrect: cleared.isCorrect,
              forwardReturnPct: Number(cleared.forwardReturnPct),
              explanation: cleared.aiExplanation,
              xpAwarded: cleared.xpAwarded,
              newBadges: [],
            }
          : null
      }
      doneMessage="Back to Challenges to pick another mistake."
    />
  );
}
