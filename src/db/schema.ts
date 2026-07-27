import { pgTable, serial, smallint, text, timestamp, date, jsonb, numeric, integer, boolean, unique } from "drizzle-orm/pg-core";

// Clerk owns identity/session/email. This table holds only what Clerk doesn't.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastReminderSentAt: date("last_reminder_sent_at"), // cron idempotency
});

// 100 hand-authored rows, seeded once, never mutated by user traffic.
export const puzzles = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  orderIndex: smallint("order_index").notNull().unique(), // drives puzzles[dayOfYear % 100]
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull().default("1H"),
  candles: jsonb("candles").notNull().$type<{ t: number; open: number; high: number; low: number; close: number; volume: number }[]>(),
  decisionIndex: smallint("decision_index").notNull(),
  outcomeWindowCandles: smallint("outcome_window_candles").notNull(),
  forwardReturnThresholdPct: numeric("forward_return_threshold_pct", { precision: 5, scale: 2 }).notNull(),
  setupNote: text("setup_note").notNull(), // feeds the AI Mentor explanation prompt
  isPublished: boolean("is_published").notNull().default(true),
});

export const decisionEnum = ["buy", "sell", "wait"] as const;
export type Decision = (typeof decisionEnum)[number];

export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    puzzleId: integer("puzzle_id").notNull().references(() => puzzles.id),
    decision: text("decision", { enum: decisionEnum }).notNull(),
    forwardReturnPct: numeric("forward_return_pct", { precision: 6, scale: 2 }).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    xpAwarded: integer("xp_awarded").notNull(),
    aiExplanation: text("ai_explanation"), // cached so a revisit doesn't re-call the model
    attemptDate: date("attempt_date").notNull(), // UTC date — the field streak logic keys off
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // One graded attempt per user per calendar day — NOT per puzzle, since
    // puzzles[dayOfYear % 100] legitimately repeats the same puzzle every ~100 days.
    unique("attempts_user_date_unique").on(table.userId, table.attemptDate),
  ]
);
