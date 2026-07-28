// Classifies all existing puzzles by pattern type, purely from data already
// stored on each row (candles/decisionIndex/outcomeWindowCandles/threshold)
// — no new fetches. Dry-run by default; --commit writes.
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { puzzles } from "../src/db/schema";
import { classifyPatternType } from "../src/lib/pattern-type";

async function main() {
  const commit = process.argv.includes("--commit");
  const db = getDb();
  const rows = await db.select().from(puzzles).orderBy(puzzles.orderIndex);

  for (const p of rows) {
    const decisionClose = p.candles[p.decisionIndex - 1].close;
    const outcomeClose = p.candles[p.decisionIndex + p.outcomeWindowCandles - 1].close;
    const historyMovePct = ((decisionClose - p.candles[0].close) / p.candles[0].close) * 100;
    const outcomeMovePct = ((outcomeClose - decisionClose) / decisionClose) * 100;
    const patternType = classifyPatternType({ historyMovePct, outcomeMovePct, thresholdPct: Number(p.forwardReturnThresholdPct) });

    console.log(`#${p.orderIndex} ${p.symbol.padEnd(8)} history=${historyMovePct.toFixed(2)}% outcome=${outcomeMovePct.toFixed(2)}% -> ${patternType}`);
    if (commit) {
      await db.update(puzzles).set({ patternType }).where(eq(puzzles.id, p.id));
    }
  }
  console.log(commit ? `Backfilled ${rows.length} puzzles.` : `Dry run — ${rows.length} previewed, nothing written. Re-run with --commit.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
