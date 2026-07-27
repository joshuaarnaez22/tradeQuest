# TradeQuest — v1 PRD

> Version: 1.0 · Status: Draft for build · Supersedes the full-vision brainstorm (kept as `PRD-vision.md` / backlog)

---

## 1. One-line vision

Duolingo for reading candlestick charts: daily replay puzzles, graded on decision quality, not profit.

## 2. The one loop v1 must nail

```
Pick a puzzle → Watch candles reveal one at a time → Decide (Buy / Sell / Wait)
→ See what actually happened → Get graded + a 1-line explanation → Earn XP → Streak counter ticks
```

If this loop isn't addictive on its own, nothing else in the original doc matters. Everything below exists to ship this loop fast and prove it retains people before spending a single hour on anything else.

## 3. Scope: v1 (build this, nothing else)

| Area | v1 scope |
|---|---|
| **Asset class** | Crypto only (BTC, ETH, top ~10 by volume). Cleanest data licensing, 24/7 market, no market-hours edge cases. |
| **Data source** | One provider, historical OHLCV only, cached in our DB. No live trading data, no broker connection. |
| **Puzzle format** | Candle-by-candle replay, hide future candles, 3 actions: Buy / Sell / Wait. Single timeframe (1H) to start. |
| **Puzzle library** | 100 hand-picked historical setups at launch. Hand-authored, not AI-generated — see §7. |
| **Grading** | Rule-based: was the decision aligned with what price actually did next (simple forward-return threshold), not vibes. |
| **AI Mentor** | One job only: 1-2 sentence explanation of why the graded outcome was right/wrong. No "personalized advice," no confidence score, no psychology analysis. |
| **Progression** | XP, daily streak, single global leaderboard. No skill trees, no ranks, no coins/shop. |
| **Auth** | Email + Google login. |
| **Platform** | Web only, responsive (mobile browser works, no native app). |
| **Account** | Free tier only. No paywall in v1 — see §8. |

That's the whole v1. If it's not in this table, it's not being built yet.

## 4. Explicitly deferred (and what unlocks each)

| Deferred | Unlock condition |
|---|---|
| Stocks / forex / commodities | Crypto loop hits retention target (§6) — new asset class = new data licensing deal, don't pre-pay for it |
| Historical Campaigns (2008 crash, GameStop, etc.) | Core loop retains; campaigns are a content investment, not a mechanic risk |
| Chart drawing tools (trendlines, FVG, order blocks, Fibonacci) | Users ask for it / puzzle format v1 feels shallow after a few weeks of data |
| Multiplayer, guilds, tournaments | Have a retained cohort worth competing inside |
| Trading Journal | Separate product surface — build once users have enough history to journal |
| Marketplace, instructor tools, admin CMS builder | Only matters at scale we don't have yet |
| Native mobile app | Web retention proves the loop first; wrapping it in an app is the easy part |
| Paid tiers | See §8 — needs a wedge feature first |
| AI Quiz/Chart/Campaign generators | Replace hand-authoring only once we know which puzzle types actually teach something (§7) |

Nothing here is cut for good — it's sequenced behind evidence.

## 5. User flow (v1)

1. Sign up (email or Google) → land straight in a puzzle, no onboarding wall
2. Solve puzzle → see result + 1-line AI explanation → XP awarded
3. Prompted to next puzzle or "come back tomorrow" if daily puzzle is done
4. Home screen: streak counter, XP total, today's puzzle status, leaderboard rank
5. Push/email reminder if streak is about to break (day 1 of retention mechanics, not a full notification system)

No lesson library, no glossary, no flashcards in v1 — the puzzle *is* the lesson. Add explicit teaching content only if data shows people are guessing randomly rather than improving.

## 6. Success metrics (the only things that decide what gets built next)

- **North Star:** D7 retention on the puzzle loop (target: define after 2 weeks of real data — don't guess a number pre-launch)
- Daily streak survival rate (day 1 → day 7)
- Puzzles solved per active user per day
- % of users who return specifically after a streak-break reminder
- Puzzle-level drop-off (which puzzles cause people to quit — this tells you if difficulty curve is broken)

No revenue metric in v1 — there's nothing to sell yet. Revenue metrics start at §8's trigger.

## 7. The real bottleneck: content, not code

The engineering in §3 is a few weeks of work. The 100-puzzle library is the actual risk — each one needs a real historical setup, a correct grading window, and a correct explanation. Plan for this as a content-production task with an owner and a deadline, same as any engineering task. Do not start on "AI Chart Generator" until a human has hand-authored enough puzzles to know what a *good* one looks like — otherwise you're automating a process you don't understand yet.

## 8. Monetization (deferred on purpose)

v1 ships free, no paywall. Don't design pricing tiers against a feature set that doesn't exist yet. Revisit monetization once retention data exists and you can see which feature people would actually pay to unlock (extra puzzle packs? streak freezes? a second asset class?) — that becomes the paid wedge, not a guess made today.

## 9. Legal/compliance guardrails (non-negotiable, from v1 day one)

- Never use the phrase "advice" (personalized or otherwise) anywhere in-product — this is what invites investment-adviser regulatory scrutiny (SEC/FINRA-adjacent), even on simulated trades.
- All results are simulated/historical replay — label this clearly on every puzzle screen, not buried in a ToS.
- Confirm the data provider's license explicitly permits redisplay in a paid or ad-supported product before integrating (this gates §3's "Data source" row — resolve before writing the puzzle importer).

## 10. What "done" looks like for v1

Ship when: a user can sign up, solve today's puzzle, see a correct/incorrect grade with a one-line explanation, watch their streak and XP update, and come back tomorrow without you touching the database by hand. Everything else in the original brainstorm doc is backlog, not blocker.
