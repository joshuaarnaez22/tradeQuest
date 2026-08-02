import { test, expect } from "@playwright/test";

const E2E_LEVEL_COOKIE = "tq_e2e_level";

async function forceLevel(page: import("@playwright/test").Page, level: number) {
  await page.context().addCookies([
    {
      name: E2E_LEVEL_COOKIE,
      value: String(level),
      domain: "localhost",
      path: "/",
    },
  ]);
}

async function clearForcedLevel(page: import("@playwright/test").Page) {
  // Expire only the override — do not clearCookies() (would wipe Clerk auth).
  await page.context().addCookies([
    {
      name: E2E_LEVEL_COOKIE,
      value: "",
      domain: "localhost",
      path: "/",
      expires: 0,
    },
  ]);
}

test.describe("Feature unlocks", () => {
  test.afterEach(async ({ page }) => {
    await clearForcedLevel(page);
  });

  test("level 1 locks Replay, Challenges, and Campaigns", async ({ page }) => {
    await forceLevel(page, 1);
    await page.goto("/learn");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — re-run e2e auth setup.");
    }

    await expect(page.getByTestId("nav-level")).toHaveText("Lv 1");
    await expect(page.getByTestId("nav-replay")).toHaveAttribute("data-locked", "true");
    await expect(page.getByTestId("nav-challenges")).toHaveAttribute("data-locked", "true");
    await expect(page.getByTestId("nav-campaigns")).toHaveAttribute("data-locked", "true");
    await expect(page.getByTestId("nav-learn")).toHaveAttribute("data-locked", "false");

    await page.goto("/replay");
    await expect(page.getByTestId("feature-locked")).toBeVisible();
    await expect(page.getByTestId("feature-locked")).toContainText("Level 2");

    await page.goto("/challenges");
    await expect(page.getByTestId("feature-locked")).toContainText("Level 3");

    await page.goto("/campaigns");
    await expect(page.getByTestId("feature-locked")).toContainText("Level 4");
  });

  test("level 4 unlocks all play features", async ({ page }) => {
    await forceLevel(page, 4);
    await page.goto("/learn");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — re-run e2e auth setup.");
    }

    await expect(page.getByTestId("nav-level")).toHaveText("Lv 4");
    await expect(page.getByTestId("nav-replay")).toHaveAttribute("data-locked", "false");
    await expect(page.getByTestId("nav-challenges")).toHaveAttribute("data-locked", "false");
    await expect(page.getByTestId("nav-campaigns")).toHaveAttribute("data-locked", "false");

    await page.goto("/replay");
    await expect(page.getByTestId("feature-locked")).toHaveCount(0);

    await page.goto("/challenges");
    await expect(page.getByTestId("feature-locked")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Challenges" })).toBeVisible();

    await page.goto("/campaigns");
    await expect(page.getByTestId("feature-locked")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
  });
});
