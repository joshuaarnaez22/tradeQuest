"use client";

import { motion } from "motion/react";
import { RevealOnScroll } from "./RevealOnScroll";

const cardBase = {
  position: "relative",
  overflow: "hidden",
  border: "var(--border-width-thick) solid var(--ink-900)",
  borderRadius: 28,
  padding: 28,
  boxShadow: "var(--shadow-flat-md)",
  minHeight: 400,
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: 14,
  color: "var(--ink-900)",
} as const;

const illoWrap = {
  alignSelf: "end",
  justifySelf: "end",
  width: "78%",
  maxWidth: 190,
  height: "auto",
  margin: "0 -8px -14px 0",
} as const;

const hoverProps = {
  whileHover: { x: -3, y: -3, boxShadow: "var(--shadow-flat-lg)" },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
};

export function WhyNotGambling() {
  return (
    <section id="fair" style={{ padding: "96px 20px", background: "var(--surface-page)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 48 }}>
        <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: "max-content",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--violet-100)",
              color: "var(--violet-500)",
            }}
          >
            Straight answer
          </span>
          <h2 className="font-display" style={{ fontSize: "var(--text-display-2)", lineHeight: 1, margin: 0 }}>
            Why this isn&apos;t gambling
          </h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: "var(--text-secondary)", maxWidth: "56ch" }}>
            There is nothing to stake and nothing to win. TradeQuest is a practice tool for reading charts, and it
            is built to be honest about that.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(228px,1fr))", gap: 20 }}>
          {/* Card 1: It already happened */}
          <RevealOnScroll as={motion.div} animation="tqRise 620ms var(--ease-out) both" {...hoverProps} style={{ ...cardBase, background: "var(--amber-500)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <h3 className="font-display" style={{ fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 0.92, margin: 0 }}>
                It already
                <br />
                happened
              </h3>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.45, maxWidth: "24ch" }}>
                Every session replays a market that closed years ago — a record to study, not an outcome to bet on.
              </p>
            </div>
            <svg viewBox="0 0 150 130" aria-hidden="true" style={illoWrap}>
              <g
                stroke="var(--ink-900)"
                strokeWidth="3.4"
                strokeLinejoin="round"
                style={{ transformBox: "fill-box", transformOrigin: "center bottom", animation: "tqSway 4.6s ease-in-out infinite" }}
              >
                <RevealOnScroll as="g" animation="tqStack 520ms var(--ease-bounce) 240ms both">
                  <path d="M24 96 L75 110 L75 122 L24 108 Z" fill="var(--violet-500)" />
                  <path d="M75 110 L126 96 L126 108 L75 122 Z" fill="var(--violet-300)" />
                  <path d="M75 82 L126 96 L75 110 L24 96 Z" fill="var(--paper-0)" />
                </RevealOnScroll>
                <RevealOnScroll as="g" animation="tqStack 520ms var(--ease-bounce) 130ms both">
                  <path d="M24 78 L75 92 L75 104 L24 90 Z" fill="var(--blue-700)" />
                  <path d="M75 92 L126 78 L126 90 L75 104 Z" fill="var(--blue-500)" />
                  <path d="M75 64 L126 78 L75 92 L24 78 Z" fill="var(--paper-0)" />
                </RevealOnScroll>
                <RevealOnScroll as="g" animation="tqStack 520ms var(--ease-bounce) 20ms both">
                  <path d="M24 60 L75 74 L75 86 L24 72 Z" fill="var(--ink-700)" />
                  <path d="M75 74 L126 60 L126 72 L75 86 Z" fill="var(--ink-500)" />
                  <path d="M75 46 L126 60 L75 74 L24 60 Z" fill="var(--paper-0)" />
                </RevealOnScroll>
                <circle cx="75" cy="30" r="24" fill="var(--paper-0)" />
                <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqRewind 6s linear infinite" }}>
                  <path d="M75 30 L75 16" fill="none" strokeLinecap="round" />
                  <path d="M75 30 L86 36" fill="none" strokeLinecap="round" />
                </g>
                <path
                  d="M40 22 L30 30 L40 38 Z"
                  fill="var(--orange-500)"
                  style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqDot 1.6s ease-in-out infinite" }}
                />
              </g>
            </svg>
          </RevealOnScroll>

          {/* Card 2: Discipline is the score */}
          <RevealOnScroll as={motion.div} animation="tqRise 620ms var(--ease-out) 110ms both" {...hoverProps} style={{ ...cardBase, background: "var(--blue-500)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <h3 className="font-display" style={{ fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 0.92, margin: 0 }}>
                Discipline
                <br />
                is the score
              </h3>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.45, maxWidth: "24ch" }}>
                XP rewards patient, well-read calls — including the choice to wait. No score is ever shown as money.
              </p>
            </div>
            <svg viewBox="0 0 150 130" aria-hidden="true" style={illoWrap}>
              <g stroke="var(--ink-900)" strokeWidth="3.4" strokeLinejoin="round">
                <path d="M28 104 L75 117 L75 128 L28 115 Z" fill="var(--violet-500)" />
                <path d="M75 117 L122 104 L122 115 L75 128 Z" fill="var(--violet-300)" />
                <path d="M75 91 L122 104 L75 117 L28 104 Z" fill="var(--paper-0)" />
                <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqBob 3.2s ease-in-out infinite" }}>
                  <path d="M60 64 L54 96 L75 88 L96 96 L90 64 Z" fill="var(--orange-500)" />
                  <circle cx="75" cy="52" r="30" fill="var(--amber-500)" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqSway 5.2s ease-in-out infinite" }} />
                  <circle cx="75" cy="52" r="21" fill="var(--paper-0)" />
                  <RevealOnScroll
                    as="path"
                    animation="tqDraw 640ms var(--ease-out) 420ms both"
                    d="M64 53 L72 62 L87 44"
                    fill="none"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray="46"
                    style={{ ["--dash" as string]: 46 }}
                  />
                </g>
              </g>
            </svg>
          </RevealOnScroll>

          {/* Card 3: No wallet, ever */}
          <RevealOnScroll as={motion.div} animation="tqRise 620ms var(--ease-out) 220ms both" {...hoverProps} style={{ ...cardBase, background: "var(--violet-300)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <h3 className="font-display" style={{ fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 0.92, margin: 0 }}>
                No wallet,
                <br />
                ever
              </h3>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.45, maxWidth: "24ch" }}>
                No deposit, no payout, no exchange connection. Nothing in the product can move real funds.
              </p>
            </div>
            <svg viewBox="0 0 150 130" aria-hidden="true" style={illoWrap}>
              <g stroke="var(--ink-900)" strokeWidth="3.4" strokeLinejoin="round">
                <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: "rotate(-6deg)", animation: "tqTilt 4.2s ease-in-out infinite" }}>
                  <rect x="34" y="58" width="86" height="52" rx="12" fill="var(--blue-500)" />
                  <rect x="46" y="46" width="62" height="26" rx="8" fill="var(--paper-0)" />
                  <rect x="34" y="72" width="86" height="38" rx="10" fill="var(--blue-700)" />
                  <rect x="86" y="82" width="24" height="16" rx="5" fill="var(--amber-500)" />
                </g>
                <RevealOnScroll as="g" animation="tqPopIn 460ms var(--ease-bounce) 520ms both" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="112" cy="42" r="24" fill="var(--orange-500)" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqThrob 2.6s ease-in-out infinite" }} />
                  <RevealOnScroll
                    as="path"
                    animation="tqDraw 520ms var(--ease-out) 820ms both"
                    d="M103 33 L121 51 M121 33 L103 51"
                    fill="none"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    style={{ ["--dash" as string]: 60 }}
                  />
                </RevealOnScroll>
              </g>
            </svg>
          </RevealOnScroll>

          {/* Card 4: Not advice */}
          <RevealOnScroll as={motion.div} animation="tqRise 620ms var(--ease-out) 330ms both" {...hoverProps} style={{ ...cardBase, background: "var(--mint-500)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <h3 className="font-display" style={{ fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 0.92, margin: 0 }}>
                Not
                <br />
                advice
              </h3>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.45, maxWidth: "24ch" }}>
                We teach you to read a chart. We never tell you what to buy, and we publish no signals.
              </p>
            </div>
            <svg viewBox="0 0 150 130" aria-hidden="true" style={illoWrap}>
              <g stroke="var(--ink-900)" strokeWidth="3.4" strokeLinejoin="round">
                <RevealOnScroll as="g" animation="tqPopIn 460ms var(--ease-bounce) 360ms both" style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}>
                  <path
                    d="M22 34 h74 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-38 l-18 16 v-16 h-18 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 Z"
                    fill="var(--paper-0)"
                  />
                  <circle cx="59" cy="52" r="5" fill="var(--violet-500)" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqDot 1.9s ease-in-out infinite" }} />
                  <path d="M59 66 v14" fill="none" strokeWidth="6" strokeLinecap="round" />
                </RevealOnScroll>
                <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "tqBob 3.6s ease-in-out .4s infinite" }}>
                  <rect x="98" y="86" width="40" height="30" rx="10" fill="var(--violet-500)" />
                  <path d="M106 101 h24" fill="none" stroke="var(--paper-0)" strokeWidth="5" strokeLinecap="round" />
                </g>
              </g>
            </svg>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
