import { test, expect } from "@playwright/test";
import { sql, isoDate, getSoleTestUserId, getTodaysPuzzle, clearAttempt } from "./helpers";

test.describe("Dashboard", () => {
  let userId: string;

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
    const today = await getTodaysPuzzle();

    // Seed a known-shape graded attempt directly — this file checks
    // rendering of already-graded data, not the grading endpoint itself
    // (that's replay.spec.ts's job).
    await clearAttempt(userId, isoDate(0));
    await sql`insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date)
      values (${userId}, ${today.id}, 'buy', 5, true, 15, ${isoDate(0)})`;
  });

  test.afterAll(async () => {
    await clearAttempt(userId, isoDate(0));
  });

  test("shows current streak, XP progress, and today's session", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }

    await expect(page.getByText("Current streak")).toBeVisible();
    // The streak number and "day"/"days" render in the same span (nested
    // elements, concatenated text — e.g. "1day"), so match the pair rather
    // than assuming the digit stands alone as its own element's full text.
    await expect(page.getByText(/\d+\s*days?/i).first()).toBeVisible();

    await expect(page.getByText("Level progress")).toBeVisible();
    // Loose on the exact number (total XP includes any other historical
    // attempts this user has) — confirms the bar renders with real data.
    await expect(page.getByText(/\d+ \/ \d+ XP/)).toBeVisible();

    await expect(page.getByText("Recent sessions")).toBeVisible();
    await expect(page.getByText(isoDate(0))).toBeVisible();
    // Loose on the exact count (other historical attempts may exist for
    // this user) — just confirms the summary line renders at all.
    await expect(page.getByText(/\d+ of \d+ read correctly/)).toBeVisible();
  });
});
