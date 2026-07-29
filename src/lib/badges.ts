import assert from "node:assert";

// Badge catalog + all "is this earned" math. Definitions live here in code,
// not the database — src/lib/lessons.ts is the same pattern. Only the fact
// "user X earned badge Y at time Z" is persisted (src/db/schema.ts's
// userBadges table); everything about what a badge means and how to check
// it can change here without a migration.
export type AttemptRecord = { date: string; isCorrect: boolean };

export const WEEKLY_GOAL = 5;
export const MONTHLY_GOAL = 20;

// Monday of the ISO week containing this date, as a YYYY-MM-DD grouping key.
function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const dayIndex = (d.getUTCDay() + 6) % 7; // 0=Mon .. 6=Sun
  d.setUTCDate(d.getUTCDate() - dayIndex);
  return d.toISOString().slice(0, 10);
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

// Distinct from lib/stats.ts's computeStreak, which only computes the
// *current* streak counting back from today. This scans all history for
// the longest run of consecutive days found anywhere — a lapsed streak
// still counts once it's happened.
export function longestStreakEver(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let current = 0;
  let prevTime: number | null = null;
  for (const dateStr of sorted) {
    const time = new Date(dateStr + "T00:00:00Z").getTime();
    const diffDays = prevTime === null ? null : Math.round((time - prevTime) / 86_400_000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    prevTime = time;
  }
  return longest;
}

function maxAttemptsInAnyGroup(records: AttemptRecord[], keyFn: (date: string) => string): number {
  const counts = new Map<string, number>();
  for (const r of records) counts.set(keyFn(r.date), (counts.get(keyFn(r.date)) ?? 0) + 1);
  return counts.size ? Math.max(...counts.values()) : 0;
}

function hasPerfectWeekEver(records: AttemptRecord[]): boolean {
  const counts = new Map<string, { total: number; correct: number }>();
  for (const r of records) {
    const key = isoWeekKey(r.date);
    const entry = counts.get(key) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
    counts.set(key, entry);
  }
  return [...counts.values()].some((v) => v.total === 7 && v.correct === 7);
}

export type Badge = { id: string; title: string; description: string; isEarned: (records: AttemptRecord[]) => boolean };

export const BADGES: Badge[] = [
  { id: "streak_3", title: "3-Day Streak", description: "Reach a 3-day streak.", isEarned: (r) => longestStreakEver(r.map((x) => x.date)) >= 3 },
  { id: "streak_7", title: "7-Day Streak", description: "Reach a 7-day streak.", isEarned: (r) => longestStreakEver(r.map((x) => x.date)) >= 7 },
  { id: "streak_30", title: "30-Day Streak", description: "Reach a 30-day streak.", isEarned: (r) => longestStreakEver(r.map((x) => x.date)) >= 30 },
  { id: "solved_10", title: "10 Puzzles Solved", description: "Solve 10 puzzles.", isEarned: (r) => r.length >= 10 },
  { id: "solved_50", title: "50 Puzzles Solved", description: "Solve 50 puzzles.", isEarned: (r) => r.length >= 50 },
  { id: "solved_100", title: "100 Puzzles Solved", description: "Solve 100 puzzles.", isEarned: (r) => r.length >= 100 },
  { id: "first_correct", title: "First Correct Call", description: "Get your first correct read.", isEarned: (r) => r.some((x) => x.isCorrect) },
  { id: "perfect_week", title: "Perfect Week", description: "Solve all 7 days of a week correctly.", isEarned: hasPerfectWeekEver },
  {
    id: "first_weekly_goal",
    title: "Weekly Goal Met",
    description: `Solve ${WEEKLY_GOAL} puzzles in one week.`,
    isEarned: (r) => maxAttemptsInAnyGroup(r, isoWeekKey) >= WEEKLY_GOAL,
  },
  {
    id: "first_monthly_goal",
    title: "Monthly Goal Met",
    description: `Solve ${MONTHLY_GOAL} puzzles in one month.`,
    isEarned: (r) => maxAttemptsInAnyGroup(r, monthKey) >= MONTHLY_GOAL,
  },
];

export function checkNewlyEarnedBadges(records: AttemptRecord[], alreadyEarnedIds: Set<string>): Badge[] {
  return BADGES.filter((b) => !alreadyEarnedIds.has(b.id) && b.isEarned(records));
}

// Live, ungated progress for the dashboard's goal bars — not tied to
// whether first_weekly_goal/first_monthly_goal have been earned yet.
export function currentPeriodProgress(records: AttemptRecord[], today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  const weekKey = isoWeekKey(todayStr);
  const monthKeyToday = monthKey(todayStr);
  return {
    weekCount: records.filter((r) => isoWeekKey(r.date) === weekKey).length,
    weekGoal: WEEKLY_GOAL,
    monthCount: records.filter((r) => monthKey(r.date) === monthKeyToday).length,
    monthGoal: MONTHLY_GOAL,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(longestStreakEver([]), 0);
  assert.equal(longestStreakEver(["2026-01-01"]), 1);
  assert.equal(longestStreakEver(["2026-01-01", "2026-01-02", "2026-01-03"]), 3);
  assert.equal(longestStreakEver(["2026-01-01", "2026-01-03"]), 1); // gap breaks it
  assert.equal(longestStreakEver(["2026-01-05", "2026-01-01", "2026-01-02"]), 2); // unsorted input, still finds the run

  const perfectWeek: AttemptRecord[] = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11"].map(
    (date) => ({ date, isCorrect: true })
  ); // Mon 1/5 .. Sun 1/11
  assert.equal(hasPerfectWeekEver(perfectWeek), true);
  assert.equal(hasPerfectWeekEver([...perfectWeek.slice(0, 6), { date: "2026-01-11", isCorrect: false }]), false);

  const justEarned = checkNewlyEarnedBadges([{ date: "2026-01-01", isCorrect: true }], new Set());
  assert.ok(justEarned.some((b) => b.id === "first_correct"));
  assert.ok(!checkNewlyEarnedBadges([{ date: "2026-01-01", isCorrect: true }], new Set(["first_correct"])).some((b) => b.id === "first_correct"));

  console.log("badges.ts: all checks passed");
}
