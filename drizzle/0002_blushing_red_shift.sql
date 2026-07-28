-- 100 puzzle rows already exist; NOT NULL with no default would fail against
-- them. Temporary default so the column can be added, then immediately
-- overwritten with real values by scripts/backfill-pattern-types.ts --commit.
ALTER TABLE "puzzles" ADD COLUMN "pattern_type" text NOT NULL DEFAULT 'range';
