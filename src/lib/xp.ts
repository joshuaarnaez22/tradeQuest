import assert from "node:assert";
import type { Decision } from "@/db/schema";

// Flat constants, not a formula — PRD doesn't specify one. One-line change
// later, not a migration, if that changes.
const XP_CORRECT = 15;
const XP_WAIT_CONSOLATION = 5; // sat it out and was wrong to — costs nothing, still rewarded

export function xpForAttempt(decision: Decision, isCorrect: boolean): number {
  if (isCorrect) return XP_CORRECT;
  if (decision === "wait") return XP_WAIT_CONSOLATION;
  return 0;
}

// PRD doesn't specify a leveling formula either — flat 100 XP/level, progress
// bar shows position within the current level, not the running lifetime total.
const XP_PER_LEVEL = 100;

// Tiers, not one title per level — ~7 titles is plenty of content to write
// and read; nobody needs a unique name for level 43 specifically.
const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 100, title: "Grandmaster" },
  { minLevel: 70, title: "Master" },
  { minLevel: 40, title: "Expert" },
  { minLevel: 20, title: "Strategist" },
  { minLevel: 10, title: "Analyst" },
  { minLevel: 5, title: "Apprentice" },
  { minLevel: 1, title: "Novice" },
];

export function titleForLevel(level: number): string {
  return LEVEL_TITLES.find((t) => level >= t.minLevel)!.title;
}

export function levelForXp(xp: number): { level: number; xpIntoLevel: number; xpPerLevel: number; title: string } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { level, xpIntoLevel: xp % XP_PER_LEVEL, xpPerLevel: XP_PER_LEVEL, title: titleForLevel(level) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(titleForLevel(1), "Novice");
  assert.equal(titleForLevel(4), "Novice");
  assert.equal(titleForLevel(5), "Apprentice");
  assert.equal(titleForLevel(99), "Master");
  assert.equal(titleForLevel(100), "Grandmaster");
  assert.equal(levelForXp(0).title, "Novice");
  assert.equal(levelForXp(999).level, 10);
  assert.equal(levelForXp(999).title, "Analyst");
  console.log("xp.ts: all checks passed");
}
