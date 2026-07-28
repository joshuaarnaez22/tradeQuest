// Phase 10 (docs/PRD-v1-IMPLEMENTATION-PLAN.md): real OHLCV puzzles.
//
// Data source: Binance's public /api/v3/klines endpoint — free, no API key,
// no auth. Picked per docs/BACKLOG-STATUS.md's data-provider decision: accept
// the risk that Binance's ToS bans profiting from this data (ads/fees) until
// TradeQuest monetizes, at which point this needs revisiting (PRD §9).
//
// Each entry below is a real, dated historical event, verified against live
// Binance data before being committed here (decisionClose/outcomeClose and
// the resulting correct call were checked against the actual candles, not
// guessed) — see docs/BACKLOG-STATUS.md and the PRD's "hand-authored, not
// AI-generated" requirement (§7). Defaults to a dry run; pass --commit to
// actually write. Upserts by orderIndex, so this fully replaces the 3
// fabricated rows from scripts/seed-dev-puzzles.ts (which used orderIndex 0-2).
import { getDb } from "../src/db";
import { puzzles } from "../src/db/schema";
import { gradeDecision } from "../src/lib/grading";
import { classifyPatternType } from "../src/lib/pattern-type";

type Entry = {
  orderIndex: number;
  symbol: string; // display symbol, e.g. "BTC/USD"
  binanceSymbol: string; // e.g. "BTCUSDT"
  startTime: string; // ISO timestamp, UTC — first history candle (hour-aligned)
  decisionIndex: number; // count of history candles revealed before the decision
  outcomeWindowCandles: number;
  forwardReturnThresholdPct: number;
  setupNote: string;
};

