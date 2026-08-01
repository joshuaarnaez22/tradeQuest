import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Card } from "@/components/core/Card";
import { getLearnHubProgress } from "@/lib/learn-queries";

export default async function LearnHubPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const modules = await getLearnHubProgress(userId);
  const passedCount = modules.filter((m) => m.passed).length;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 28 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          Learn
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: 15, maxWidth: 560 }}>
          Short chart-literacy lessons, then a quiz. First pass awards XP — does not affect your streak.
        </p>
        <p style={{ margin: "10px 0 0", fontFamily: "var(--font-mono)", fontSize: 13 }} data-testid="learn-hub-progress">
          {passedCount}/{modules.length} modules passed
        </p>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {modules.map((m) => (
          <Card
            key={m.id}
            tone={m.passed ? "violet" : "paper"}
            radius="lg"
            padding={24}
            style={{ boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 10 }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-caps)",
                color: "var(--text-secondary)",
              }}
            >
              {m.passed ? "Passed" : m.score !== null ? "In progress" : "Not started"}
            </div>
            <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
              {m.title}
            </h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: "var(--text-secondary)" }}>{m.summary}</p>
            <Link
              href={`/learn/${m.id}`}
              data-testid={`learn-open-${m.id}`}
              style={{
                justifySelf: "start",
                background: "var(--violet-500)",
                color: "white",
                borderRadius: "var(--radius-pill)",
                padding: "10px 18px",
                fontWeight: 700,
                textDecoration: "none",
                marginTop: 4,
              }}
            >
              {m.passed ? "Review →" : "Open lesson →"}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
