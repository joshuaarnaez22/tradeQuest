import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/core/Card";
import { getCampaignProgress } from "@/lib/campaign-queries";

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { slug } = await params;

  const progress = await getCampaignProgress(userId, slug);
  if (!progress) notFound();

  const { campaign, missions, completed, total, cleared } = progress;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 24 }}>
      <Link href="/campaigns" style={{ fontSize: 13, color: "var(--text-secondary)", width: "fit-content" }}>
        ← Campaigns
      </Link>

      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          {campaign.title}
        </h1>
        <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", fontSize: 15, maxWidth: 640, lineHeight: 1.5 }}>
          {campaign.synopsis}
        </p>
        <p data-testid="campaign-detail-progress" style={{ margin: "12px 0 0", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          {completed}/{total} missions
          {cleared ? " · Arc cleared" : ""}
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {missions.map((m) => (
          <Card
            key={m.index}
            tone="paper"
            radius="lg"
            padding={20}
            style={{ boxShadow: "var(--shadow-flat-sm)", opacity: m.unlocked ? 1 : 0.55 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "grid", gap: 4, flex: "1 1 240px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--text-secondary)" }}>
                  {m.isBoss ? "Final boss" : `Mission ${m.index + 1}`}
                  {m.symbol ? ` · ${m.symbol}` : ""}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{m.title}</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.45 }}>{m.beat}</p>
              </div>
              {!m.unlocked ? (
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Locked</span>
              ) : m.completed ? (
                <Link
                  href={`/campaigns/${slug}/${m.index}`}
                  style={{ fontWeight: 700, color: "var(--violet-500)", textDecoration: "none" }}
                >
                  {m.isCorrect ? "Correct · Replay" : "Missed · Replay"}
                </Link>
              ) : m.puzzleId ? (
                <Link
                  href={`/campaigns/${slug}/${m.index}`}
                  data-testid={`campaign-mission-${m.index}`}
                  style={{
                    background: "var(--violet-500)",
                    color: "white",
                    borderRadius: "var(--radius-pill)",
                    padding: "10px 18px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Play →
                </Link>
              ) : (
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Puzzle missing</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
