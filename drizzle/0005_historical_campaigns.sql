-- Historical Campaigns: one graded attempt per campaign mission
CREATE UNIQUE INDEX IF NOT EXISTS "attempts_campaign_unique" ON "attempts" USING btree ("user_id","mode","period_key") WHERE "mode" = 'campaign';
