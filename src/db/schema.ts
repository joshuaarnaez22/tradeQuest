import { pgTable, uuid, smallint, text, timestamp, date, jsonb, numeric, integer, boolean, unique, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "drizzle-orm/neon/rls";

// Clerk owns identity/session/email. This table holds only what Clerk doesn't.
// RLS: a user may only read their own row. Insert/update happen exclusively via
// the Clerk webhook (src/app/api/webhooks/clerk/route.ts) on the trusted/admin
// connection, so there's deliberately no modify policy for `authenticated` here
// — that leaves insert/update/delete denied by RLS's default-deny for that role.
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user ID
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastReminderSentAt: date("last_reminder_sent_at"), // cron idempotency
  },
  (table) => [
    // Phase 8 cron scans for users whose reminder is stale — see route TODO.
    index("users_last_reminder_sent_at_idx").on(table.lastReminderSentAt),
    pgPolicy("users_select_own", { for: "select", to: authenticatedRole, using: authUid(table.id) }),
  ]
).enableRLS();

// Derived from each puzzle's own candles (src/lib/pattern-type.ts) — not
// hand-authored per row.
export const patternTypeEnum = ["breakout", "trend_continuation", "reversal", "range"] as const;
export type PatternType = (typeof patternTypeEnum)[number];

// 100 hand-authored rows, seeded once, never mutated by user traffic.
// RLS: published puzzles are readable by any authenticated player; writes only
// happen via the seed script (scripts/seed-dev-puzzles.ts) on the admin connection.
export const puzzles = pgTable(
  "puzzles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderIndex: smallint("order_index").notNull().unique(), // drives puzzles[dayOfYear % 100]
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull().default("1H"),
    candles: jsonb("candles").notNull().$type<{ t: number; open: number; high: number; low: number; close: number; volume: number }[]>(),
    decisionIndex: smallint("decision_index").notNull(),
    outcomeWindowCandles: smallint("outcome_window_candles").notNull(),
    forwardReturnThresholdPct: numeric("forward_return_threshold_pct", { precision: 5, scale: 2 }).notNull(),
    setupNote: text("setup_note").notNull(), // feeds the AI Mentor explanation prompt
    patternType: text("pattern_type", { enum: patternTypeEnum }).notNull(),
    isPublished: boolean("is_published").notNull().default(true),
  },
  (table) => [pgPolicy("puzzles_select_published", { for: "select", to: authenticatedRole, using: sql`${table.isPublished} = true` })]
).enableRLS();

export const decisionEnum = ["buy", "sell", "wait"] as const;
export type Decision = (typeof decisionEnum)[number];

export const attemptModeEnum = ["daily", "mistake", "speed", "weekly"] as const;
export type AttemptMode = (typeof attemptModeEnum)[number];

// RLS: a user may read and insert only their own attempts. No update/delete
// policy — graded attempts are immutable game history, so both stay denied by
// RLS's default-deny for `authenticated`.
export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    puzzleId: uuid("puzzle_id").notNull().references(() => puzzles.id),
    decision: text("decision", { enum: decisionEnum }).notNull(),
    forwardReturnPct: numeric("forward_return_pct", { precision: 6, scale: 2 }).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    xpAwarded: integer("xp_awarded").notNull(),
    aiExplanation: text("ai_explanation"), // cached so a revisit doesn't re-call the model
    attemptDate: date("attempt_date").notNull(), // UTC date — the field streak logic keys off
    // Challenge Variety: daily is the streak/habit row; other modes award XP
    // without counting toward streak or weekly/monthly goals.
    mode: text("mode", { enum: attemptModeEnum }).notNull().default("daily"),
    // ISO week key (YYYY-Www) for weekly-mode rows; null otherwise.
    periodKey: text("period_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // One *daily* graded attempt per user per calendar day — challenge modes
    // can coexist on the same date. Leftmost column (user_id) still covers
    // plain per-user lookups (getUserXp, getUserStreak, getRecentSessions).
    uniqueIndex("attempts_user_date_daily_unique")
      .on(table.userId, table.attemptDate)
      .where(sql`${table.mode} = 'daily'`),
    // One graded attempt per weekly-challenge puzzle per ISO week.
    uniqueIndex("attempts_weekly_unique")
      .on(table.userId, table.puzzleId, table.mode, table.periodKey)
      .where(sql`${table.mode} = 'weekly'`),
    // puzzle_id is a bare FK with no other index covering it (leaderboard/stats
    // group by user_id, not puzzle_id, so the unique indexes above don't help).
    index("attempts_puzzle_id_idx").on(table.puzzleId),
    index("attempts_user_mode_idx").on(table.userId, table.mode),
    pgPolicy("attempts_select_own", { for: "select", to: authenticatedRole, using: authUid(table.userId) }),
    pgPolicy("attempts_insert_own", { for: "insert", to: authenticatedRole, withCheck: authUid(table.userId) }),
  ]
).enableRLS();

// Permanent, earned-once records — the moment a badge is newly earned
// (checked in POST /api/attempts right after grading), a row lands here
// and stays forever, even if the underlying condition later becomes false
// again (e.g. a streak badge stays earned after the streak lapses).
export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    badgeId: text("badge_id").notNull(), // matches an id in src/lib/badges.ts — no DB catalog table
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_badges_user_badge_unique").on(table.userId, table.badgeId),
    pgPolicy("user_badges_select_own", { for: "select", to: authenticatedRole, using: authUid(table.userId) }),
    pgPolicy("user_badges_insert_own", { for: "insert", to: authenticatedRole, withCheck: authUid(table.userId) }),
  ]
).enableRLS();
