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
        gap: 16,
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "var(--border-width-thick) solid var(--border-default)",
      }}
    >
      <IconButton label="TradeQuest" icon={<span style={{ fontWeight: 900, fontSize: 12 }}>TQ</span>} size={36} />
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
          <Tag outlined={pathname === l.href}>{l.label}</Tag>
        </Link>
      ))}
      <span style={{ marginLeft: "auto" }}>
        <UserButton />
      </span>
    </nav>
  );
}
