import { PhasePlaceholder } from "@/components/PhasePlaceholder";

// TODO(Phase 7): GROUP BY user_id ORDER BY SUM(xp_awarded) DESC LIMIT 50, revalidate = 60.
export default function LeaderboardPage() {
  return <PhasePlaceholder title="Leaderboard" note="Global XP ranking lands here in Phase 7." />;
}
