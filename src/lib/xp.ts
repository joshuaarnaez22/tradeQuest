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

export function levelForXp(xp: number): { level: number; xpIntoLevel: number; xpPerLevel: number } {
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, xpIntoLevel: xp % XP_PER_LEVEL, xpPerLevel: XP_PER_LEVEL };
}
