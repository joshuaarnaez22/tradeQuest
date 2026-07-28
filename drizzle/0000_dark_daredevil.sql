CREATE TABLE "attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"puzzle_id" integer NOT NULL,
	"decision" text NOT NULL,
	"forward_return_pct" numeric(6, 2) NOT NULL,
	"is_correct" boolean NOT NULL,
	"xp_awarded" integer NOT NULL,
	"ai_explanation" text,
	"attempt_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_user_date_unique" UNIQUE("user_id","attempt_date")
);
--> statement-breakpoint
ALTER TABLE "attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_index" smallint NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text DEFAULT '1H' NOT NULL,
	"candles" jsonb NOT NULL,
	"decision_index" smallint NOT NULL,
	"outcome_window_candles" smallint NOT NULL,
	"forward_return_threshold_pct" numeric(5, 2) NOT NULL,
	"setup_note" text NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	CONSTRAINT "puzzles_order_index_unique" UNIQUE("order_index")
);
--> statement-breakpoint
ALTER TABLE "puzzles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reminder_sent_at" date
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_puzzle_id_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_puzzle_id_idx" ON "attempts" USING btree ("puzzle_id");--> statement-breakpoint
CREATE INDEX "users_last_reminder_sent_at_idx" ON "users" USING btree ("last_reminder_sent_at");--> statement-breakpoint
CREATE POLICY "attempts_select_own" ON "attempts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "attempts"."user_id"));--> statement-breakpoint
CREATE POLICY "attempts_insert_own" ON "attempts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "attempts"."user_id"));--> statement-breakpoint
CREATE POLICY "puzzles_select_published" ON "puzzles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("puzzles"."is_published" = true);--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "users"."id"));