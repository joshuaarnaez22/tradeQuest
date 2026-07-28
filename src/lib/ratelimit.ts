import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// The Vercel Marketplace Upstash integration writes KV_* var names (legacy
// @vercel/kv naming, kept for compat), not the SDK's default
// UPSTASH_REDIS_REST_URL/TOKEN — so an explicit constructor, not fromEnv().
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Caps the AI-explanation call in /api/attempts: a legitimate user only ever
// triggers one successful grading call per day (the (user_id, attempt_date)
// uniqueness check short-circuits repeats before the model is ever called),
// so this only needs to guard against rapid-retry hammering, not real traffic.
export const attemptsRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
