import { test, expect } from "@playwright/test";

// Overrides the project-wide signed-in storageState — this file is
// specifically testing what happens with NO session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Auth gate", () => {
  // (app)/layout.tsx wraps replay, dashboard, AND leaderboard, and
  // unconditionally redirects when there's no session — none of the three
  // are publicly viewable, despite leaderboard/page.tsx's own auth() call
  // looking optional (it's only used there to highlight the viewer's row;
  // the actual gate already ran one level up in the layout).
  for (const path of ["/replay", "/dashboard", "/leaderboard"]) {
    test(`${path} redirects an unauthenticated visitor to sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    });
  }

  test("the marketing landing page stays public", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});
