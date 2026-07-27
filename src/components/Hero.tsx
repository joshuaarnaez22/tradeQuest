"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CandleCallBadge } from "./ui/CandleCallBadge";
import { EASE_BOUNCE, EASE_OUT, LIFT_TRANSITION } from "@/lib/motion";

const RISE_UP = { duration: 0.7, ease: EASE_OUT };

type Call = "buy" | "sell" | "wait";

type Scenario = {
  pair: string;
  tf: string;
  correct: Call;
  closes: number[];
  win: string;
  wait: string;
  lose: string;
};

const SCENARIOS: Scenario[] = [
  {
    pair: "BTC/USD",
    tf: "▲ replay · 4h",
    correct: "buy",
    closes: [100, 102, 101, 105, 107, 105, 103, 106, 110, 112, 110, 108, 112, 116, 114, 120, 125, 128, 124],
    win: "Nice read — the higher lows kept stacking and the range tightened right before the break.",
    wait: "Not wrong, and waiting keeps your record honest — but the higher lows had already made the case.",
    lose: "It broke upward. Every low was higher than the last, and that pattern rarely precedes a drop.",
  },
  {
    pair: "ETH/USD",
    tf: "▼ replay · 1d",
    correct: "sell",
    closes: [100, 104, 107, 110, 113, 112, 115, 114, 116, 113, 115, 111, 113, 109, 110, 106, 99, 95, 97],
    win: "Good call — price kept failing at the same ceiling while each high stepped lower.",
    wait: "Fair. Sitting out costs you nothing, but the lower highs were a standing warning.",
    lose: "It rolled over. The highs were stepping down and the last retest failed well short.",
  },
  {
    pair: "SOL/USD",
    tf: "— replay · 1h",
    correct: "wait",
    closes: [100, 101, 99, 100, 102, 101, 99, 100, 101, 99, 101, 100, 102, 100, 99, 101, 101.4, 100.5, 101.1],
    win: "Right call — no trend, no edge. Recognising a range you should sit out is a read in itself.",
    wait: "Right call — no trend, no edge. Recognising a range you should sit out is a read in itself.",
    lose: "It barely moved. In a range this tight a directional call is a coin flip — waiting was the read.",
  },
];

type Cell = {
  up: boolean;
  bodyY: number;
  bodyH: number;
  wickTop: number;
  wickBot: number;
  hi: number;
  lo: number;
};

function buildGeom(closes: number[]) {
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const y = (p: number) => 270 - ((p - min) / span) * 180;
  const d = span * 0.035;
  const cells: Cell[] = closes.map((close, i) => {
    const open = i === 0 ? closes[0] - span * 0.05 : closes[i - 1];
    const hi = Math.max(open, close);
    const lo = Math.min(open, close);
    const top = y(hi);
    const bot = y(lo);
    return {
      up: close >= open,
      bodyY: top,
      bodyH: Math.max(3, bot - top),
      wickTop: y(hi + d),
      wickBot: y(lo - d),
      hi,
      lo,
    };
  });
  return { cells, y };
}

const CALL_LABELS: Record<Call, { icon: string; label: string; bg: string; fg: string }> = {
  buy: { icon: "▲", label: "Buy", bg: "var(--blue-500)", fg: "var(--blue-700)" },
  wait: { icon: "—", label: "Wait", bg: "var(--violet-500)", fg: "var(--violet-500)" },
  sell: { icon: "▼", label: "Sell", bg: "var(--orange-500)", fg: "var(--orange-700)" },
};

