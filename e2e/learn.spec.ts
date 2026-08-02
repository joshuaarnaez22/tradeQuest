import { test, expect } from "@playwright/test";
import { sql, getSoleTestUserId } from "./helpers";

// Correct option indexes for support-resistance — mirrored from
// src/lib/learn-modules.ts (e2e can't import that file: import.meta self-check).
const SUPPORT_RESISTANCE_ANSWERS = [1, 0, 1, 1];

test.describe("Learn + Quiz", () => {
  let userId: string;
  const moduleId = "support-resistance";

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
  });

  test.afterAll(async () => {
    await sql`delete from quiz_completions where user_id = ${userId}`;
    await sql`delete from user_badges where user_id = ${userId} and badge_id in ('first_quiz_pass', 'learn_all_modules')`;
  });

  test.beforeEach(async () => {
    await sql`delete from quiz_completions where user_id = ${userId} and module_id = ${moduleId}`;
    await sql`delete from user_badges where user_id = ${userId} and badge_id in ('first_quiz_pass', 'learn_all_modules')`;
  });

  test("learn hub lists all four modules", async ({ page }) => {
    await page.goto("/learn");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — re-run e2e auth setup.");
    }
    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
    await expect(page.getByText("Support & Resistance")).toBeVisible();
    await expect(page.getByText("Trends")).toBeVisible();
    await expect(page.getByText("Breakouts")).toBeVisible();
    await expect(page.getByText("Ranges & Waiting")).toBeVisible();
    await expect(page.getByTestId("learn-hub-progress")).toContainText("0/4");
  });

  test("lesson page shows content and quiz CTA", async ({ page }) => {
    await page.goto(`/learn/${moduleId}`);
    await expect(page.getByTestId("learn-lesson")).toBeVisible();
    await expect(page.getByTestId("learn-lesson")).toContainText("What support and resistance are");
    await expect(page.getByTestId("learn-take-quiz")).toBeVisible();
  });

  test("passing the quiz writes quiz_completions and awards XP once", async ({ page }) => {
    await page.goto(`/learn/${moduleId}/quiz`);

    for (let i = 0; i < SUPPORT_RESISTANCE_ANSWERS.length; i++) {
      await page.getByTestId(`quiz-q-${i}`).getByRole("radio").nth(SUPPORT_RESISTANCE_ANSWERS[i]!).check();
    }
    await page.getByTestId("quiz-submit").click();

    await expect(page.getByTestId("quiz-result")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("quiz-result")).toContainText("Passed");
    await expect(page.getByTestId("quiz-result")).toContainText("+25 XP");

    const rows = await sql`
      select module_id, passed, xp_awarded, score, total
      from quiz_completions
      where user_id = ${userId} and module_id = ${moduleId}`;
    expect(rows.length).toBe(1);
    expect(rows[0].passed).toBe(true);
    expect(Number(rows[0].xp_awarded)).toBe(25);
    expect(Number(rows[0].score)).toBe(4);

    const badges = await sql`
      select badge_id from user_badges where user_id = ${userId} and badge_id = 'first_quiz_pass'`;
    expect(badges.length).toBe(1);

    // Retake should not award XP again.
    await page.goto(`/learn/${moduleId}/quiz`);
    for (let i = 0; i < SUPPORT_RESISTANCE_ANSWERS.length; i++) {
      await page.getByTestId(`quiz-q-${i}`).getByRole("radio").nth(SUPPORT_RESISTANCE_ANSWERS[i]!).check();
    }
    await page.getByTestId("quiz-submit").click();
    await expect(page.getByTestId("quiz-result")).toContainText("XP already earned");

    const rowsAfter = await sql`
      select xp_awarded from quiz_completions where user_id = ${userId} and module_id = ${moduleId}`;
    expect(Number(rowsAfter[0].xp_awarded)).toBe(25);
  });

  test("quiz_completions table exists with unique user+module", async () => {
    const rows = await sql`
      select conname from pg_constraint
      where conrelid = 'quiz_completions'::regclass and contype = 'u'`;
    expect(rows.some((r) => r.conname === "quiz_completions_user_module_unique")).toBe(true);
  });
});
