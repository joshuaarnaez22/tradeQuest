import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { puzzleIndexForToday, todayUtcDateString } from "@/lib/puzzle-of-day";
import { pickSpeedPuzzleId, SPEED_DAILY_CAP } from "@/lib/challenges";
import { getSpeedRunsToday } from "@/lib/challenge-queries";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import Link from "next/link";
import { requireFeature } from "@/lib/require-feature";

export default async function SpeedChallengePage() {
  const { userId } = await auth();
  if (!userId) return null;

  const locked = await requireFeature(userId, "challenges");
  if (locked) return locked;

  const runsToday = await getSpeedRunsToday(userId);
  if (runsToday >= SPEED_DAILY_CAP) {
    return (
      <PhasePlaceholder
        title="Speed cap reached"
        note={`You've used all ${SPEED_DAILY_CAP} speed runs for today. Come back tomorrow, or try mistakes / weekly instead.`}
      />
    );
  }

  const db = getDb();
  const published = await db.select().from(puzzles).where(eq(puzzles.isPublished, true)).orderBy(puzzles.orderIndex);
  if (published.length === 0) {
    return <PhasePlaceholder title="No puzzles yet" note="Seed puzzles before running speed mode." />;
  }

  const todays = published[puzzleIndexForToday(published.length)]!;
  const [dailyDone] = await db
    .select({ id: attempts.id })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.attemptDate, todayUtcDateString()), eq(attempts.mode, "daily")))
    .limit(1);

  const pickId = pickSpeedPuzzleId(
    published.map((p) => p.id),
    todays.id,
    !!dailyDone
  );
  if (!pickId) {
    return <PhasePlaceholder title="Nothing to run" note="Solve today's puzzle first, or wait until more puzzles are published." />;
  }

  const puzzle = published.find((p) => p.id === pickId)!;
  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <div>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px 0" }}>
        <Link href="/challenges" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          ← Challenges
        </Link>
      </div>
      <ReplaySession
        mode="speed"
        puzzleId={puzzle.id}
        symbol={puzzle.symbol}
        timeframe={puzzle.timeframe}
        historyCandles={historyCandles}
        outcomeCandles={outcomeCandles}
        lesson={null}
        initialDecision={null}
        initialResult={null}
        doneMessage={`${runsToday + 1}/${SPEED_DAILY_CAP} speed runs used today.`}
      />
    </div>
  );
}
