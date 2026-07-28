import type { CSSProperties, ReactNode } from "react";

const TONES: Record<string, CSSProperties> = {
  neutral: { background: "var(--surface-sunken)", color: "var(--text-primary)" },
  up: { background: "var(--market-up-bg)", color: "var(--market-up-strong)" },
  down: { background: "var(--market-down-bg)", color: "var(--market-down-strong)" },
  brand: { background: "var(--violet-100)", color: "var(--violet-500)" },
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children?: ReactNode }) {
  return (
    <span
      style={{
        ...TONES[tone],
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "var(--radius-pill)",
      }}
    >
      {children}
    </span>
  );
}
