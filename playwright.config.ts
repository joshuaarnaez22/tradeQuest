import { defineConfig, devices } from "@playwright/test";

// Playwright doesn't auto-load .env.local the way `next dev` does — same
// fix as drizzle.config.ts. Needed here so e2e/helpers.ts's neon() call
// (and the dev server npm run dev spawns below) both see DATABASE_URL.
process.loadEnvFile(".env.local");

// e2e/README.md explains the one-time auth setup this config depends on.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share one Neon dev DB and one Clerk test session — no isolation between workers
  workers: 1, // same reason, but across files too — two files racing today's attempt row would flake
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    storageState: "e2e/.auth/user.json",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
