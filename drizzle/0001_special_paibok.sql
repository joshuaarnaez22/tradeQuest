-- puzzles.id / attempts.id switch from serial to uuid. Existing rows can't be
-- cast (int -> uuid isn't a valid conversion), and per-decision this data is
-- disposable (100 seeded puzzles + one test attempt) — wiped and reseeded via
-- scripts/seed-puzzles.ts instead of migrated in place.
DELETE FROM "attempts";--> statement-breakpoint
DELETE FROM "puzzles";--> statement-breakpoint
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_puzzle_id_puzzles_id_fk";--> statement-breakpoint
ALTER TABLE "puzzles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "puzzles" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "puzzles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "puzzle_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_puzzle_id_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzles"("id") ON DELETE no action ON UPDATE no action;
