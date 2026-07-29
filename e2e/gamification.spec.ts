import { test, expect } from "@playwright/test";
import { sql, getSoleTestUserId } from "./helpers";

test.describe("Deeper Gamification", () => {
  let userId: string;

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
  });

  test("dashboard shows a level title, goal progress, and the badge grid", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }
    await expect(page.getByText(/Level \d+/)).toBeVisible();
    await expect(page.getByText(/puzzles this week/)).toBeVisible();
    await expect(page.getByText(/puzzles this month/)).toBeVisible();
    await expect(page.getByText(/Badges — \d+ \/ \d+/)).toBeVisible();
    await expect(page.getByText("First Correct Call")).toBeVisible();
  });

  // The award-on-grade path is exercised for real every time
  // replay.spec.ts submits a decision ("submitting a decision grades it
  // and shows XP") — that attempt's grading runs through the same
  // badge-check code this test would otherwise duplicate by trying to
  // force a specific outcome through the UI (which can't be guaranteed
  // correct, since today's actual puzzle decides that, not the test).
  // This test instead confirms the data shape the route handler queries
  // is well-formed and queryable, independent of the UI.
  test("attempts data is queryable in the shape badge checks expect", async () => {
    const rows = await sql`select attempt_date, is_correct from attempts where user_id = ${userId} order by attempt_date desc limit 3`;
    for (const row of rows) {
      expect(typeof row.is_correct).toBe("boolean");
      expect(row.attempt_date).toBeTruthy();
    }
  });

  test("user_badges enforces one earned row per user per badge", async () => {
    const [{ conname }] = await sql`
      select conname from pg_constraint
      where conrelid = 'user_badges'::regclass and contype = 'u'`;
    expect(conname).toBe("user_badges_user_badge_unique");
  });
});
