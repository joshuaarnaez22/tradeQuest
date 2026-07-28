import { Button } from "@/components/core/Button";
import type { Decision } from "@/db/schema";

const OPTIONS: { value: Decision; label: string }[] = [
  { value: "buy", label: "▲ Buy" },
  { value: "wait", label: "— Wait" },
  { value: "sell", label: "▼ Sell" },
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
          variant={opt.value === "buy" ? "accent" : "secondary"}
          size="lg"
          disabled={disabled}
          onClick={() => onDecide(opt.value)}
        >
          {pending === opt.value ? "…" : opt.label}
        </Button>
      ))}
    </div>
  );
}
