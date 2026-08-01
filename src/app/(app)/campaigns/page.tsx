import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Card } from "@/components/core/Card";
import { getAllCampaignProgress } from "@/lib/campaign-queries";

export default async function CampaignsHubPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const campaigns = await getAllCampaignProgress(userId);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 28 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          Campaigns
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: 15, maxWidth: 560 }}>
          Story arcs through real market history. Awards XP — does not affect your streak or weekly goals.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {campaigns.map((c) => (
          <Card
            key={c.campaign.slug}
            tone={c.cleared ? "violet" : "paper"}
            radius="lg"
            padding={28}
            style={{ boxShadow: "var(--shadow-flat-md)", display: "grid", gap: 12 }}
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
              {c.campaign.missions.length} missions
            </div>
            <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
              {c.campaign.title}
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{c.campaign.synopsis}</p>
            <p data-testid={`campaign-progress-${c.campaign.slug}`} style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13 }}>
              {c.completed}/{c.total} complete
              {c.cleared ? " · Cleared" : ""}
            </p>
            <Link
              href={`/campaigns/${c.campaign.slug}`}
              data-testid={`campaign-open-${c.campaign.slug}`}
              style={{
                justifySelf: "start",
                background: "var(--violet-500)",
                color: "white",
                borderRadius: "var(--radius-pill)",
                padding: "10px 20px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {c.cleared ? "Review arc →" : c.completed > 0 ? "Continue →" : "Start arc →"}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
