// Fabricated dev-only puzzles so Phase 4-9 aren't blocked on the deferred
// real-data-provider decision (PRD §9's license-must-permit-redisplay gate).
// Replaced entirely once Phase 10's real seed script runs against real OHLCV.
import { getDb } from "../src/db";
import { puzzles } from "../src/db/schema";
import { classifyPatternType } from "../src/lib/pattern-type";

type RawPuzzle = {
  orderIndex: number;
  symbol: string;
  closes: number[]; // synthetic close-price series -> turned into OHLC below
  decisionIndex: number;
  outcomeWindowCandles: number;
  forwardReturnThresholdPct: number;
  setupNote: string;
};

const HOUR = 3600;
const START_T = Date.UTC(2019, 7, 1, 0, 0, 0) / 1000; // fixed epoch, deterministic

function closesToCandles(closes: number[]) {
  return closes.map((close, i) => {
    const open = i === 0 ? closes[0] * 0.995 : closes[i - 1];
    const high = Math.max(open, close) * 1.003;
    const low = Math.min(open, close) * 0.997;
    return { t: START_T + i * HOUR, open, high, low, close, volume: 1000 + Math.round(Math.random() * 200) };
  });
}

const RAW: RawPuzzle[] = [
  {
    orderIndex: 0,
    symbol: "BTC/USD",
    closes: [100, 102, 101, 105, 107, 105, 103, 106, 110, 112, 110, 108, 112, 116, 114, 120, 125, 128, 130, 133, 131, 135, 138, 140],
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly candles of BTC/USD: a steady sequence of higher lows with the range tightening right before the 16th candle. Correct read is Buy — the breakout continues upward through the next 8 candles.",
  },
  {
    orderIndex: 1,
    symbol: "ETH/USD",
    closes: [100, 104, 107, 110, 113, 112, 115, 114, 116, 113, 115, 111, 113, 109, 110, 106, 99, 95, 93, 96, 92, 90, 88, 91],
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly candles of ETH/USD: each high steps lower while price keeps failing at the same ceiling. Correct read is Sell — the rollover continues downward through the next 8 candles.",
  },
  {
    orderIndex: 2,
    symbol: "SOL/USD",
    closes: [100, 101, 99, 100, 102, 101, 99, 100, 101, 99, 101, 100, 102, 100, 99, 101, 101.4, 100.5, 101.1, 100.8, 101.3, 100.6, 101.0, 100.9],
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly candles of SOL/USD confined to a tight, directionless range. Correct read is Wait — no trend, no edge, and the range holds through the next 8 candles.",
  },
];

async function main() {
  const db = getDb();
  const rows = RAW.map((p) => {
    const candles = closesToCandles(p.closes);
    const decisionClose = candles[p.decisionIndex - 1].close;
    const outcomeClose = candles[p.decisionIndex + p.outcomeWindowCandles - 1].close;
    const historyMovePct = ((decisionClose - candles[0].close) / candles[0].close) * 100;
    const outcomeMovePct = ((outcomeClose - decisionClose) / decisionClose) * 100;
    return {
      orderIndex: p.orderIndex,
      symbol: p.symbol,
      timeframe: "1H",
      candles,
      decisionIndex: p.decisionIndex,
      outcomeWindowCandles: p.outcomeWindowCandles,
      forwardReturnThresholdPct: p.forwardReturnThresholdPct.toFixed(2),
      setupNote: p.setupNote,
      patternType: classifyPatternType({ historyMovePct, outcomeMovePct, thresholdPct: p.forwardReturnThresholdPct }),
      isPublished: true,
    };
  });

  for (const row of rows) {
    await db
      .insert(puzzles)
      .values(row)
      .onConflictDoUpdate({ target: puzzles.orderIndex, set: row });
  }

  console.log(`Seeded ${rows.length} dev puzzles.`);
}

main().then(() => process.exit(0));
