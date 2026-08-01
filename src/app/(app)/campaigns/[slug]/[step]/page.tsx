import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { campaignPeriodKey, getCampaign } from "@/lib/campaigns";
import { getCampaignProgress } from "@/lib/campaign-queries";
import { ReplaySession } from "@/components/replay/ReplaySession";
import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default async function CampaignMissionPage({
  params,
}: {
  params: Promise<{ slug: string; step: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;
  const { slug, step: stepRaw } = await params;
  const step = Number(stepRaw);
  if (!Number.isInteger(step) || step < 0) notFound();

  const campaign = getCampaign(slug);
  if (!campaign || step >= campaign.missions.length) notFound();

  const progress = await getCampaignProgress(userId, slug);
  if (!progress) notFound();
  const missionProgress = progress.missions[step]!;
  if (!missionProgress.unlocked) {
    return (
      <PhasePlaceholder
        title="Mission locked"
        note="Complete the previous mission in this arc before continuing."
      />
    );
  }

  const mission = campaign.missions[step]!;
  const db = getDb();
  const [puzzle] = await db
    .select()
    .from(puzzles)
    .where(and(eq(puzzles.orderIndex, mission.orderIndex), eq(puzzles.isPublished, true)))
    .limit(1);
  if (!puzzle) {
    return <PhasePlaceholder title="Puzzle unavailable" note="This campaign mission's puzzle is no longer published." />;
  }

  const periodKey = campaignPeriodKey(slug, step);
  const [existing] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "campaign"), eq(attempts.periodKey, periodKey)))
    .limit(1);

  const historyCandles = puzzle.candles.slice(0, puzzle.decisionIndex);
  const outcomeCandles = puzzle.candles.slice(puzzle.decisionIndex, puzzle.decisionIndex + puzzle.outcomeWindowCandles);

  return (
    <div>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px 0", display: "flex", gap: 16 }}>
        <Link href={`/campaigns/${slug}`} style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          ← {campaign.title}
        </Link>
      </div>
      <ReplaySession
        mode="campaign"
        puzzleId={puzzle.id}
        periodKey={periodKey}
        symbol={puzzle.symbol}
        timeframe={puzzle.timeframe}
        historyCandles={historyCandles}
        outcomeCandles={outcomeCandles}
        lesson={null}
        beat={existing ? null : { title: mission.isBoss ? `Final boss · ${mission.title}` : mission.title, body: mission.beat }}
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
        doneMessage={
          step + 1 < campaign.missions.length
            ? "Mission logged. Head back to the campaign to unlock the next beat."
            : "Arc complete — return to the campaign overview."
        }
      />
    </div>
  );
}
