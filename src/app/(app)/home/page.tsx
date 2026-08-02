import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserLevel } from "@/lib/user-level";
import { defaultHomeForLevel } from "@/lib/feature-unlocks";

/** Level-aware post-auth landing (Learn at L1, Replay once unlocked). */
export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const level = await getUserLevel(userId);
  redirect(defaultHomeForLevel(level));
}
