"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { IconButton } from "@/components/core/IconButton";
import { Tag } from "@/components/core/Tag";

const LINKS = [
  { href: "/replay", label: "Replay" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        rowGap: 10,
        alignItems: "center",
        padding: "16px 24px",
        background: "var(--surface-card)",
        borderBottom: "var(--border-width-thick) solid var(--violet-500)",
        boxShadow: "var(--shadow-flat-sm)",
      }}
    >
      <Link href="/replay" aria-label="TradeQuest home" style={{ display: "inline-flex" }}>
        <IconButton
          label="TradeQuest"
          icon={<span className="font-display" style={{ fontSize: 13, letterSpacing: 0 }}>TQ</span>}
          size={36}
          style={{
            background: "var(--violet-500)",
            color: "var(--paper-0)",
            borderColor: "var(--violet-500)",
            boxShadow: "var(--shadow-flat-sm)",
          }}
        />
      </Link>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 16, rowGap: 10 }}>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} style={{ textDecoration: "none" }}>
              <Tag outlined={!active} style={active ? { background: "var(--violet-500)", color: "var(--paper-0)" } : undefined}>
                {l.label}
              </Tag>
            </Link>
          );
        })}
      </span>
      <span style={{ marginLeft: "auto" }}>
        <UserButton />
      </span>
    </nav>
  );
}
