import { test, expect, type Page } from "@playwright/test";
import { isoDate, getSoleTestUserId, clearAttempt } from "./helpers";

// Dismisses the Learning & Progression lesson card if one happens to be
// showing today — this file is testing core grading, not that mechanic.
// Waits for EITHER the lesson card or a decision button first (plain
// isVisible() doesn't wait, so checking it immediately after goto() can
// race the page's initial render and miss a lesson that appears a beat
// later — either the server hasn't finished the request or the client
// hasn't hydrated yet), then only clicks if the lesson is what showed up.
async function skipLessonIfPresent(page: Page) {
  const continueButton = page.getByTestId("lesson-continue");
  const decisionButton = page.getByRole("button", { name: /wait/i });
  await expect(continueButton.or(decisionButton)).toBeVisible({ timeout: 15_000 });
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
}

test.describe("Replay: puzzle solving + grading", () => {
  let userId: string;

  test.beforeAll(async () => {
    userId = await getSoleTestUserId();
  });

  test.beforeEach(async () => {
    await clearAttempt(userId, isoDate(0));
  });

  test.afterAll(async () => {
    await clearAttempt(userId, isoDate(0));
  });

  test("submitting a decision grades it and shows XP", async ({ page }) => {
    await page.goto("/replay");
    if (page.url().includes("/sign-in")) {
      throw new Error("Redirected to /sign-in — the saved session in e2e/.auth/user.json has expired. Re-run the codegen setup in e2e/README.md.");
    }
    await skipLessonIfPresent(page);

    const waitButton = page.getByRole("button", { name: /wait/i });
    await expect(waitButton).toBeVisible();
    await waitButton.click();

    await expect(page.getByText(/\+\d+ XP/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Come back tomorrow for the next puzzle.")).toBeVisible();
    // Decision controls are gone once graded — no re-submitting.
    await expect(page.getByRole("button", { name: /wait/i })).not.toBeVisible();
  });

  test("revisiting the same day shows the cached result, not a fresh grade", async ({ page }) => {
    await page.goto("/replay");
    await skipLessonIfPresent(page);
    await page.getByRole("button", { name: /sell/i }).click();

    const xpLocator = page.getByText(/\+\d+ XP/);
    await expect(xpLocator).toBeVisible({ timeout: 15_000 });
    const firstXpText = await xpLocator.textContent();

    await page.reload();
    await expect(xpLocator).toBeVisible();
    const secondXpText = await xpLocator.textContent();

    // Same XP value both times proves /api/attempts short-circuited to the
    // cached row on the second load rather than re-grading (which could,
    // in principle, award XP twice).
    expect(secondXpText).toBe(firstXpText);
  });
});
