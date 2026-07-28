import { Button } from "@/components/core/Button";
import type { Decision } from "@/db/schema";

// Matches Hero's buy/wait/sell color language (blue/violet/orange) so the
// live replay screen reads as vibrant as the marketing demo, not a gray form.
const OPTIONS: { value: Decision; label: string; bg: string; fg: string }[] = [
  { value: "buy", label: "▲ Buy", bg: "var(--blue-500)", fg: "var(--paper-0)" },
  { value: "wait", label: "— Wait", bg: "var(--violet-500)", fg: "var(--paper-0)" },
  { value: "sell", label: "▼ Sell", bg: "var(--orange-500)", fg: "var(--ink-900)" },
];

export function DecisionControls({
  onDecide,
  disabled,
  pending,
}: {
  onDecide: (decision: Decision) => void;
  disabled: boolean;
  pending: Decision | null;
}) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="lg"
          disabled={disabled}
          onClick={() => onDecide(opt.value)}
          style={{ background: opt.bg, color: opt.fg, borderColor: "var(--border-default)" }}
        >
          {pending === opt.value ? "…" : opt.label}
        </Button>
      ))}
    </div>
  );
}
