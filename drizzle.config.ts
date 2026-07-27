import { defineConfig } from "drizzle-kit";

// drizzle-kit's runner doesn't auto-load .env.local the way Next.js does.
process.loadEnvFile(".env.local");

// DATABASE_URL_UNPOOLED (direct connection), not DATABASE_URL (pooled) —
// migrations run DDL, which needs the direct connection per Neon's own guidance.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
