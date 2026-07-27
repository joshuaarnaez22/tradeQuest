import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// proxy.ts is the first line of defense; this is the second, per-request one
// (server components/actions under (app)/ should not rely on proxy.ts alone).
// TODO(Phase 4/7): replace the plain links below with the ported Nav component (core/IconButton + core/Tag).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
        <span style={{ marginLeft: "auto" }}>
          <UserButton />
        </span>
      </nav>
      {children}
    </div>
  );
}
