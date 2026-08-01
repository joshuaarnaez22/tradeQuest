import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { quizCompletions } from "@/db/schema";
import { LEARN_MODULES } from "@/lib/learn-modules";

export type ModuleProgress = {
  id: string;
  title: string;
  summary: string;
  passed: boolean;
  score: number | null;
  total: number | null;
  xpAwarded: number;
};

export async function getLearnHubProgress(userId: string): Promise<ModuleProgress[]> {
  const db = getDb();
  const rows = await db.select().from(quizCompletions).where(eq(quizCompletions.userId, userId));
  const byId = new Map(rows.map((r) => [r.moduleId, r]));

  return LEARN_MODULES.map((m) => {
    const row = byId.get(m.id);
    return {
      id: m.id,
      title: m.title,
      summary: m.summary,
      passed: row?.passed ?? false,
      score: row?.score ?? null,
      total: row?.total ?? null,
      xpAwarded: row?.xpAwarded ?? 0,
    };
  });
}

export async function getModuleCompletion(userId: string, moduleId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(quizCompletions)
    .where(and(eq(quizCompletions.userId, userId), eq(quizCompletions.moduleId, moduleId)))
    .limit(1);
  return row ?? null;
}
