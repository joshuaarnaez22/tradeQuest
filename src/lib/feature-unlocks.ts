import assert from "node:assert";

// Feature unlock ladder — level comes from levelForXp (100 XP per level).
// Level 1 is Learn-first: new players study before the daily puzzle unlocks.
// Dashboard + Leaderboard stay open so progress is always visible.
export const FEATURE_UNLOCK_LEVEL = {
  learn: 1,
  dashboard: 1,
  leaderboard: 1,
  replay: 2,
  challenges: 3,
  campaigns: 4,
} as const;

export type AppFeature = keyof typeof FEATURE_UNLOCK_LEVEL;

export type AttemptModeForUnlock = "daily" | "mistake" | "speed" | "weekly" | "campaign";

export function unlockLevelFor(feature: AppFeature): number {
  return FEATURE_UNLOCK_LEVEL[feature];
}

export function isFeatureUnlocked(level: number, feature: AppFeature): boolean {
  return level >= FEATURE_UNLOCK_LEVEL[feature];
}

export function featureForAttemptMode(mode: AttemptModeForUnlock): AppFeature {
  if (mode === "daily") return "replay";
  if (mode === "campaign") return "campaigns";
  return "challenges";
}

/** First unlocked "play" destination for post-auth landing. */
export function defaultHomeForLevel(level: number): string {
  if (isFeatureUnlocked(level, "replay")) return "/replay";
  return "/learn";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assert.equal(isFeatureUnlocked(1, "learn"), true);
  assert.equal(isFeatureUnlocked(1, "replay"), false);
  assert.equal(isFeatureUnlocked(2, "replay"), true);
  assert.equal(isFeatureUnlocked(3, "challenges"), true);
  assert.equal(isFeatureUnlocked(3, "campaigns"), false);
  assert.equal(isFeatureUnlocked(4, "campaigns"), true);
  assert.equal(featureForAttemptMode("daily"), "replay");
  assert.equal(featureForAttemptMode("speed"), "challenges");
  assert.equal(featureForAttemptMode("campaign"), "campaigns");
  assert.equal(defaultHomeForLevel(1), "/learn");
  assert.equal(defaultHomeForLevel(5), "/replay");
  console.log("feature-unlocks.ts: all checks passed");
}
