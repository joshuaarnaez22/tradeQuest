"use client";

import { useEffect, useRef } from "react";
import { CandlestickSeries, LineSeries, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";

export type CandleDatum = { t: number; open: number; high: number; low: number; close: number };

const BAR_SPACING = 24;
const HISTORY_TICK_MS = 70;
const OUTCOME_TICK_MS = 120;

// lightweight-charts draws to canvas — colors are JS values read at paint time,
// not resolved through the CSS cascade the way a stylesheet color would be.
// Reading getComputedStyle off the container (a descendant of the themed
// wrapper) picks up the [data-theme="dark"] override correctly.
function readTokens(el: HTMLElement) {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    up: v("--market-up"),
    down: v("--market-down"),
    text: v("--text-secondary"),
    grid: v("--border-subtle"),
  };
}

// Aspect-ratio-driven height, clamped — scales with the container's actual
// width (so it grows on wide screens) without ever getting cramped or huge.
function chartHeight(width: number) {
  return Math.round(Math.min(560, Math.max(320, width * 0.52)));
}

function toBar(c: CandleDatum) {
  return { time: c.t as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close };
}

export function ReplayChart({
  historyCandles,
  outcomeCandles,
  revealed,
  speedMultiplier = 1,
  onHistoryComplete,
}: {
  historyCandles: CandleDatum[];
  outcomeCandles: CandleDatum[];
  revealed: boolean;
  speedMultiplier?: number;
  onHistoryComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  // Invisible line series spanning the full known price range (history +
  // outcome, padded) — added once, never changes. Keeps the Y axis fixed at
  // its final size throughout the reveal, so a growing candle count doesn't
  // also make the price axis rescale/jump on every tick.
  const rangeLockRef = useRef<ISeriesApi<"Line"> | null>(null);
  const onHistoryCompleteRef = useRef(onHistoryComplete);
  onHistoryCompleteRef.current = onHistoryComplete;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const tokens = readTokens(container);

    const chart = createChart(container, {
      width: container.clientWidth,
      height: chartHeight(container.clientWidth),
      layout: { background: { color: "transparent" }, textColor: tokens.text },
      grid: {
        vertLines: { color: tokens.grid },
        horzLines: { color: tokens.grid },
      },
      timeScale: { timeVisible: true, secondsVisible: false, barSpacing: BAR_SPACING },
    });
    const rangeLock = chart.addSeries(LineSeries, {
      lineVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: tokens.up,
      downColor: tokens.down,
      borderUpColor: tokens.up,
      borderDownColor: tokens.down,
      wickUpColor: tokens.up,
      wickDownColor: tokens.down,
    });
    chartRef.current = chart;
    seriesRef.current = series;
    rangeLockRef.current = rangeLock;

    const onResize = () => {
      chart.applyOptions({ width: container.clientWidth, height: chartHeight(container.clientWidth) });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      rangeLockRef.current = null;
    };
  }, []);

  // Price-range lock — shared by the reveal below regardless of how it's triggered.
  useEffect(() => {
    const rangeLock = rangeLockRef.current;
    if (!rangeLock) return;
    const all = [...historyCandles, ...outcomeCandles];
    if (all.length === 0) return;
    const prices = all.flatMap((c) => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.08 || max * 0.02 || 1;
    rangeLock.setData([
      { time: all[0].t as UTCTimestamp, value: min - pad },
      { time: all[all.length - 1].t as UTCTimestamp, value: max + pad },
    ]);
  }, [historyCandles, outcomeCandles]);

  // Reveal history candles one at a time, keeping the revealed cluster
  // CENTERED in the pane. The margin is measured against the FULL eventual
  // candle count (history + outcome), not "however many bars fit at a fixed
  // spacing" — that's what makes it shrink to exactly zero on the very last
  // outcome candle below, ending edge-to-edge with no separate zoom step.
  // Mixing a fixed bar-spacing target with a later fitContent() call (an
  // earlier version of this) is what caused a visible zoom jump on the last
  // tick: fitContent() computes its own bar width from container-width ÷
  // candle-count, which doesn't match a fixed-spacing target. One formula,
  // used consistently, avoids that entirely.
  //
  // Always plays, whether this is a live decision session or a reload of an
  // already-solved puzzle — same experience either way. Cleanup cancels
  // pending timers so a remount (Strict Mode's dev double-invoke, HMR)
  // can't fire a stale tick against a gone chart.
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    const tickMs = HISTORY_TICK_MS / speedMultiplier;
    const total = historyCandles.length + outcomeCandles.length;
    series.setData([]);
    const timers = historyCandles.map((_, i) =>
      setTimeout(() => {
        if (seriesRef.current !== series) return;
        const k = i + 1;
        series.setData(historyCandles.slice(0, k).map(toBar));
        const margin = Math.max(0, (total - k) / 2);
        chart.timeScale().setVisibleLogicalRange({ from: -margin - 0.5, to: k - 1 + margin + 0.5 });
        if (k === historyCandles.length) onHistoryCompleteRef.current?.();
      }, i * tickMs)
    );
    // Empty history edge case — still unblock the decision UI.
    if (historyCandles.length === 0) onHistoryCompleteRef.current?.();
    return () => timers.forEach(clearTimeout);
  }, [historyCandles, outcomeCandles, speedMultiplier]);

  // Once a decision is made (revealed=true), reveal the outcome candles one
  // at a time — same formula as above, continuing the running total so the
  // margin keeps shrinking smoothly and hits exactly zero on the last
  // candle. Offset by the full duration of the history reveal above — not
  // just "starts when revealed flips true" — so that even when the page
  // loads with revealed already true (a refresh after deciding), this
  // sequence starts only after the history sequence has visually finished,
  // rather than both running concurrently and fighting over the same
  // series data (that double-effect race was the original flicker bug).
  useEffect(() => {
    if (!revealed) return;
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    const histTick = HISTORY_TICK_MS / speedMultiplier;
    const outTick = OUTCOME_TICK_MS / speedMultiplier;
    const total = historyCandles.length + outcomeCandles.length;
    const startDelay = historyCandles.length * histTick;
    const timers = outcomeCandles.map((_, i) =>
      setTimeout(
        () => {
          if (seriesRef.current !== series) return;
          const k = historyCandles.length + i + 1;
          series.setData([...historyCandles, ...outcomeCandles.slice(0, i + 1)].map(toBar));
          const margin = Math.max(0, (total - k) / 2);
          chart.timeScale().setVisibleLogicalRange({ from: -margin - 0.5, to: k - 1 + margin + 0.5 });
        },
        startDelay + i * outTick
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [revealed, outcomeCandles, historyCandles, speedMultiplier]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 320,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "var(--border-width-thick) solid var(--border-default)",
      }}
    />
  );
}
