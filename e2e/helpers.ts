import { neon } from "@neondatabase/serverless";

// Same DB the dev server uses — this repo has no separate test DB yet.
// Every helper here only ever touches specific rows it's given, never a
// blanket wipe.
export const sql = neon(process.env.DATABASE_URL!);

export function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// Mirrors src/lib/puzzle-of-day.ts exactly.
export function puzzleIndexForToday(count: number): number {
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  return dayOfYear % count;
}

export async function getSoleTestUserId(): Promise<string> {
  const [user] = await sql`select id from users where id not like 'dummy_user_%' limit 1`;
  if (!user) throw new Error("No real user row found — sign in once via the app before running e2e tests.");
  return user.id;
}

export async function getTodaysPuzzle(): Promise<{ id: string; patternType: string; symbol: string }> {
  const puzzles = await sql`select id, pattern_type, symbol from puzzles where is_published = true order by order_index`;
  if (puzzles.length === 0) throw new Error("No published puzzles — run scripts/seed-puzzles.ts --commit first.");
  const idx = puzzleIndexForToday(puzzles.length);
  return { id: puzzles[idx].id, patternType: puzzles[idx].pattern_type, symbol: puzzles[idx].symbol };
}

export async function clearAttempt(userId: string, date: string): Promise<void> {
  await sql`delete from attempts where user_id = ${userId} and attempt_date = ${date}`;
}

// Clears ALL of this user's attempts of one pattern type, not just known
// dates — other seed scripts (seed-gamification-demo.ts, seed-dummy-data.ts)
// can add history for the real test user on dates a test doesn't know
// about, which would otherwise leave stray rows behind after clearing only
// the dates a test itself seeded.
export async function clearAttemptsForPatternType(userId: string, patternType: string): Promise<void> {
  await sql`
    delete from attempts where id in (
      select a.id from attempts a join puzzles p on p.id = a.puzzle_id
      where a.user_id = ${userId} and p.pattern_type = ${patternType}
    )`;
}