const ENTRIES: Entry[] = [
  {
    orderIndex: 0,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2017-12-21T12:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles heading into the December 2017 blow-off top. Correct read is Sell — price rolls over and keeps falling through the next 8 candles.",
  },
  {
    orderIndex: 1,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2020-03-12T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles into March 12 2020's 'Black Thursday' COVID crash. Correct read is Sell — panic selling drives price sharply lower through the next 8 candles.",
  },
  {
    orderIndex: 2,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2020-10-20T12:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles as price pushes toward its old all-time high in October 2020. Correct read is Buy — the breakout continues through the next 8 candles.",
  },
  {
    orderIndex: 3,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2021-01-02T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles as price breaks above $29k in early January 2021. Correct read is Buy — the rally continues through the next 8 candles.",
  },
  {
    orderIndex: 4,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2021-05-19T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles during the May 19 2021 crash. Correct read is Sell — price keeps falling through the next 8 candles.",
  },
  {
    orderIndex: 5,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2021-07-15T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles during the July 2021 range, well after the May crash and before the autumn rally. Correct read is Wait — no trend, and the range holds through the next 8 candles.",
  },
  {
    orderIndex: 6,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2022-11-08T12:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles as the FTX collapse breaks in November 2022. Correct read is Sell — price falls through the next 8 candles.",
  },
  {
    orderIndex: 7,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2023-01-13T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles as price recovers off its bear-market low in mid-January 2023. Correct read is Buy — the rally continues through the next 8 candles.",
  },
  {
    orderIndex: 8,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2023-03-12T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles as the Silicon Valley Bank collapse hits in March 2023. Correct read is Buy — price rallies hard through the next 8 candles as capital rotates into crypto.",
  },
  {
    orderIndex: 9,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2018-01-16T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles just after the January 2018 top. Correct read is Sell — price falls sharply through the next 8 candles.",
  },
  {
    orderIndex: 10,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2022-05-11T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles during the May 2022 Terra/Luna collapse contagion. Correct read is Sell — price keeps falling through the next 8 candles.",
  },
  {
    orderIndex: 11,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2022-09-15T12:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles right after the Merge completed in September 2022. Correct read is Wait — the 'sell the news' move doesn't clear a 1% threshold either way in the next 8 candles.",
  },
  {
    orderIndex: 12,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2019-09-10T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles during a quiet stretch in September 2019. Correct read is Wait — price stays range-bound through the next 8 candles.",
  },
  {
    orderIndex: 13,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2021-02-01T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles during the February 2021 rally into new highs. Correct read is Buy — the rally continues through the next 8 candles.",
  },
  {
    orderIndex: 14,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2020-07-27T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles during the July 2020 'DeFi summer' rally. Correct read is Buy — price continues higher through the next 8 candles.",
  },
  {
    orderIndex: 15,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2024-01-10T00:00:00Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles during the January 2024 spot-ETF-speculation rally. Correct read is Buy — price continues higher through the next 8 candles.",
  },
  {
    orderIndex: 16,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2019-04-01T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2019-04-01, chopping sideways with no clear trend (+0.95% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +12.99%.",
  },
  {
    orderIndex: 17,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2018-06-29T05:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2018-06-29, chopping sideways with no clear trend (-0.2% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +8.31%.",
  },
  {
    orderIndex: 18,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2022-06-18T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2022-06-18, sliding steadily (-4.41% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +7.54%.",
  },
  {
    orderIndex: 19,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2021-08-04T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2021-08-04, sliding steadily (-3.88% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +7.01%.",
  },
  {
    orderIndex: 20,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2021-09-06, chopping sideways with no clear trend (+1.54% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -10.87%.",
  },
  {
    orderIndex: 21,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2022-06-12, chopping sideways with no clear trend (-0.42% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -7.8%.",
  },
  {
    orderIndex: 22,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2018-06-09T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2018-06-09, sliding steadily (-4.94% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -6.68%.",
  },
  {
    orderIndex: 23,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2020-06-01T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2020-06-01, climbing steadily (+5.44% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -5.64%.",
  },
  {
    orderIndex: 24,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2018-06-07T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2018-06-07, chopping sideways with no clear trend (-0.37% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 25,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2020-06-18T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2020-06-18, chopping sideways with no clear trend (-0.52% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 26,
    symbol: "BTC/USD",
    binanceSymbol: "BTCUSDT",
    startTime: "2024-02-12T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BTC/USD candles from 2024-02-12, climbing steadily (+2.7% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 27,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2018-06-14T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2018-06-14, sliding steadily (-2.25% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +11.96%.",
  },
  {
    orderIndex: 28,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2022-06-18T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2022-06-18, sliding steadily (-4.66% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +10.69%.",
  },
  {
    orderIndex: 29,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2024-03-05T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2024-03-05, sliding steadily (-5.88% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +9.66%.",
  },
  {
    orderIndex: 30,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2021-08-04T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2021-08-04, sliding steadily (-3.64% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +8.43%.",
  },
  {
    orderIndex: 31,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2021-09-06, chopping sideways with no clear trend (-1.08% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -11.1%.",
  },
  {
    orderIndex: 32,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2022-06-12T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2022-06-12, sliding steadily (-7.67% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -10.48%.",
  },
  {
    orderIndex: 33,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2018-06-10T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2018-06-10, chopping sideways with no clear trend (-0.59% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -7.64%.",
  },
  {
    orderIndex: 34,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2019-04-03T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2019-04-03, climbing steadily (+3.85% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -6.06%.",
  },
  {
    orderIndex: 35,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2018-07-11T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2018-07-11, climbing steadily (+2.59% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 36,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2023-04-09T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2023-04-09, chopping sideways with no clear trend (+1.04% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 37,
    symbol: "ETH/USD",
    binanceSymbol: "ETHUSDT",
    startTime: "2018-06-02T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ETH/USD candles from 2018-06-02, climbing steadily (+2.69% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only -0.01%.",
  },
  {
    orderIndex: 38,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-01-07T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-01-07, sliding steadily (-10.96% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +39.35%.",
  },
  {
    orderIndex: 39,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-09-07T22:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-09-07, sliding steadily (-9.03% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +23.42%.",
  },
  {
    orderIndex: 40,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2022-06-15, chopping sideways with no clear trend (-0.03% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +17.79%.",
  },
  {
    orderIndex: 41,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-02-10T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-02-10, sliding steadily (-2.61% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +16.83%.",
  },
  {
    orderIndex: 42,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-08-30T22:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-08-30, climbing steadily (+11.74% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -14.92%.",
  },
  {
    orderIndex: 43,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2022-06-12, chopping sideways with no clear trend (-0.59% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -13%.",
  },
  {
    orderIndex: 44,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-01-03T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-01-03, climbing steadily (+2.8% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -11.54%.",
  },
  {
    orderIndex: 45,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-02-05T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-02-05, chopping sideways with no clear trend (-0.45% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -10.18%.",
  },
  {
    orderIndex: 46,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2023-04-08T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2023-04-08, chopping sideways with no clear trend (-0.2% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 47,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2023-05-08T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2023-05-08, sliding steadily (-3.1% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 48,
    symbol: "SOL/USD",
    binanceSymbol: "SOLUSDT",
    startTime: "2021-09-03T22:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly SOL/USD candles from 2021-09-03, chopping sideways with no clear trend (-1.97% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0.01%.",
  },
  {
    orderIndex: 49,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2021-02-09T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2021-02-09, climbing steadily (+4.52% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +33.35%.",
  },
  {
    orderIndex: 50,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2021-08-17T22:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2021-08-17, sliding steadily (-2.44% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +22.47%.",
  },
  {
    orderIndex: 51,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2021-01-08T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2021-01-08, climbing steadily (+16.03% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +19.69%.",
  },
  {
    orderIndex: 52,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2022-06-15, sliding steadily (-3.17% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +15.45%.",
  },
  {
    orderIndex: 53,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2021-09-06, sliding steadily (-3.22% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -16.03%.",
  },
  {
    orderIndex: 54,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2022-06-12, chopping sideways with no clear trend (-1.78% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -12.76%.",
  },
  {
    orderIndex: 55,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2021-01-10T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2021-01-10, sliding steadily (-6.6% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -9.61%.",
  },
  {
    orderIndex: 56,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2023-04-18T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2023-04-18, chopping sideways with no clear trend (-1.45% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -7.12%.",
  },
  {
    orderIndex: 57,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2022-07-06T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2022-07-06, climbing steadily (+2.6% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 58,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2023-04-05T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2023-04-05, chopping sideways with no clear trend (-1.05% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 59,
    symbol: "AVAX/USD",
    binanceSymbol: "AVAXUSDT",
    startTime: "2023-05-02T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly AVAX/USD candles from 2023-05-02, chopping sideways with no clear trend (+1.45% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 60,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2021-08-22T10:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2021-08-22, chopping sideways with no clear trend (-0.18% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +10.82%.",
  },
  {
    orderIndex: 61,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2022-06-15, sliding steadily (-3.49% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +9.83%.",
  },
  {
    orderIndex: 62,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2019-04-18T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2019-04-18, chopping sideways with no clear trend (+1.75% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +7.91%.",
  },
  {
    orderIndex: 63,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2023-04-15T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2023-04-15, chopping sideways with no clear trend (+0.12% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +4.72%.",
  },
  {
    orderIndex: 64,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2021-09-06, chopping sideways with no clear trend (-1.05% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -15.29%.",
  },
  {
    orderIndex: 65,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2022-06-12, climbing steadily (+2.51% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -9.1%.",
  },
  {
    orderIndex: 66,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2019-05-08T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2019-05-08, sliding steadily (-4.05% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -5.68%.",
  },
  {
    orderIndex: 67,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2022-06-04T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2022-06-04, chopping sideways with no clear trend (-0.1% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 68,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2023-04-07T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2023-04-07, chopping sideways with no clear trend (+0.42% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 69,
    symbol: "BNB/USD",
    binanceSymbol: "BNBUSDT",
    startTime: "2023-05-02T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly BNB/USD candles from 2023-05-02, chopping sideways with no clear trend (-0.68% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 70,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2019-04-04T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2019-04-04, sliding steadily (-3.67% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +11.48%.",
  },
  {
    orderIndex: 71,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2022-06-15, sliding steadily (-2.04% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +10.16%.",
  },
  {
    orderIndex: 72,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2021-08-10T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2021-08-10, climbing steadily (+7.97% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +8.86%.",
  },
  {
    orderIndex: 73,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2020-07-07T09:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2020-07-07, chopping sideways with no clear trend (+0.34% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +7.51%.",
  },
  {
    orderIndex: 74,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2021-09-06, chopping sideways with no clear trend (-1.51% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -16.21%.",
  },
  {
    orderIndex: 75,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2022-06-12, climbing steadily (+2.76% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -8.69%.",
  },
  {
    orderIndex: 76,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2021-08-11T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2021-08-11, climbing steadily (+4.28% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -6.73%.",
  },
  {
    orderIndex: 77,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2020-06-09T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2020-06-09, chopping sideways with no clear trend (-0.26% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 78,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2022-06-08T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2022-06-08, chopping sideways with no clear trend (+1.11% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 79,
    symbol: "XRP/USD",
    binanceSymbol: "XRPUSDT",
    startTime: "2019-05-03T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly XRP/USD candles from 2019-05-03, chopping sideways with no clear trend (-1.04% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0.01%.",
  },
  {
    orderIndex: 80,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2021-08-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2021-08-12, chopping sideways with no clear trend (-1.5% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +15.8%.",
  },
  {
    orderIndex: 81,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2022-06-15, chopping sideways with no clear trend (-1.04% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +12.71%.",
  },
  {
    orderIndex: 82,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2020-07-07T03:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2020-07-07, climbing steadily (+9.41% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +12.64%.",
  },
  {
    orderIndex: 83,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2021-09-10T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2021-09-10, chopping sideways with no clear trend (+1.81% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +12.23%.",
  },
  {
    orderIndex: 84,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2022-06-11T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2022-06-11, sliding steadily (-5.43% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -10.75%.",
  },
  {
    orderIndex: 85,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2021-09-06, sliding steadily (-4.79% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -10.36%.",
  },
  {
    orderIndex: 86,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2020-06-14T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2020-06-14, chopping sideways with no clear trend (-0.83% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -7.64%.",
  },
  {
    orderIndex: 87,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2023-04-17T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2023-04-17, chopping sideways with no clear trend (-1.48% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 88,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2019-05-01T18:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2019-05-01, chopping sideways with no clear trend (+0.72% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only -0.01%.",
  },
  {
    orderIndex: 89,
    symbol: "ADA/USD",
    binanceSymbol: "ADAUSDT",
    startTime: "2022-06-06T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly ADA/USD candles from 2022-06-06, climbing steadily (+4.28% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only -0.02%.",
  },
  {
    orderIndex: 90,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2020-07-07T03:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2020-07-07, chopping sideways with no clear trend (+0.23% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +65.56%.",
  },
  {
    orderIndex: 91,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2023-04-03T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2023-04-03, sliding steadily (-2.08% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +24.55%.",
  },
  {
    orderIndex: 92,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2022-06-15T00:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2022-06-15, chopping sideways with no clear trend (-0.22% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +15.32%.",
  },
  {
    orderIndex: 93,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2021-08-07T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2021-08-07, climbing steadily (+12.69% over the window). Correct read is Buy — price continues higher through the next 8 candles, moving +11.81%.",
  },
  {
    orderIndex: 94,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2021-09-06T16:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2021-09-06, sliding steadily (-2.42% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -15.67%.",
  },
  {
    orderIndex: 95,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2020-07-09T03:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2020-07-09, climbing steadily (+7.95% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -13.2%.",
  },
  {
    orderIndex: 96,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2022-06-12T06:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2022-06-12, chopping sideways with no clear trend (+0.75% over the window). Correct read is Sell — price continues lower through the next 8 candles, moving -11.67%.",
  },
  {
    orderIndex: 97,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2021-08-05T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2021-08-05, chopping sideways with no clear trend (+1.61% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 98,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2022-06-08T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2022-06-08, chopping sideways with no clear trend (+0.35% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
  {
    orderIndex: 99,
    symbol: "DOGE/USD",
    binanceSymbol: "DOGEUSDT",
    startTime: "2023-04-13T12:00:00.000Z",
    decisionIndex: 16,
    outcomeWindowCandles: 8,
    forwardReturnThresholdPct: 1.0,
    setupNote:
      "Sixteen hourly DOGE/USD candles from 2023-04-13, climbing steadily (+3.63% over the window). Correct read is Wait — price stays range-bound through the next 8 candles, moving only 0%.",
  },
];

async function fetchKlines(binanceSymbol: string, startTimeIso: string, limit: number) {
  const startMs = Date.parse(startTimeIso);
  const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&startTime=${startMs}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance klines fetch failed for ${binanceSymbol} @ ${startTimeIso}: ${res.status} ${await res.text()}`);
  const raw = (await res.json()) as [number, string, string, string, string, string, ...unknown[]][];
  if (raw.length < limit) {
    throw new Error(`Binance returned ${raw.length} candles, expected ${limit}, for ${binanceSymbol} @ ${startTimeIso}`);
  }
  return raw.map(([openTime, open, high, low, close, volume]) => ({
    t: Math.floor(openTime / 1000),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
  }));
}

async function main() {
  const commit = process.argv.includes("--commit");
  const db = commit ? getDb() : null;

  for (const entry of ENTRIES) {
    const total = entry.decisionIndex + entry.outcomeWindowCandles;
    const candles = await fetchKlines(entry.binanceSymbol, entry.startTime, total);

    // Mirrors src/app/api/attempts/route.ts's indexing exactly, so the preview
    // matches what grading will actually compute at request time.
    const decisionClose = candles[entry.decisionIndex - 1].close;
    const outcomeClose = candles[entry.decisionIndex + entry.outcomeWindowCandles - 1].close;
    const { forwardReturnPct } = gradeDecision({
      decision: "wait",
      decisionClose,
      outcomeClose,
      thresholdPct: entry.forwardReturnThresholdPct,
    });
    const correctCall = forwardReturnPct >= entry.forwardReturnThresholdPct ? "BUY" : forwardReturnPct <= -entry.forwardReturnThresholdPct ? "SELL" : "WAIT";
    const historyMovePct = ((decisionClose - candles[0].close) / candles[0].close) * 100;
    const patternType = classifyPatternType({ historyMovePct, outcomeMovePct: forwardReturnPct, thresholdPct: entry.forwardReturnThresholdPct });

    console.log(
      `#${entry.orderIndex} ${entry.symbol.padEnd(8)} ${entry.startTime}  fwd=${forwardReturnPct.toFixed(2)}%  correct=${correctCall}`
    );

    if (!commit) continue;

    const row = {
      orderIndex: entry.orderIndex,
      symbol: entry.symbol,
      timeframe: "1H",
      candles,
      decisionIndex: entry.decisionIndex,
      outcomeWindowCandles: entry.outcomeWindowCandles,
      forwardReturnThresholdPct: entry.forwardReturnThresholdPct.toFixed(2),
      setupNote: entry.setupNote,
      patternType,
      isPublished: true,
    };
    await db!.insert(puzzles).values(row).onConflictDoUpdate({ target: puzzles.orderIndex, set: row });
  }

  if (!commit) {
    console.log(`\nDry run — ${ENTRIES.length} entries previewed, nothing written. Re-run with --commit to seed.`);
  } else {
    console.log(`\nSeeded ${ENTRIES.length} real puzzles.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
