import Link from "next/link";
import type { AppFeature } from "@/lib/feature-unlocks";
import { unlockLevelFor } from "@/lib/feature-unlocks";

const FEATURE_LABEL: Record<AppFeature, string> = {
  learn: "Learn",
  dashboard: "Dashboard",
  leaderboard: "Leaderboard",
  replay: "Replay",
  challenges: "Challenges",
  campaigns: "Campaigns",
};

export function FeatureLocked({
  feature,
  currentLevel,
}: {
  feature: AppFeature;
  currentLevel: number;
}) {
  const need = unlockLevelFor(feature);
  return (
    <div
      data-testid="feature-locked"
      style={{ maxWidth: 560, margin: "0 auto", padding: "64px 20px", display: "grid", gap: 16 }}
    >
      <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
        {FEATURE_LABEL[feature]} locked
      </h1>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        Reach <strong style={{ color: "var(--text-primary)" }}>Level {need}</strong> to unlock{" "}
        {FEATURE_LABEL[feature]}. You&apos;re currently Level {currentLevel}.
      </p>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
        Pass Learn quizzes to earn XP and level up — then this opens.
      </p>
      <Link
        href="/learn"
        data-testid="feature-locked-learn"
        style={{
          justifySelf: "start",
          background: "var(--violet-500)",
          color: "white",
          borderRadius: "var(--radius-pill)",
          padding: "12px 22px",
          fontWeight: 700,
          textDecoration: "none",
          marginTop: 8,
        }}
      >
        Go to Learn →
      </Link>
    </div>
  );
}
