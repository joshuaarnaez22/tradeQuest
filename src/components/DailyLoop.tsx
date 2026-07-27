"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { RevealOnScroll } from "./RevealOnScroll";
import { XPBar } from "./ui/XPBar";

const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);

const WEEK_DAYS = [
  { letter: "M", x: 25, boxX: 8, anim: "tqW1" },
  { letter: "T", x: 69, boxX: 52, anim: "tqW2" },
  { letter: "W", x: 113, boxX: 96, anim: "tqW3" },
  { letter: "T", x: 157, boxX: 140, anim: "tqW4" },
  { letter: "F", x: 201, boxX: 184, anim: "tqW5" },
  { letter: "S", x: 245, boxX: 228, anim: "tqW6" },
  { letter: "S", x: 289, boxX: 272, anim: "tqW7" },
];

const READ_ROWS = [
  { glyph: "✓", bg: "#22335E", fg: "#6FA0FF", label: "Higher low", tag: "Read", xp: "+15 XP", delay: 0.2 },
  { glyph: "—", bg: "#2A2444", fg: "#B3ABCB", label: "Doji at resistance", tag: "Waited", xp: "+5 XP", delay: 0.9 },
  { glyph: "✕", bg: "#4A2A1B", fg: "#FF9257", label: "False breakout", tag: "Missed", xp: "+0 XP", delay: 1.6 },
];

