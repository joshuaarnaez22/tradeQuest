import { cookies } from "next/headers";
import { getUserXp } from "@/lib/stats";
import { levelForXp } from "@/lib/xp";

/** Dev/e2e only: set cookie `tq_e2e_level` to force a player level for unlock checks. */
export const E2E_LEVEL_COOKIE = "tq_e2e_level";

export async function getUserLevel(userId: string): Promise<number> {
  if (process.env.NODE_ENV !== "production") {
    const jar = await cookies();
    const forced = jar.get(E2E_LEVEL_COOKIE)?.value;
    if (forced && /^\d{1,4}$/.test(forced)) return Number(forced);
  }
  const xp = await getUserXp(userId);
  return levelForXp(xp).level;
}
