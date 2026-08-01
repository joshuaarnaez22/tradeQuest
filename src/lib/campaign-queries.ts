import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, puzzles } from "@/db/schema";
import { CAMPAIGNS, campaignPeriodKey, getCampaign, type Campaign } from "@/lib/campaigns";

export type MissionProgress = {
  index: number;
  title: string;
  beat: string;
  isBoss: boolean;
  orderIndex: number;
  puzzleId: string | null;
  symbol: string | null;
  unlocked: boolean;
  completed: boolean;
  isCorrect: boolean | null;
};

export type CampaignProgress = {
  campaign: Campaign;
  completed: number;
  total: number;
  missions: MissionProgress[];
  cleared: boolean;
};

export async function getCampaignProgress(userId: string, slug: string): Promise<CampaignProgress | null> {
  const campaign = getCampaign(slug);
  if (!campaign) return null;

  const db = getDb();
  const orderIndexes = campaign.missions.map((m) => m.orderIndex);
  const puzzleRows = await db
    .select({ id: puzzles.id, orderIndex: puzzles.orderIndex, symbol: puzzles.symbol })
    .from(puzzles)
    .where(and(eq(puzzles.isPublished, true), inArray(puzzles.orderIndex, orderIndexes)));
  const byOrder = new Map(puzzleRows.map((p) => [p.orderIndex, p]));

  const periodKeys = campaign.missions.map((_, i) => campaignPeriodKey(slug, i));
  const attemptRows = await db
    .select({ periodKey: attempts.periodKey, isCorrect: attempts.isCorrect })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.mode, "campaign"), inArray(attempts.periodKey, periodKeys)));
  const byKey = new Map(attemptRows.map((a) => [a.periodKey!, a]));

  const missions: MissionProgress[] = campaign.missions.map((m, i) => {
    const puzzle = byOrder.get(m.orderIndex) ?? null;
    const attempt = byKey.get(campaignPeriodKey(slug, i));
    const priorDone = i === 0 || byKey.has(campaignPeriodKey(slug, i - 1));
    return {
      index: i,
      title: m.title,
      beat: m.beat,
      isBoss: !!m.isBoss,
      orderIndex: m.orderIndex,
      puzzleId: puzzle?.id ?? null,
      symbol: puzzle?.symbol ?? null,
      unlocked: priorDone,
      completed: !!attempt,
      isCorrect: attempt?.isCorrect ?? null,
    };
  });

  const completed = missions.filter((m) => m.completed).length;
  return {
    campaign,
    completed,
    total: missions.length,
    missions,
    cleared: completed === missions.length && missions.length > 0,
  };
}

export async function getAllCampaignProgress(userId: string): Promise<CampaignProgress[]> {
  const results: CampaignProgress[] = [];
  for (const c of CAMPAIGNS) {
    const progress = await getCampaignProgress(userId, c.slug);
    if (progress) results.push(progress);
  }
  return results;
}