export function DailyLoop() {
  const xpRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(xpRef, { once: true, amount: 0.25, margin: "0px 0px -8% 0px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const [barXp, setBarXp] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = reducedMotion ? 0 : 1.1;
    const a = animate(0, 1240, { duration, ease: EASE_OUT_CUBIC, onUpdate: (v) => setDisplay(Math.round(v)) });
    const b = animate(0, 340, { duration, ease: EASE_OUT_CUBIC, onUpdate: (v) => setBarXp(Math.round(v)) });
    return () => {
      a.stop();
      b.stop();
    };
  }, [inView, reducedMotion]);

  return (
    <section id="loop" style={{ padding: "96px 20px", background: "var(--ink-900)", color: "var(--paper-0)" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-300)" }}>
            The daily loop
          </span>
          <h2 className="font-display" style={{ fontSize: "var(--text-display-2)", lineHeight: 1, margin: 0 }}>
            Show up.
            <br />
            Keep the streak.
          </h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: "var(--ink-100)", maxWidth: "46ch" }}>
            One session is five minutes. The streak is what turns five minutes into a trained eye — and XP tracks
            the reading skill, never a balance.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div
              style={{
                background: "var(--surface-card)",
                color: "var(--text-primary)",
                border: "var(--border-width-thick) solid var(--ink-900)",
                borderRadius: 24,
                padding: "20px 24px",
                boxShadow: "4px 4px 0 0 var(--orange-500)",
                display: "grid",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--text-secondary)" }}>
                Current streak
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ flex: "0 0 auto", transformBox: "fill-box", transformOrigin: "bottom center", animation: "tqFlicker 2.6s ease-in-out infinite" }}
                >
                  <path
                    d="M12 2C9 6 6 8 6 13a6 6 0 0 0 12 0c0-2-1-3-2-4 .3 2-.8 3-1.5 2.3C15 10 14 7 12 2Z"
                    fill="var(--streak-flame)"
                    stroke="var(--border-default)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 32 }}>12 days</span>
              </span>
            </div>

            <div
              style={{
                background: "var(--surface-card)",
                color: "var(--text-primary)",
                border: "var(--border-width-thick) solid var(--ink-900)",
                borderRadius: 24,
                padding: "20px 24px",
                boxShadow: "4px 4px 0 0 var(--violet-500)",
                display: "grid",
                gap: 6,
                minWidth: 200,
                position: "relative",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--text-secondary)" }}>
                Total XP
              </span>
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <span ref={xpRef} style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 32 }}>
                  {display.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--violet-500)" }}>+15 today</span>
              </span>
              <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true" style={{ position: "absolute", top: -14, right: -10, pointerEvents: "none" }}>
                <RevealOnScroll
                  as="g"
                  animation="tqBurst 700ms var(--ease-out) 200ms both"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <circle cx="30" cy="8" r="3.5" fill="var(--amber-500)" stroke="var(--ink-900)" strokeWidth="1.5" />
                  <circle cx="48" cy="22" r="3" fill="var(--mint-500)" stroke="var(--ink-900)" strokeWidth="1.5" />
                  <circle cx="14" cy="20" r="2.5" fill="var(--violet-500)" stroke="var(--ink-900)" strokeWidth="1.5" />
                  <rect x="42" y="40" width="6" height="6" rx="1.5" fill="var(--blue-500)" stroke="var(--ink-900)" strokeWidth="1.5" />
                </RevealOnScroll>
              </svg>
            </div>
          </div>

          <div style={{ maxWidth: 320 }}>
            <XPBar xp={barXp} max={500} level={7} />
          </div>
        </div>

        <div
          style={{
            background: "#151022",
            border: "var(--border-width-thick) solid var(--ink-900)",
            borderRadius: 32,
            boxShadow: "8px 8px 0 0 var(--mint-500)",
            padding: 20,
            color: "#F5F2FF",
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span className="font-display" style={{ fontSize: 18 }}>
              TradeQuest
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#B3ABCB" }}>Week 6 · 4 sessions</span>
          </div>

          <div style={{ background: "#100C1C", borderRadius: 20, padding: 16, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "#B3ABCB" }}>
                This week
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#B3ABCB" }}>7 / 7 days</span>
            </div>

            <svg viewBox="0 0 320 128" role="img" aria-label="Weekly recap: seven days completed, with a rising accuracy line." style={{ width: "100%", height: "auto", display: "block" }}>
              {WEEK_DAYS.map((d) => (
                <text key={d.letter + d.x} x={d.x} y="22" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="#B3ABCB">
                  {d.letter}
                </text>
              ))}
              {WEEK_DAYS.map((d) => (
                <g key={d.boxX}>
                  <rect x={d.boxX} y="30" width="34" height="34" rx="11" fill="#1E1836" stroke="#3A3155" strokeWidth="2" />
                  <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: `${d.anim} 7s var(--ease-bounce) infinite` }}>
                    <rect x={d.boxX} y="30" width="34" height="34" rx="11" fill="var(--violet-300)" stroke="#F5F2FF" strokeWidth="2" />
                    <path d={`M${d.boxX + 9} 47 l5 5 l10 -11`} fill="none" stroke="var(--ink-900)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
              ))}
              <text x="8" y="88" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="#B3ABCB">
                ACCURACY
              </text>
              <path
                d="M8 118 L58 112 L108 104 L158 108 L208 96 L258 90 L312 78"
                fill="none"
                stroke="var(--mint-500)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="330"
                style={{ ["--dash" as string]: 330, animation: "tqDrawLoop 7s var(--ease-out) infinite" }}
              />
              <circle
                cx="312"
                cy="78"
                r="5"
                fill="var(--mint-500)"
                stroke="#100C1C"
                strokeWidth="2"
                style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqDot 2.2s ease-in-out infinite" }}
              />
            </svg>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {READ_ROWS.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: `tqRowIn 7s var(--ease-out) ${row.delay}s infinite`,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flex: "0 0 auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius-pill)",
                    background: row.bg,
                    color: row.fg,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {row.glyph}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#B3ABCB" }}>{row.tag}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--violet-300)", whiteSpace: "nowrap" }}>
                  {row.xp}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid #2A2444", paddingTop: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Seven days straight. Accuracy up 9 points.</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--violet-300)", whiteSpace: "nowrap" }}>+20 XP</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#B3ABCB" }}>Simulated historical data. Not financial advice.</p>
        </div>
      </div>
    </section>
  );
}
