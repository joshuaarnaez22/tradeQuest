import assert from "node:assert";
import type { PatternType } from "@/db/schema";

// Derives a puzzle's pattern type from data already on the row — no new
// fetches. Mirrors the same forward-return math as lib/grading.ts.
export function classifyPatternType({
  historyMovePct,
  outcomeMovePct,
  thresholdPct,
}: {
  historyMovePct: number;
  outcomeMovePct: number;
  thresholdPct: number;
}): PatternType {
  const isWait = Math.abs(outcomeMovePct) < thresholdPct;
  if (isWait) return "range";

  const historyFlat = Math.abs(historyMovePct) < 1.5;
  if (historyFlat) return "breakout";

  const sameDirection = Math.sign(historyMovePct) === Math.sign(outcomeMovePct);
  return sameDirection ? "trend_continuation" : "reversal";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(classifyPatternType({ historyMovePct: 0.5, outcomeMovePct: -5, thresholdPct: 1 }), "breakout");
  assert.equal(classifyPatternType({ historyMovePct: 4, outcomeMovePct: 6, thresholdPct: 1 }), "trend_continuation");
  assert.equal(classifyPatternType({ historyMovePct: 4, outcomeMovePct: -6, thresholdPct: 1 }), "reversal");
  assert.equal(classifyPatternType({ historyMovePct: 0.2, outcomeMovePct: 0.3, thresholdPct: 1 }), "range");
  console.log("classifyPatternType: all checks passed");
}
