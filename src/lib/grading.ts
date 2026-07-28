import type { Decision } from "@/db/schema";

// PRD §3: "was the decision aligned with what price actually did next
// (simple forward-return threshold), not vibes." Pure function, no DB/AI —
// the threshold can be tuned later without re-authoring puzzle content.
export function gradeDecision({
  decision,
  decisionClose,
  outcomeClose,
  thresholdPct,
}: {
  decision: Decision;
  decisionClose: number;
  outcomeClose: number;
  thresholdPct: number;
}): { forwardReturnPct: number; isCorrect: boolean } {
  const forwardReturnPct = ((outcomeClose - decisionClose) / decisionClose) * 100;
  const correctCall: Decision = forwardReturnPct >= thresholdPct ? "buy" : forwardReturnPct <= -thresholdPct ? "sell" : "wait";
  return { forwardReturnPct, isCorrect: decision === correctCall };
}
