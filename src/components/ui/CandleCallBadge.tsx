const LABELS = { buy: "BUY", sell: "SELL", wait: "WAIT" } as const;

export function CandleCallBadge({
  call = "buy",
  correct,
}: {
  call?: keyof typeof LABELS;
  correct?: boolean;
}) {
  let bg = "var(--surface-sunken)";
  let color = "var(--text-primary)";
  if (correct === true) {
    bg = "var(--market-up-bg)";
    color = "var(--market-up-strong)";
  }
  if (correct === false) {
    bg = "var(--market-down-bg)";
    color = "var(--market-down-strong)";
  }
  const icon = correct === true ? "✓" : correct === false ? "✕" : "";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.04em",
        padding: "8px 16px",
        borderRadius: "var(--radius-pill)",
        border: "var(--border-width-thick) solid var(--border-default)",
        background: bg,
        color,
      }}
    >
      {LABELS[call]}
      {icon && <span>{icon}</span>}
    </span>
  );
}
