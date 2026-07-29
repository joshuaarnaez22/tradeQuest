import { test, expect } from "@playwright/test";
import { sql, isoDate, getSoleTestUserId, getTodaysPuzzle, clearAttempt, clearAttemptsForPatternType } from "./helpers";
import { patternTypeEnum } from "../src/db/schema";
import { LESSONS } from "../src/lib/lessons";

// The feature has 4 pieces, only the last of which is visible in the
// browser — these tests cover all 4, not just the UI:
//   1. pattern tagging      -> "every published puzzle has a valid pattern type"
//   2. struggle detection   -> "struggle query flips true/false with the data"
//   3. lesson content       -> lesson-card text assertions inside test #4
//   4. the lesson card UI   -> "shows a lesson when struggling..." / "a non-struggling puzzle..."

test.describe("Learning & Progression", () => {
  let userId: string;
  const seededDates = [isoDate(1), isoDate(2)];

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
    const today = await getTodaysPuzzle();

    const samePattern = await sql`
      select id from puzzles
      where is_published = true and pattern_type = ${today.patternType} and id != ${today.id}
      limit 2`;
    if (samePattern.length < 2) {
      throw new Error(`Only ${samePattern.length} other '${today.patternType}' puzzles exist — need 2 to manufacture a struggling state.`);
    }

    await clearAttempt(userId, isoDate(0));
    // Wipe ALL of this pattern type's history, not just our own known
    // dates — other seed scripts can have added same-pattern rows on
    // dates this file doesn't know about.
    await clearAttemptsForPatternType(userId, today.patternType);

    for (const [i, date] of seededDates.entries()) {
      await sql`insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date)
        values (${userId}, ${samePattern[i].id}, 'wait', 0, false, 0, ${date})`;
    }
  });

  test.afterAll(async () => {
    for (const date of seededDates) await clearAttempt(userId, date);
    await clearAttempt(userId, isoDate(0)); // whatever this test itself graded today
  });

  // Piece 1: pattern tagging. No page needed — this is a data integrity
  // check that the backfill/seed pipeline actually tagged everything.
  test("every published puzzle has a valid pattern type", async () => {
    const rows = await sql`select order_index, pattern_type from puzzles where is_published = true`;
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(patternTypeEnum, `puzzle #${row.order_index} has pattern_type '${row.pattern_type}'`).toContain(row.pattern_type);
    }
  });

  // Piece 2: struggle detection. Verifies the actual SQL shape
  // getStruggleForPatternType (src/lib/learning.ts) runs — the pure
  // isStruggling() math itself already has its own runnable self-check
  // (npx tsx src/lib/learning.ts); this confirms the query wired around it
  // sees the same data a real request would.
  test("struggle query flips true/false with the data", async () => {
    const today = await getTodaysPuzzle();

    const strugglingRows = await sql`
      select a.is_correct from attempts a join puzzles p on p.id = a.puzzle_id
      where a.user_id = ${userId} and p.pattern_type = ${today.patternType}
      order by a.attempt_date desc limit 3`;
    const wrongCount = strugglingRows.filter((r) => !r.is_correct).length;
    expect(strugglingRows.length, "beforeAll should have seeded 2 rows for today's pattern type").toBeGreaterThanOrEqual(2);
    expect(wrongCount).toBeGreaterThanOrEqual(2);

    await clearAttempt(userId, isoDate(0));
    await clearAttemptsForPatternType(userId, today.patternType);

    const clearedRows = await sql`
      select a.is_correct from attempts a join puzzles p on p.id = a.puzzle_id
      where a.user_id = ${userId} and p.pattern_type = ${today.patternType}
      order by a.attempt_date desc limit 3`;
    expect(clearedRows.length, "clearing all of this pattern type's history should drop this below the struggle threshold").toBeLessThan(2);

    // Restore what beforeAll set up, so the next test in this file still
    // sees a struggling state regardless of execution order.
    const samePattern = await sql`
      select id from puzzles where is_published = true and pattern_type = ${today.patternType} and id != ${today.id} limit 2`;
    for (const [i, date] of seededDates.entries()) {
      await sql`insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date)
        values (${userId}, ${samePattern[i].id}, 'wait', 0, false, 0, ${date})`;
    }
  });

  test("shows a lesson when struggling, reveals the puzzle on continue, and grades normally", async ({ page }) => {
    const today = await getTodaysPuzzle();
    const expectedLesson = LESSONS[today.patternType as keyof typeof LESSONS];

    await page.goto("/replay");

    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }

    const lessonCard = page.getByTestId("lesson-card");
    await expect(lessonCard).toBeVisible();

    // Piece 3: lesson content — not just "a" card, the RIGHT card for
    // today's actual pattern type, word-for-word.
    await expect(lessonCard).toContainText(expectedLesson.title);
    await expect(lessonCard).toContainText(expectedLesson.body);

    const continueButton = page.getByTestId("lesson-continue");
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    await expect(lessonCard).not.toBeVisible();
    const waitButton = page.getByRole("button", { name: /wait/i });
    await expect(waitButton).toBeVisible();
    await expect(page.getByRole("button", { name: /buy/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sell/i })).toBeVisible();

    await waitButton.click();

    await expect(page.getByText(/XP/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Come back tomorrow for the next puzzle.")).toBeVisible();
  });

  test("a non-struggling puzzle skips the lesson entirely", async ({ page }) => {
    const today = await getTodaysPuzzle();
    await clearAttempt(userId, isoDate(0));
    await clearAttemptsForPatternType(userId, today.patternType);

    await page.goto("/replay");
    await expect(page.getByTestId("lesson-card")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /wait/i })).toBeVisible();
  });
});
