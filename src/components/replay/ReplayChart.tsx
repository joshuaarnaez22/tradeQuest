"use client";

import { useEffect, useRef } from "react";
import { CandlestickSeries, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";

export type CandleDatum = { t: number; open: number; high: number; low: number; close: number };

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

export function ReplayChart({
  historyCandles,
  outcomeCandles,
  revealed,
}: {
  historyCandles: CandleDatum[];
  outcomeCandles: CandleDatum[];
  revealed: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

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
      timeScale: { timeVisible: true, secondsVisible: false },
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

    const onResize = () => chart.applyOptions({ width: container.clientWidth, height: chartHeight(container.clientWidth) });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Reveal history candle-by-candle on mount / when the puzzle changes.
  // Cleanup cancels any still-pending timers — required so React Strict
  // Mode's mount/cleanup/remount dev cycle can't fire a stale timer against
  // a chart instance that's already been replaced or removed.
  //
  // Auto-framing (fitContent) only happens once, after this initial reveal —
  // never mid-tick, and never during the outcome reveal below, so it can't
  // fight a manual pan/zoom the way a per-tick scrollToRealTime() call would.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    series.setData([]);

    const timers = historyCandles.map((c, i) =>
      setTimeout(() => {
        series.update({ time: c.t as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close });
        if (i === historyCandles.length - 1) chartRef.current?.timeScale().fitContent();
      }, i * 70)
    );
    return () => timers.forEach(clearTimeout);
  }, [historyCandles]);

  // Reveal the outcome window once a decision has been made. Deliberately
  // does not touch scroll/zoom — whatever view the user left the chart in
  // (including a manual drag/pan) stays put.
  useEffect(() => {
    if (!revealed) return;
    const series = seriesRef.current;
    if (!series) return;

    const timers = outcomeCandles.map((c, i) =>
      setTimeout(() => {
        series.update({ time: c.t as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close });
      }, i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, [revealed, outcomeCandles]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "var(--border-width-thick) solid var(--border-default)",
      }}
    />
  );
}