export function Hero() {
  const [scenario, setScenario] = useState(0);
  const [call, setCall] = useState<Call | null>(null);

  const sc = SCENARIOS[scenario];
  const geom = useMemo(() => buildGeom(sc.closes), [sc]);
  const revealed = call !== null;

  const correct = useMemo(() => {
    if (call === null) return undefined;
    if (call === sc.correct) return true;
    if (call === "wait") return undefined;
    return false;
  }, [call, sc]);

  const resultText = call ? (call === sc.correct ? sc.win : call === "wait" ? sc.wait : sc.lose) : "";
  const resultXp = call ? (call === sc.correct ? "+15 XP" : call === "wait" ? "+5 XP" : "+0 XP") : "";

  const shown = geom.cells.slice(0, 16);
  const supportD = `M30 ${(geom.y(shown[0].lo) + 12).toFixed(1)} L556 ${(geom.y(shown[15].lo) + 12).toFixed(1)}`;
  const resistanceD = `M30 ${(geom.y(shown[0].hi) - 12).toFixed(1)} L556 ${(geom.y(shown[15].hi) - 12).toFixed(1)}`;

  const revealCells = [0, 1, 2].map((k) => geom.cells[16 + k]);
  const lastTop = Math.min(...revealCells.map((c) => c.wickTop));
  const lastBot = Math.max(...revealCells.map((c) => c.wickBot));
  const pct = ((sc.closes[18] - sc.closes[15]) / sc.closes[15]) * 100;
  const pctUp = pct >= 0;
  const labelY = pctUp ? Math.max(24, lastTop - 14) : Math.min(286, lastBot + 24);

  const nextPair = SCENARIOS[(scenario + 1) % SCENARIOS.length].pair;
  const heroKey = `${scenario}-${call ?? "idle"}`;

  function makeCall(next: Call) {
    if (call) return;
    setCall(next);
  }

  function resetCall() {
    setScenario((s) => (s + 1) % SCENARIOS.length);
    setCall(null);
  }

  return (
    <section
      id="top"
      style={{
        background: "var(--ink-900)",
        color: "var(--paper-0)",
        padding: "96px 20px 120px",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "grid", gap: 56 }}>
        <div style={{ display: "grid", gap: 28, justifyItems: "start", maxWidth: 1040 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...RISE_UP, delay: 0 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--amber-500)",
              color: "var(--ink-900)",
              border: "var(--border-width-thick) solid var(--ink-900)",
            }}
          >
            Free · Launching soon
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...RISE_UP, delay: 0.08 }}
            className="font-display"
            style={{
              fontSize: "clamp(56px,11vw,164px)",
              lineHeight: 0.88,
              margin: 0,
              textWrap: "balance",
            }}
          >
            Read the chart.
            <br />
            Not the news.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...RISE_UP, delay: 0.2 }}
            style={{
              fontSize: "clamp(18px,2.2vw,23px)",
              lineHeight: 1.5,
              color: "var(--ink-100)",
              margin: 0,
              maxWidth: "56ch",
            }}
          >
            Replay real historical crypto markets one candle at a time, call buy, sell or
            wait, and build the habit with daily streaks and XP.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...RISE_UP, delay: 0.3 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}
          >
            <motion.a
              href="#waitlist"
              whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 var(--paper-0)" }}
              whileTap={{ x: 0, y: 0, boxShadow: "0 0 0 0 var(--paper-0)" }}
              transition={LIFT_TRANSITION}
              style={{
                fontSize: 17,
                fontWeight: 700,
                padding: "16px 32px",
                borderRadius: "var(--radius-pill)",
                background: "var(--violet-500)",
                color: "var(--paper-0)",
                border: "var(--border-width-thick) solid var(--paper-0)",
                boxShadow: "4px 4px 0 0 var(--paper-0)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Start your first replay
            </motion.a>
            <a
              href="#how"
              style={{
                fontSize: 17,
                fontWeight: 700,
                padding: "16px 32px",
                borderRadius: "var(--radius-pill)",
                border: "var(--border-width-thick) solid var(--ink-300)",
                color: "var(--paper-0)",
              }}
            >
              See how it works
            </a>
          </motion.div>
        </div>

        <div
          style={{
            background: "var(--paper-50)",
            border: "var(--border-width-thick) solid var(--ink-900)",
            borderRadius: 32,
            boxShadow: "8px 8px 0 0 var(--violet-500)",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>
                {sc.pair}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--blue-100)",
                  color: "var(--blue-700)",
                }}
              >
                {sc.tf}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 700, color: "var(--ink-500)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="3" y="2" width="8" height="10" rx="1.5" fill="var(--blue-500)" stroke="var(--ink-900)" strokeWidth="2" />
                </svg>
                ▲ Up (solid)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="3" y="2" width="8" height="10" rx="1.5" fill="var(--paper-0)" stroke="var(--orange-500)" strokeWidth="2" />
                </svg>
                ▼ Down (hollow)
              </span>
            </div>
          </div>

          <svg
            key={heroKey}
            viewBox="0 0 720 320"
            role="img"
            aria-label={`Candlestick replay chart: sixteen historical candles${revealed ? ", followed by the three candles that actually happened next" : " followed by three unknown future candles marked with a question mark"}.`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <g stroke="var(--ink-100)" strokeWidth="1.5">
              <line x1="16" y1="90" x2="704" y2="90" />
              <line x1="16" y1="150" x2="704" y2="150" />
              <line x1="16" y1="210" x2="704" y2="210" />
              <line x1="16" y1="270" x2="704" y2="270" />
            </g>

            <path
              d={supportD}
              fill="none"
              stroke="var(--violet-500)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 10"
              style={{ ["--dash" as string]: 560, animation: "tqDraw 1.4s var(--ease-out) .3s both" }}
            />
            <path
              d={resistanceD}
              fill="none"
              stroke="var(--violet-500)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 10"
              style={{ ["--dash" as string]: 560, animation: "tqDraw 1.4s var(--ease-out) .5s both" }}
            />

            <g stroke="var(--ink-900)" strokeWidth="2.5" strokeLinecap="round">
              {shown.map((c, i) => {
                const x = 24 + i * 34;
                const cx = x + 8;
                return (
                  <g
                    key={i}
                    style={
                      revealed
                        ? undefined
                        : {
                            transformBox: "fill-box",
                            transformOrigin: "bottom",
                            animation: `tqCandle 7s linear ${(i * 0.06).toFixed(2)}s infinite`,
                          }
                    }
                  >
                    <line x1={cx} y1={c.wickTop.toFixed(1)} x2={cx} y2={c.wickBot.toFixed(1)} stroke={c.up ? undefined : "var(--orange-700)"} />
                    <rect
                      x={x}
                      y={c.bodyY.toFixed(1)}
                      width="16"
                      height={c.bodyH.toFixed(1)}
                      rx="2"
                      fill={c.up ? "var(--blue-500)" : "var(--paper-0)"}
                      stroke={c.up ? undefined : "var(--orange-500)"}
                    />
                  </g>
                );
              })}
            </g>

            {!revealed && (
              <>
                <g style={{ animation: "tqGhost 7s linear 0s infinite" }}>
                  <g>
                    <rect x="568" y="104" width="16" height="40" rx="2" fill="none" stroke="var(--ink-300)" strokeWidth="2.5" strokeDasharray="6 6" />
                    <rect x="602" y="112" width="16" height="40" rx="2" fill="none" stroke="var(--ink-300)" strokeWidth="2.5" strokeDasharray="6 6" />
                    <rect x="636" y="98" width="16" height="40" rx="2" fill="none" stroke="var(--ink-300)" strokeWidth="2.5" strokeDasharray="6 6" />
                  </g>
                  <line x1="560" y1="70" x2="560" y2="290" stroke="var(--ink-300)" strokeWidth="2" strokeDasharray="4 8" />
                </g>
                <g
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: "tqAsk 7s linear 0s infinite",
                  }}
                >
                  <circle cx="610" cy="216" r="30" fill="var(--amber-500)" stroke="var(--ink-900)" strokeWidth="2.5" />
                  <text x="610" y="230" textAnchor="middle" fontFamily="var(--font-display)" fontSize="36" fill="var(--ink-900)">
                    ?
                  </text>
                </g>
                <text x="610" y="272" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="var(--ink-500)">
                  Your call
                </text>
              </>
            )}

            {revealed && (
              <>
                <motion.g
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: [0.4, 1.12, 1] }}
                  transition={{ duration: 0.42, ease: EASE_BOUNCE }}
                  style={{ transformBox: "fill-box", transformOrigin: "left center" }}
                >
                  <circle
                    cx="46"
                    cy="46"
                    r="24"
                    fill={correct === true ? "var(--blue-100)" : correct === false ? "var(--orange-100)" : "var(--violet-100)"}
                    stroke="var(--ink-900)"
                    strokeWidth="2.5"
                  />
                  <text
                    x="46"
                    y="57"
                    textAnchor="middle"
                    fontFamily="var(--font-sans)"
                    fontSize="26"
                    fontWeight="800"
                    fill={correct === true ? "var(--blue-700)" : correct === false ? "var(--orange-700)" : "var(--violet-500)"}
                  >
                    {correct === true ? "✓" : correct === false ? "✕" : "—"}
                  </text>
                  <text x="80" y="54" fontFamily="var(--font-sans)" fontSize="17" fontWeight="800" fill="var(--ink-900)">
                    {correct === true ? "Good read" : correct === false ? "Missed it" : "Sat it out"}
                  </text>
                </motion.g>

                <g>
                  {revealCells.map((c, k) => {
                    const x = 24 + (16 + k) * 34;
                    const cx = x + 8;
                    return (
                      <g
                        key={k}
                        stroke="var(--ink-900)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{
                          transformBox: "fill-box",
                          transformOrigin: "bottom",
                          animation: `tqRevealIn 620ms var(--ease-bounce) ${(k * 0.18).toFixed(2)}s both`,
                        }}
                      >
                        <line x1={cx} y1={c.wickTop.toFixed(1)} x2={cx} y2={c.wickBot.toFixed(1)} stroke={c.up ? undefined : "var(--orange-700)"} />
                        <rect
                          x={x}
                          y={c.bodyY.toFixed(1)}
                          width="16"
                          height={c.bodyH.toFixed(1)}
                          rx="2"
                          fill={c.up ? "var(--blue-500)" : "var(--paper-0)"}
                          stroke={c.up ? undefined : "var(--orange-500)"}
                        />
                      </g>
                    );
                  })}
                  <text
                    x="610"
                    y={labelY.toFixed(1)}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="14"
                    fontWeight="600"
                    fill={pctUp ? "var(--blue-700)" : "var(--orange-700)"}
                  >
                    {(pctUp ? "▲ +" : "▼ ") + pct.toFixed(1) + "%"}
                  </text>
                </g>
              </>
            )}
          </svg>

          <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>
                {revealed ? "Revealed — this is what happened next." : "Sixteen candles in. What happens next?"}
              </span>
              {revealed && (
                <motion.button
                  onClick={resetCall}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{
                    scale: 1.05,
                    x: -2,
                    y: -2,
                    boxShadow: "6px 6px 0 0 var(--ink-900)",
                    transition: LIFT_TRANSITION,
                  }}
                  whileTap={{ scale: 1, x: 0, y: 0, boxShadow: "0 0 0 0 var(--ink-900)", transition: LIFT_TRANSITION }}
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: ".02em",
                    padding: "14px 26px",
                    borderRadius: "var(--radius-pill)",
                    border: "var(--border-width-thick) solid var(--ink-900)",
                    background: "var(--violet-500)",
                    color: "var(--paper-0)",
                    boxShadow: "4px 4px 0 0 var(--ink-900)",
                    cursor: "pointer",
                  }}
                >
                  {"Next replay · " + nextPair}
                </motion.button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 12 }}>
              {(["buy", "wait", "sell"] as Call[]).map((c) => {
                const meta = CALL_LABELS[c];
                const isChosen = call === c;
                return (
                  <motion.button
                    key={c}
                    onClick={() => makeCall(c)}
                    disabled={revealed}
                    whileHover={!revealed ? { x: -2, y: -2, boxShadow: "6px 6px 0 0 var(--ink-900)" } : undefined}
                    whileTap={!revealed ? { x: 2, y: 2, boxShadow: "0 0 0 0 var(--ink-900)" } : undefined}
                    transition={LIFT_TRANSITION}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontFamily: "var(--font-sans)",
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      padding: "15px 18px",
                      borderRadius: "var(--radius-pill)",
                      border: "var(--border-width-thick) solid var(--ink-900)",
                      background: meta.bg,
                      color: c === "sell" ? "var(--ink-900)" : "var(--paper-0)",
                      cursor: revealed ? "default" : "pointer",
                      boxShadow: "4px 4px 0 0 var(--ink-900)",
                      outline: isChosen ? "3px solid var(--violet-500)" : undefined,
                      outlineOffset: isChosen ? 3 : undefined,
                      opacity: revealed && !isChosen ? 0.35 : 1,
                      transitionProperty: "opacity",
                      transitionDuration: "var(--duration-base)",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        flex: "0 0 auto",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--paper-0)",
                        color: meta.fg,
                        border: "2px solid var(--ink-900)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                    >
                      {meta.icon}
                    </span>
                    {meta.label}
                  </motion.button>
                );
              })}
            </div>

            {revealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: [0.4, 1.12, 1] }}
                transition={{ duration: 0.42, ease: EASE_BOUNCE }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  background: "var(--paper-100)",
                  border: "var(--border-width-thick) solid var(--ink-900)",
                  borderRadius: 24,
                  padding: "16px 20px",
                }}
              >
                <CandleCallBadge call={call ?? "buy"} correct={correct} />
                <span style={{ flex: "1 1 220px", fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: "var(--ink-900)", minWidth: 200 }}>
                  {resultText}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600, color: "var(--violet-500)" }}>{resultXp}</span>
              </motion.div>
            )}
          </div>
          <p style={{ margin: "14px 4px 0", fontSize: 12, color: "var(--ink-500)" }}>
            Historical replay for practice. No live trading, no real funds, not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
