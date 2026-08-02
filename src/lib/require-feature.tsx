import { getUserLevel } from "@/lib/user-level";
import { isFeatureUnlocked, type AppFeature } from "@/lib/feature-unlocks";
import { FeatureLocked } from "@/components/FeatureLocked";

/** Returns null when unlocked; otherwise a locked-state element to render. */
export async function requireFeature(userId: string, feature: AppFeature) {
  const level = await getUserLevel(userId);
  if (isFeatureUnlocked(level, feature)) return null;
  return <FeatureLocked feature={feature} currentLevel={level} />;
}
