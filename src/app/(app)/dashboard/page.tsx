import { auth } from "@clerk/nextjs/server";
import { getUserXp, getUserStreak, getRecentSessions, getEarnedBadgeIds, getAttemptRecords } from "@/lib/stats";
import { levelForXp } from "@/lib/xp";
import { allDisplayBadges, currentPeriodProgress } from "@/lib/badges";
import { Card } from "@/components/core/Card";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { XPBar } from "@/components/ui/XPBar";
import { CandleCallBadge } from "@/components/ui/CandleCallBadge";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null; // (app)/layout.tsx already redirects; defensive only

  const [xp, streak, sessions, earnedBadgeIds, attemptRecords] = await Promise.all([
    getUserXp(userId),
    getUserStreak(userId),
    getRecentSessions(userId),
    getEarnedBadgeIds(userId),
    getAttemptRecords(userId),
  ]);
  const { level, xpIntoLevel, xpPerLevel, title } = levelForXp(xp);
  const { weekCount, weekGoal, monthCount, monthGoal } = currentPeriodProgress(attemptRecords);

  const displayBadges = allDisplayBadges();
  const correctCount = sessions.filter((s) => s.isCorrect).length;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 28 }}>
      <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
        Your progress
      </h1>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Card
          tone="violet"
          radius="lg"
          padding={28}
          style={{ flex: "1 1 260px", boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 2, alignContent: "start" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>
            Current streak
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
            <StreakFlame size="lg" showCount={false} />
            <span className="font-display" style={{ fontSize: 56, lineHeight: 1 }}>
              {streak}
              <span style={{ fontSize: 20, marginLeft: 8, fontFamily: "var(--font-sans)", textTransform: "none", fontStyle: "normal" }}>
                {streak === 1 ? "day" : "days"}
              </span>
            </span>
          </div>
        </Card>
        <Card
          tone="paper"
          radius="lg"
          padding={28}
          style={{ flex: "1 1 260px", boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 4, alignContent: "start" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
              color: "var(--text-secondary)",
            }}
          >
            Level progress
          </div>
          <div style={{ marginTop: 12 }}>
            <XPBar xp={xpIntoLevel} max={xpPerLevel} level={level} title={title} />
          </div>
        </Card>
      </div>

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
          Goals
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <XPBar xp={Math.min(weekCount, weekGoal)} max={weekGoal} unit="puzzles this week" />
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <XPBar xp={Math.min(monthCount, monthGoal)} max={monthGoal} unit="puzzles this month" />
          </div>
        </div>
      </Card>

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
          Badges — {earnedBadgeIds.size} / {displayBadges.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {displayBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  background: earned ? "var(--brand-subtle-bg)" : "var(--surface-sunken)",
                  opacity: earned ? 1 : 0.55,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{badge.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{earned ? badge.description : "Not yet earned"}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card tone="paper" radius="lg" padding={28} style={{ boxShadow: "var(--shadow-flat-md)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
              color: "var(--text-secondary)",
            }}
          >
            Recent sessions
          </span>
          {sessions.length > 0 && (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {correctCount} of {sessions.length} read correctly
            </span>
          )}
        </div>
        {sessions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>No sessions yet — solve today&apos;s puzzle to get started.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {sessions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-sunken)",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
                  {s.attemptDate}
                  {s.mode !== "daily" ? ` · ${s.mode}` : ""}
                </span>
                <CandleCallBadge call={s.decision} correct={s.isCorrect} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
