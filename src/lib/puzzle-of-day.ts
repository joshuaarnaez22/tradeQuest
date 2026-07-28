// Pure function: today's puzzle index. No cron needed for this — computed on request.
export function puzzleIndexForToday(publishedCount: number, now = new Date()): number {
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  return dayOfYear % publishedCount;
}

// UTC calendar date as YYYY-MM-DD — the value stored in attempts.attempt_date.
export function todayUtcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
