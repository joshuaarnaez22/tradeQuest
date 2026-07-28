import { auth } from "@clerk/nextjs/server";
import { getLeaderboard } from "@/lib/stats";
import { Card } from "@/components/core/Card";
import { Badge } from "@/components/core/Badge";

// No realtime — TECH-STACK.md: "v1 leaderboard can just be a polled/revalidated query."
export const revalidate = 60;

export default async function LeaderboardPage() {
  const { userId } = await auth();
  const rows = await getLeaderboard();

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px 64px" }}>
      <Card tone="paper" radius="lg" padding={24}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>
          Global leaderboard
        </div>
        {rows.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>No graded puzzles yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r, i) => (
              <div
                key={r.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", width: 28 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontWeight: r.userId === userId ? 800 : 500 }}>{r.displayName ?? "Anonymous"}</span>
                <Badge tone="brand">{r.xp} XP</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
