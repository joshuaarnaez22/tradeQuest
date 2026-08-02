import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Card } from "@/components/core/Card";
import { getMistakeQueue, getWeeklyChallengeState, getSpeedRunsToday, SPEED_DAILY_CAP } from "@/lib/challenge-queries";
import { requireFeature } from "@/lib/require-feature";

export default async function ChallengesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const locked = await requireFeature(userId, "challenges");
  if (locked) return locked;

  const [mistakes, weekly, speedRuns] = await Promise.all([
    getMistakeQueue(userId),
    getWeeklyChallengeState(userId),
    getSpeedRunsToday(userId),
  ]);

  const speedRemaining = Math.max(0, SPEED_DAILY_CAP - speedRuns);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 28 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          Challenges
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: 15, maxWidth: 520 }}>
          Extra practice beyond today&apos;s puzzle. Awards XP — does not affect your streak or weekly goals.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        <Card tone="paper" radius="lg" padding={28} style={{ boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 12 }}>
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
            Replay Mistakes
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>
            {mistakes.length === 0
              ? "No open mistakes — get one wrong on the daily to fill this queue."
              : `${mistakes.length} puzzle${mistakes.length === 1 ? "" : "s"} waiting for another look.`}
          </p>
          {mistakes.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {mistakes.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/challenges/mistake/${m.id}`}
                    data-testid="mistake-link"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-sunken)",
                      textDecoration: "none",
                      color: "inherit",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    <span>{m.symbol}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>
                      {m.patternType.replace("_", " ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card tone="violet" radius="lg" padding={28} style={{ boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 12 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
            }}
          >
            Speed Mode
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>
            2× candle reveal, 30s to decide. {speedRuns}/{SPEED_DAILY_CAP} runs used today.
          </p>
          {speedRemaining > 0 ? (
            <Link
              href="/challenges/speed"
              data-testid="speed-start"
              style={{
                justifySelf: "start",
                background: "var(--paper-0)",
                color: "var(--violet-500)",
                borderRadius: "var(--radius-pill)",
                padding: "10px 20px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Start speed run →
            </Link>
          ) : (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Daily speed cap reached — come back tomorrow.</p>
          )}
        </Card>

        <Card tone="paper" radius="lg" padding={28} style={{ boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 12 }}>
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
            Weekly Challenge · {weekly.weekId}
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }} data-testid="weekly-progress">
            {weekly.completed}/{weekly.total} complete
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {weekly.puzzles.map((p, i) => (
              <li key={p.id}>
                {p.attempted ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-sunken)",
                      fontSize: 14,
                      opacity: 0.7,
                    }}
                  >
                    <span>
                      #{i + 1} {p.symbol}
                    </span>
                    <span>{p.isCorrect ? "Correct" : "Missed"}</span>
                  </div>
                ) : (
                  <Link
                    href={`/challenges/weekly/${p.id}`}
                    data-testid="weekly-link"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-sunken)",
                      textDecoration: "none",
                      color: "inherit",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    <span>
                      #{i + 1} {p.symbol}
                    </span>
                    <span style={{ color: "var(--violet-500)" }}>Play →</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {weekly.completed === weekly.total && weekly.total > 0 && (
            <p data-testid="weekly-complete" style={{ margin: 0, fontWeight: 700, color: "var(--violet-500)" }}>
              Week cleared — nice work.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
