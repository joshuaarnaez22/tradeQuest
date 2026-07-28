// Permanent, reused on every puzzle screen state (fresh, already-graded, empty) —
// PRD §9: "label this clearly on every puzzle screen, not buried in a ToS."
export function SimulatedDataBanner() {
  return (
    <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
      Historical replay for practice. No live trading, no real funds, not financial advice.
    </p>
  );
}
