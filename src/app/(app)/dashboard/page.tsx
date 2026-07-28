import { auth } from "@clerk/nextjs/server";
import { getUserXp, getUserStreak, getRecentSessions } from "@/lib/stats";
import { levelForXp } from "@/lib/xp";
import { Card } from "@/components/core/Card";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { XPBar } from "@/components/ui/XPBar";
import { CandleCallBadge } from "@/components/ui/CandleCallBadge";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null; // (app)/layout.tsx already redirects; defensive only

  const [xp, streak, sessions] = await Promise.all([getUserXp(userId), getUserStreak(userId), getRecentSessions(userId)]);
  const { level, xpIntoLevel, xpPerLevel } = levelForXp(xp);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px 64px", display: "grid", gap: 24 }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Card tone="violet" radius="lg" padding={24} style={{ flex: "1 1 240px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Current streak</div>
          <div style={{ marginTop: 10 }}>
            <StreakFlame days={streak} size="lg" />
          </div>
        </Card>
        <Card tone="paper" radius="lg" padding={24} style={{ flex: "1 1 240px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
            Level progress
          </div>
          <div style={{ marginTop: 14 }}>
            <XPBar xp={xpIntoLevel} max={xpPerLevel} level={level} />
          </div>
        </Card>
      </div>

      <Card tone="paper" radius="lg" padding={24}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>
          Recent sessions
        </div>
        {sessions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>No sessions yet — solve today&apos;s puzzle to get started.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {sessions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < sessions.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{s.attemptDate}</span>
                <CandleCallBadge call={s.decision} correct={s.isCorrect} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
