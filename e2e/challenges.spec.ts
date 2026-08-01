import { test, expect } from "@playwright/test";
import { sql, getSoleTestUserId, clearAttempt, clearAttemptsByMode, isoDate } from "./helpers";

test.describe("Challenge Variety", () => {
  let userId: string;

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
  });

  test.afterAll(async () => {
    await clearAttemptsByMode(userId, "weekly");
    await clearAttemptsByMode(userId, "speed");
    await clearAttemptsByMode(userId, "mistake");
    await clearAttempt(userId, isoDate(0), "daily");
  });

  test("challenges hub shows all three modes", async ({ page }) => {
    await page.goto("/challenges");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }
    await expect(page.getByRole("heading", { name: "Challenges" })).toBeVisible();
    await expect(page.getByText("Replay Mistakes")).toBeVisible();
    await expect(page.getByText("Speed Mode")).toBeVisible();
    await expect(page.getByText(/Weekly Challenge/)).toBeVisible();
    await expect(page.getByTestId("weekly-progress")).toBeVisible();
  });

  test("daily uniqueness is a partial index on mode=daily only", async () => {
    const rows = await sql`
      select indexname, indexdef from pg_indexes
      where tablename = 'attempts' and indexname = 'attempts_user_date_daily_unique'`;
    expect(rows.length).toBe(1);
    expect(rows[0].indexdef).toMatch(/mode.*=.*daily/i);
  });

  test("a weekly challenge attempt does not inflate weekly goal progress", async ({ page }) => {
    // Snapshot daily-only week count from the dashboard before inserting a weekly row.
    await page.goto("/dashboard");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — re-run e2e auth setup.");
    }
    const beforeText = await page.getByText(/puzzles this week/).textContent();

    const [puzzle] = await sql`select id from puzzles where is_published = true order by order_index limit 1`;
    const today = isoDate(0);
    // Derive current ISO week the same way the app stores period_key.
    const d = new Date();
    const dayIndex = (d.getUTCDay() + 6) % 7;
    const thursday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dayIndex + 3));
    const weekYear = thursday.getUTCFullYear();
    const week1 = new Date(Date.UTC(weekYear, 0, 4));
    const week1Day = (week1.getUTCDay() + 6) % 7;
    week1.setUTCDate(week1.getUTCDate() - week1Day);
    const week = 1 + Math.round((thursday.getTime() - week1.getTime()) / 86_400_000 / 7);
    const periodKey = `${weekYear}-W${String(week).padStart(2, "0")}`;

    await sql`
      insert into attempts (user_id, puzzle_id, decision, forward_return_pct, is_correct, xp_awarded, attempt_date, mode, period_key)
      values (${userId}, ${puzzle.id}, 'buy', '1.00', true, 15, ${today}, 'weekly', ${periodKey})
      on conflict do nothing`;

    await page.reload();
    const afterText = await page.getByText(/puzzles this week/).textContent();
    // Goal bar copy is unchanged — weekly challenge rows must not bump the count.
    expect(afterText).toBe(beforeText);

    await clearAttemptsByMode(userId, "weekly");
  });

  test("weekly challenge play page grades via mode=weekly", async ({ page }) => {
    await clearAttemptsByMode(userId, "weekly");
    await page.goto("/challenges");
    const link = page.getByTestId("weekly-link").first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByText(/weekly challenge/i)).toBeVisible();

    const waitButton = page.getByRole("button", { name: /wait/i });
    await expect(waitButton).toBeVisible({ timeout: 15_000 });
    await waitButton.click();
    // DeepSeek explanation can take ~20s — keep headroom above the API latency.
    await expect(page.getByText(/\+\d+ XP/)).toBeVisible({ timeout: 45_000 });

    const rows = await sql`
      select mode, period_key from attempts
      where user_id = ${userId} and mode = 'weekly'
      order by created_at desc limit 1`;
    expect(rows.length).toBe(1);
    expect(rows[0].mode).toBe("weekly");
    expect(rows[0].period_key).toMatch(/^\d{4}-W\d{2}$/);

    await clearAttemptsByMode(userId, "weekly");
  });
});
