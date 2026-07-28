# Reference: puzzle content

100/100 real puzzles, from `scripts/seed-puzzles.ts`, fully replacing the original 3 fabricated dev puzzles. Two tiers:

- **orderIndex 0-15**: 16 hand-picked, named historical events (Dec 2017 top, COVID Black Thursday, May 2021 crash, FTX collapse, ETH Merge, DeFi summer, etc.) — each with a setup note describing the real-world event.
- **orderIndex 16-99**: 84 systematically-discovered real setups across 8 symbols (BTC, ETH, SOL, AVAX, BNB, XRP, ADA, DOGE — Binance's other top-volume pairs). A scan script pulled bulk historical klines and locally slid a 24-candle window across them, keeping only "clean" windows (forward return comfortably past the 1% threshold for Buy/Sell, or comfortably flat for Wait) spread at least 25 days apart per symbol/call-type to avoid near-duplicates. Setup notes for this tier are generated from the real observed numbers (e.g. "chopping sideways (+0.95%)... Correct read is Buy — price continues higher... +12.99%") rather than tied to a named news event — still 100% real Binance data, just without a headline attached.

All 100 entries' forward-return/correct-call were verified against live Binance data before commit (script defaults to a dry run; `--commit` writes; upserts by orderIndex). Same 16-history/8-outcome/1% threshold shape throughout. Distribution: 32 Buy / 28 Sell / 24 Wait across the algorithmic tier, roughly even across the 8 symbols.

## Data provider

Binance public API, picked because it needs no signup/key and gives free hourly OHLCV (CoinGecko's free tier is daily-only). Binance's ToS bans profiting from this data (ads/fees) — fine for v1 (free, no ads) but **must be revisited before any monetization**, per [BACKLOG-STATUS.md](../planning/BACKLOG-STATUS.md).

Discovery/selection scratch scripts used to pick the 84 algorithmic entries aren't checked in (were scratchpad-only) — `scripts/seed-puzzles.ts` itself is the durable artifact and can be re-run or extended with new entries directly.
