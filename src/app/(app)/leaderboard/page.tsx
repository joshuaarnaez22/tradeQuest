import { auth } from "@clerk/nextjs/server";
import { getLeaderboard } from "@/lib/stats";
import { Card } from "@/components/core/Card";
import { Badge } from "@/components/core/Badge";

// No realtime — TECH-STACK.md: "v1 leaderboard can just be a polled/revalidated query."
export const revalidate = 60;

const MEDAL_TONE: Record<number, string> = { 0: "var(--violet-500)", 1: "var(--amber-500)", 2: "var(--mint-500)" };
const MEDAL_FG: Record<number, string> = { 0: "var(--paper-0)", 1: "var(--ink-900)", 2: "var(--ink-900)" };

export default async function LeaderboardPage() {
  const { userId } = await auth();
  const rows = await getLeaderboard();

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 28 }}>
      <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
        Leaderboard
      </h1>

      <Card tone="paper" radius="lg" padding={28} style={{ boxShadow: "var(--shadow-flat-md)" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-caps)",
            color: "var(--text-secondary)",
            marginBottom: 14,
          }}
        >
          Ranked by XP, this season
        </div>
        {rows.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>No graded puzzles yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {rows.map((r, i) => {
              const isSelf = r.userId === userId;
              const medal = MEDAL_TONE[i];
              return (
                <div
                  key={r.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: isSelf ? "var(--brand-subtle-bg)" : "var(--surface-sunken)",
                  }}
                >
                  {medal ? (
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "var(--radius-pill)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        background: medal,
                        color: MEDAL_FG[i],
                        border: "var(--border-width-thick) solid var(--border-default)",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        width: 28,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span style={{ flex: 1, fontWeight: isSelf ? 800 : 500 }}>{r.displayName ?? "Anonymous"}</span>
                  {isSelf && <Badge tone="neutral">You</Badge>}
                  <Badge tone="brand">{r.xp} XP</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
