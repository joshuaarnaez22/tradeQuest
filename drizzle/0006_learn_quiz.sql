-- Learn + Quiz: first-pass quiz completions (XP once per module)
CREATE TABLE IF NOT EXISTS "quiz_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"passed" boolean NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_completions_user_module_unique" UNIQUE("user_id","module_id")
);
--> statement-breakpoint
ALTER TABLE "quiz_completions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_completions" ADD CONSTRAINT "quiz_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE POLICY "quiz_completions_select_own" ON "quiz_completions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "quiz_completions"."user_id"));--> statement-breakpoint
CREATE POLICY "quiz_completions_insert_own" ON "quiz_completions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "quiz_completions"."user_id"));--> statement-breakpoint
CREATE POLICY "quiz_completions_update_own" ON "quiz_completions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "quiz_completions"."user_id")) WITH CHECK ((select auth.user_id() = "quiz_completions"."user_id"));
