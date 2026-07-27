// TODO(Phase 3): gate this layout behind Clerk auth (redirect to /sign-in if unauthenticated).
// TODO(Phase 4/7): replace the plain links below with the ported Nav component (core/IconButton + core/Tag).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" style={{ minHeight: "100vh", background: "var(--surface-page)", color: "var(--text-primary)" }}>
      <nav
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "var(--border-width-thick) solid var(--border-default)",
        }}
      >
        <span className="font-display" style={{ fontSize: 20 }}>
          TradeQuest
        </span>
        <a href="/replay">Replay</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/leaderboard">Leaderboard</a>
      </nav>
      {children}
    </div>
  );
}
