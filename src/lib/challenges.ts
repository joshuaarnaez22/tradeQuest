import assert from "node:assert";
import type { AttemptMode } from "@/db/schema";

export const SPEED_DAILY_CAP = 3;
export const SPEED_DECISION_SECONDS = 30;
export const WEEKLY_CHALLENGE_SIZE = 5;

export const CHALLENGE_MODES = ["mistake", "speed", "weekly"] as const;
export type ChallengeMode = (typeof CHALLENGE_MODES)[number];

export function isAttemptMode(value: unknown): value is AttemptMode {
  return value === "daily" || value === "mistake" || value === "speed" || value === "weekly";
}

// ISO week id as YYYY-Www (UTC), matching the period_key stored on weekly attempts.
export function isoWeekId(now = new Date()): string {
  // Copy of the ISO-week algorithm: Thursday of this week determines the year.
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayIndex = (d.getUTCDay() + 6) % 7; // 0=Mon .. 6=Sun
  d.setUTCDate(d.getUTCDate() - dayIndex + 3); // Thursday
  const weekYear = d.getUTCFullYear();
  const week1 = new Date(Date.UTC(weekYear, 0, 4));
  const week1Day = (week1.getUTCDay() + 6) % 7;
  week1.setUTCDate(week1.getUTCDate() - week1Day); // Monday of week 1
  const week = 1 + Math.round((d.getTime() - week1.getTime()) / 86_400_000 / 7);
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}

// Deterministic Fisher-Yates seeded by the week id — same 5 puzzles for every
// player in a given ISO week, no hand-authored packs needed.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function weeklyPuzzleIds(weekId: string, publishedIds: string[], size = WEEKLY_CHALLENGE_SIZE): string[] {
  if (publishedIds.length === 0) return [];
  const ids = [...publishedIds];
  const rand = mulberry32(hashSeed(weekId));
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, Math.min(size, ids.length));
}

// Pick a speed-mode puzzle: exclude today's daily while it's still unsolved
// so a speed run can't spoil the day's chart.
export function pickSpeedPuzzleId(
  publishedIds: string[],
  todaysPuzzleId: string,
  dailyAlreadyDone: boolean,
  rng: () => number = Math.random
): string | null {
  const pool = dailyAlreadyDone ? publishedIds : publishedIds.filter((id) => id !== todaysPuzzleId);
  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)]!;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const week = isoWeekId(new Date("2026-08-03T12:00:00Z")); // Monday
  assert.equal(week, "2026-W32");
  const a = weeklyPuzzleIds("2026-W32", ["a", "b", "c", "d", "e", "f"]);
  const b = weeklyPuzzleIds("2026-W32", ["a", "b", "c", "d", "e", "f"]);
  assert.deepEqual(a, b);
  assert.equal(a.length, 5);
  assert.notDeepEqual(a, weeklyPuzzleIds("2026-W33", ["a", "b", "c", "d", "e", "f"]));

  assert.equal(pickSpeedPuzzleId(["x", "y"], "x", false, () => 0), "y");
  assert.equal(pickSpeedPuzzleId(["x"], "x", false, () => 0), null);
  assert.equal(pickSpeedPuzzleId(["x"], "x", true, () => 0), "x");
  console.log("challenges.ts: all checks passed");
}
