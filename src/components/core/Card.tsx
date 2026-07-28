import type { CSSProperties, ReactNode } from "react";

const TONES: Record<string, CSSProperties> = {
  paper: { background: "var(--surface-card)", color: "var(--text-primary)" },
  inverse: { background: "var(--surface-inverse)", color: "var(--text-on-inverse)" },
  blue: { background: "var(--blue-500)", color: "var(--ink-900)" },
  violet: { background: "var(--violet-500)", color: "var(--paper-0)" },
  amber: { background: "var(--amber-500)", color: "var(--ink-900)" },
  mint: { background: "var(--mint-500)", color: "var(--ink-900)" },
};

export function Card({
  tone = "paper",
  radius = "lg",
  padding = 24,
  style,
  children,
}: {
  tone?: keyof typeof TONES;
  radius?: "sm" | "md" | "lg" | "xl" | "pill";
  padding?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        ...TONES[tone],
        borderRadius: `var(--radius-${radius})`,
        padding,
        border: "var(--border-width-thick) solid var(--border-default)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
