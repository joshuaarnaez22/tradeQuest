"use client";

import { motion } from "motion/react";
import { RevealOnScroll } from "./RevealOnScroll";

const cardBase = {
  border: "var(--border-width-thick) solid var(--ink-900)",
  borderRadius: 28,
  padding: 28,
  boxShadow: "var(--shadow-flat-md)",
  display: "grid",
  gap: 16,
  alignContent: "start",
  color: "var(--ink-900)",
} as const;

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: "96px 20px", background: "var(--surface-page)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 48 }}>
        <div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            How it works
          </span>
          <h2 className="font-display" style={{ fontSize: "var(--text-display-2)", lineHeight: 1, margin: 0 }}>
            Three steps.
            <br />
            Five minutes a day.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          <RevealOnScroll
            as={motion.div}
            animation="tqRise 620ms var(--ease-out) both"
            whileHover={{ x: -3, y: -3, boxShadow: "var(--shadow-flat-lg)" }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardBase, background: "var(--blue-500)" }}
          >
            <svg viewBox="0 0 120 90" aria-hidden="true" style={{ width: "100%", maxWidth: 180, height: "auto" }}>
              <line x1="6" y1="80" x2="114" y2="80" stroke="var(--ink-900)" strokeWidth="2.5" strokeLinecap="round" />
              <g stroke="var(--ink-900)" strokeWidth="2.5" strokeLinecap="round">
                <g style={{ transformBox: "fill-box", transformOrigin: "bottom", animation: "tqStep1 5s var(--ease-out) infinite" }}>
                  <line x1="20" y1="42" x2="20" y2="70" />
                  <rect x="14" y="48" width="12" height="18" rx="2" fill="var(--paper-0)" />
                </g>
                <g style={{ transformBox: "fill-box", transformOrigin: "bottom", animation: "tqStep2 5s var(--ease-out) infinite" }}>
                  <line x1="46" y1="28" x2="46" y2="62" />
                  <rect x="40" y="34" width="12" height="22" rx="2" fill="var(--ink-900)" />
                </g>
                <g style={{ transformBox: "fill-box", transformOrigin: "bottom", animation: "tqStep3 5s var(--ease-out) infinite" }}>
                  <line x1="72" y1="34" x2="72" y2="66" />
                  <rect x="66" y="40" width="12" height="18" rx="2" fill="var(--paper-0)" />
                </g>
                <g style={{ transformBox: "fill-box", transformOrigin: "bottom", animation: "tqStep4 5s var(--ease-out) infinite" }}>
                  <line x1="98" y1="16" x2="98" y2="54" />
                  <rect x="92" y="22" width="12" height="26" rx="2" fill="var(--ink-900)" />
                </g>
              </g>
            </svg>
            <h3 className="font-display" style={{ fontSize: 34, lineHeight: 1, margin: 0 }}>
              01 · Replay
            </h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
              Pick a real market from history. Candles arrive one at a time, exactly as they did on the day — no
              hindsight, no headlines.
            </p>
          </RevealOnScroll>

          <RevealOnScroll
            as={motion.div}
            animation="tqRise 620ms var(--ease-out) 120ms both"
            whileHover={{ x: -3, y: -3, boxShadow: "var(--shadow-flat-lg)" }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardBase, background: "var(--amber-500)" }}
          >
            <svg viewBox="0 0 120 90" aria-hidden="true" style={{ width: "100%", maxWidth: 180, height: "auto" }}>
              <g stroke="var(--ink-900)" strokeWidth="2.5">
                <g>
                  <rect x="8" y="12" width="104" height="20" rx="10" fill="var(--paper-0)" />
                  <text x="60" y="26" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fontWeight="800" stroke="none" fill="var(--ink-900)">
                    BUY ▲
                  </text>
                </g>
                <g style={{ animation: "tqPressLoop 3.2s var(--ease-out) infinite" }}>
                  <rect x="8" y="36" width="104" height="20" rx="10" fill="var(--violet-500)" />
                  <text x="60" y="50" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fontWeight="800" stroke="none" fill="var(--paper-0)">
                    WAIT
                  </text>
                </g>
                <g>
                  <rect x="8" y="60" width="104" height="20" rx="10" fill="var(--paper-0)" />
                  <text x="60" y="74" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fontWeight="800" stroke="none" fill="var(--ink-900)">
                    SELL ▼
                  </text>
                </g>
              </g>
            </svg>
            <h3 className="font-display" style={{ fontSize: 34, lineHeight: 1, margin: 0 }}>
              02 · Decide
            </h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
              Buy, sell or wait. Waiting counts as a call — patience is a skill the scoreboard respects.
            </p>
          </RevealOnScroll>

          <RevealOnScroll
            as={motion.div}
            animation="tqRise 620ms var(--ease-out) 240ms both"
            whileHover={{ x: -3, y: -3, boxShadow: "var(--shadow-flat-lg)" }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardBase, background: "var(--mint-500)" }}
          >
            <svg viewBox="0 0 120 90" aria-hidden="true" style={{ width: "100%", maxWidth: 180, height: "auto" }}>
              <circle
                cx="60"
                cy="45"
                r="32"
                fill="var(--paper-0)"
                stroke="var(--ink-900)"
                strokeWidth="2.5"
                style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqThrob 3.4s ease-in-out infinite" }}
              />
              <path
                d="M44 46l11 12 22-25"
                fill="none"
                stroke="var(--ink-900)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                style={{ ["--dash" as string]: 60, animation: "tqDrawLoop 3.4s var(--ease-out) infinite" }}
              />
            </svg>
            <h3 className="font-display" style={{ fontSize: 34, lineHeight: 1, margin: 0 }}>
              03 · Learn
            </h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
              The next candle reveals itself, and a short explanation names the pattern you just read. Then you go
              again.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
