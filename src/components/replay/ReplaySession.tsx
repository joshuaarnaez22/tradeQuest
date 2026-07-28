"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ReplayChart, type CandleDatum } from "./ReplayChart";
import { DecisionControls } from "./DecisionControls";
import { CandleCallBadge } from "@/components/ui/CandleCallBadge";
import { SimulatedDataBanner } from "@/components/ui/SimulatedDataBanner";
import { EASE_BOUNCE } from "@/lib/motion";
import type { Decision } from "@/db/schema";

type Result = { isCorrect: boolean; forwardReturnPct: number; explanation: string | null; xpAwarded: number };

const FALLBACK_TEXT: Record<"correct" | "incorrect" | "waitedRight" | "waitedWrong", string> = {
  correct: "Nice read — that's what happened next.",
  incorrect: "Not quite — price moved the other way.",
  waitedRight: "Right call — there was no clean edge here.",
  waitedWrong: "Fair enough — sitting out costs nothing, but there was a real move to read.",
};

function fallbackText(decision: Decision, isCorrect: boolean) {
  if (decision === "wait") return isCorrect ? FALLBACK_TEXT.waitedRight : FALLBACK_TEXT.waitedWrong;
  return isCorrect ? FALLBACK_TEXT.correct : FALLBACK_TEXT.incorrect;
}

export function ReplaySession({
  symbol,
  timeframe,
  historyCandles,
  outcomeCandles,
  lesson,
  initialDecision,
  initialResult,
}: {
  symbol: string;
  timeframe: string;
  historyCandles: CandleDatum[];
  outcomeCandles: CandleDatum[];
  lesson: { title: string; body: string } | null;
  initialDecision: Decision | null;
  initialResult: Result | null;
}) {
  const [decision, setDecision] = useState<Decision | null>(initialDecision);
  const [result, setResult] = useState<Result | null>(initialResult);
  const [pending, setPending] = useState(false);
  const [lessonDismissed, setLessonDismissed] = useState(!lesson);

  const revealed = decision !== null;

  async function handleDecide(next: Decision) {
    if (revealed || pending) return;
    setPending(true);
    setDecision(next);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch {
      setDecision(null); // let them retry
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px 64px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          {symbol}
        </h1>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-caps)",
            color: "var(--text-secondary)",
          }}
        >
          {timeframe} replay
        </span>
      </div>

      {lesson && !lessonDismissed && (
        <div
          style={{
            display: "grid",
            gap: 12,
            background: "var(--surface-card)",
            border: "var(--border-width-thick) solid var(--border-default)",
            borderRadius: 24,
            padding: "20px 24px",
            boxShadow: "var(--shadow-flat-md)",
          }}
        >
          <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
            {lesson.title}
          </h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{lesson.body}</p>
          <button
            onClick={() => setLessonDismissed(true)}
            style={{
              justifySelf: "start",
              background: "var(--violet-500)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue to puzzle →
          </button>
        </div>
      )}

      {lessonDismissed && (
        <>
          <ReplayChart historyCandles={historyCandles} outcomeCandles={outcomeCandles} revealed={revealed} />

          {!revealed && <DecisionControls onDecide={handleDecide} disabled={pending} pending={pending ? decision : null} />}
        </>
      )}

      {lessonDismissed && revealed && !result && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px" }}>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "var(--radius-pill)",
              background: "var(--violet-500)",
              animation: "tqDot 1.1s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }} role="status">
            Grading your call…
          </span>
        </div>
      )}

      {revealed && result && decision && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: [0.4, 1.12, 1] }}
          transition={{ duration: 0.42, ease: EASE_BOUNCE }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            background: "var(--surface-card)",
            border: "var(--border-width-thick) solid var(--border-default)",
            borderRadius: 24,
            padding: "16px 20px",
            boxShadow: "var(--shadow-flat-md)",
          }}
        >
          <CandleCallBadge call={decision} correct={result.isCorrect} />
          <span style={{ flex: "1 1 220px", fontSize: 15, fontWeight: 600, lineHeight: 1.45 }}>
            {result.explanation ?? fallbackText(decision, result.isCorrect)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600, color: "var(--violet-500)" }}>
            +{result.xpAwarded} XP
          </span>
        </motion.div>
      )}

      {revealed && result && <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Come back tomorrow for the next puzzle.</p>}

      <SimulatedDataBanner />
    </div>
  );
}
