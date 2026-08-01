"use client";

import { useState } from "react";
import Link from "next/link";
import type { LearnModule } from "@/lib/learn-modules";

export type ClientLearnModule = Omit<LearnModule, "questions"> & {
  questions: { prompt: string; options: string[] }[];
};

type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  xpAwarded: number;
  correctIndexes: number[];
  newBadges: { id: string; title: string; description: string }[];
};

export function QuizForm({ module }: { module: ClientLearnModule }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => module.questions.map(() => null));
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  async function submit() {
    if (!allAnswered || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: module.id, answers }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch {
      setError("Could not grade the quiz — try again.");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div style={{ display: "grid", gap: 16 }} data-testid="quiz-result">
        <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
          {result.passed ? "Passed" : "Not quite"}
        </h2>
        <p style={{ margin: 0, fontSize: 15 }}>
          Score: {result.score}/{result.total}
          {result.xpAwarded > 0 ? ` · +${result.xpAwarded} XP` : result.passed ? " · XP already earned on a prior pass" : ""}
        </p>
        {result.newBadges.map((b) => (
          <div
            key={b.id}
            data-testid="new-badge-banner"
            style={{
              background: "var(--brand-subtle-bg)",
              border: "var(--border-width-thick) solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            New badge: {b.title}
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/learn/${module.id}`} style={{ fontWeight: 700, color: "var(--violet-500)" }}>
            ← Back to lesson
          </Link>
          <Link href="/learn" style={{ fontWeight: 700, color: "var(--violet-500)" }}>
            Learn hub →
          </Link>
          {!result.passed && (
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setAnswers(module.questions.map(() => null));
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--violet-500)",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {module.questions.map((q, qi) => (
        <fieldset
          key={qi}
          data-testid={`quiz-q-${qi}`}
          style={{
            margin: 0,
            padding: "18px 20px",
            border: "var(--border-width-thick) solid var(--border-default)",
            borderRadius: 20,
            background: "var(--surface-card)",
            display: "grid",
            gap: 10,
          }}
        >
          <legend style={{ fontWeight: 700, fontSize: 15, padding: "0 6px" }}>
            {qi + 1}. {q.prompt}
          </legend>
          {q.options.map((opt, oi) => (
            <label
              key={oi}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              <input
                type="radio"
                name={`q-${qi}`}
                checked={answers[qi] === oi}
                onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
              />
              <span>{opt}</span>
            </label>
          ))}
        </fieldset>
      ))}

      {error && (
        <p style={{ margin: 0, color: "var(--market-down)", fontSize: 14 }} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        data-testid="quiz-submit"
        disabled={!allAnswered || pending}
        onClick={() => void submit()}
        style={{
          justifySelf: "start",
          background: allAnswered && !pending ? "var(--violet-500)" : "var(--surface-sunken)",
          color: allAnswered && !pending ? "white" : "var(--text-secondary)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "12px 22px",
          fontWeight: 700,
          cursor: allAnswered && !pending ? "pointer" : "not-allowed",
        }}
      >
        {pending ? "Grading…" : "Submit quiz"}
      </button>
    </div>
  );
}
