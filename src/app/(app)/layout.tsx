import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { ForceBodyDarkTheme } from "@/components/ForceBodyDarkTheme";

// proxy.ts is the first line of defense; this is the second, per-request one
// (server components/actions under (app)/ should not rely on proxy.ts alone).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div data-theme="dark" style={{ minHeight: "100vh", background: "var(--surface-page)", color: "var(--text-primary)" }}>
      <ForceBodyDarkTheme />
      <AppNav />
      {children}
    </div>
  );
}
