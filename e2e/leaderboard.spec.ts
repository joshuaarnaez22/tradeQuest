import { test, expect } from "@playwright/test";
import { sql } from "./helpers";

test.describe("Leaderboard", () => {
  test("shows ranked rows with medals, including dummy data if seeded", async ({ page }) => {
    const [{ n }] = await sql`select count(distinct user_id)::int as n from attempts`;

    await page.goto("/leaderboard");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }

    await expect(page.getByText("Ranked by XP, this season")).toBeVisible();

    if (n === 0) {
      await expect(page.getByText("No graded puzzles yet.")).toBeVisible();
      return;
    }

    // Rank #1 always gets the numeral-in-a-medal treatment.
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/\d+ XP/).first()).toBeVisible();

    if (n >= 20) {
      // scripts/seed-dummy-data.ts was run — confirm real volume rendered,
      // not just the one real user.
      const rows = page.locator("text=/\\d+ XP/");
      expect(await rows.count()).toBeGreaterThanOrEqual(20);
    }
  });
});
