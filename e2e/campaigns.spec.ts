import { test, expect } from "@playwright/test";
import { sql, getSoleTestUserId, clearAttemptsByMode } from "./helpers";

test.describe("Historical Campaigns", () => {
  let userId: string;

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
  });

  test.afterAll(async () => {
    await clearAttemptsByMode(userId, "campaign");
  });

  test.beforeEach(async () => {
    await clearAttemptsByMode(userId, "campaign");
  });

  test("campaigns hub lists both arcs", async ({ page }) => {
    await page.goto("/campaigns");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — re-run e2e auth setup.");
    }
    await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
    await expect(page.getByText("Contagion 2022")).toBeVisible();
    await expect(page.getByText("COVID Shock")).toBeVisible();
    await expect(page.getByTestId("campaign-progress-contagion-2022")).toContainText("0/4");
  });

  test("mission 1 is locked until mission 0 is graded", async ({ page }) => {
    await page.goto("/campaigns/covid-shock");
    await expect(page.getByText("Locked").first()).toBeVisible();
    await expect(page.getByTestId("campaign-mission-0")).toBeVisible();
    await expect(page.getByTestId("campaign-mission-1")).toHaveCount(0);
  });

  test("grading mission 0 writes mode=campaign and unlocks the next beat", async ({ page }) => {
    await page.goto("/campaigns/covid-shock/0");
    await expect(page.getByTestId("campaign-beat")).toBeVisible();
    await page.getByTestId("campaign-beat-continue").click();

    const waitButton = page.getByRole("button", { name: /wait/i });
    await expect(waitButton).toBeVisible({ timeout: 15_000 });
    await waitButton.click();
    await expect(page.getByText(/\+\d+ XP/)).toBeVisible({ timeout: 45_000 });

    const rows = await sql`
      select mode, period_key from attempts
      where user_id = ${userId} and mode = 'campaign'
      order by created_at desc limit 1`;
    expect(rows.length).toBe(1);
    expect(rows[0].mode).toBe("campaign");
    expect(rows[0].period_key).toBe("covid-shock:0");

    await page.goto("/campaigns/covid-shock");
    await expect(page.getByTestId("campaign-mission-1")).toBeVisible();
    await expect(page.getByTestId("campaign-detail-progress")).toContainText("1/3");
  });

  test("campaign uniqueness index exists", async () => {
    const rows = await sql`
      select indexname, indexdef from pg_indexes
      where tablename = 'attempts' and indexname = 'attempts_campaign_unique'`;
    expect(rows.length).toBe(1);
    expect(rows[0].indexdef).toMatch(/mode.*=.*campaign/i);
  });
});
