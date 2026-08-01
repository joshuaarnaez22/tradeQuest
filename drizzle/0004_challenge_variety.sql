ALTER TABLE "attempts" DROP CONSTRAINT "attempts_user_date_unique";--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "mode" text DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "period_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_user_date_daily_unique" ON "attempts" USING btree ("user_id","attempt_date") WHERE "attempts"."mode" = 'daily';--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_weekly_unique" ON "attempts" USING btree ("user_id","puzzle_id","mode","period_key") WHERE "attempts"."mode" = 'weekly';--> statement-breakpoint
CREATE INDEX "attempts_user_mode_idx" ON "attempts" USING btree ("user_id","mode");