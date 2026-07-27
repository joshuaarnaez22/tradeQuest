const columnLabel = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-caps)",
  color: "var(--ink-300)",
} as const;

export function Footer() {
  return (
    <footer style={{ background: "var(--ink-900)", color: "var(--ink-100)", padding: "64px 20px 40px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32 }}>
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <span className="font-display" style={{ fontSize: 28, color: "var(--paper-0)" }}>
              TradeQuest
            </span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, maxWidth: "30ch" }}>
              Practice reading candlestick charts on real market history. Free, on the web.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10, alignContent: "start", fontSize: 14 }}>
            <span style={columnLabel}>Product</span>
            <a href="#how">How it works</a>
            <a href="#loop">The daily loop</a>
            <a href="#waitlist">Waitlist</a>
          </div>
          <div style={{ display: "grid", gap: 10, alignContent: "start", fontSize: 14 }}>
            <span style={columnLabel}>Company</span>
            <a href="#fair">Our position</a>
            <a href="#top">Privacy</a>
            <a href="#top">Contact</a>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--ink-700)",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--ink-300)",
          }}
        >
          <span>© 2026 TradeQuest. All market data is simulated historical replay.</span>
          <span>No live trading, no real funds, not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
