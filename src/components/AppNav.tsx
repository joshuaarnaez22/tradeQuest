"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { IconButton } from "@/components/core/IconButton";
import { Tag } from "@/components/core/Tag";
import {
  FEATURE_UNLOCK_LEVEL,
  isFeatureUnlocked,
  type AppFeature,
} from "@/lib/feature-unlocks";

const LINKS: { href: string; label: string; feature: AppFeature }[] = [
  { href: "/learn", label: "Learn", feature: "learn" },
  { href: "/replay", label: "Replay", feature: "replay" },
  { href: "/challenges", label: "Challenges", feature: "challenges" },
  { href: "/campaigns", label: "Campaigns", feature: "campaigns" },
  { href: "/dashboard", label: "Dashboard", feature: "dashboard" },
  { href: "/leaderboard", label: "Leaderboard", feature: "leaderboard" },
];

export function AppNav({ level, homeHref }: { level: number; homeHref: string }) {
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
      <Link href={homeHref} aria-label="TradeQuest home" style={{ display: "inline-flex" }}>
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
          const unlocked = isFeatureUnlocked(level, l.feature);
          const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          const need = FEATURE_UNLOCK_LEVEL[l.feature];
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              aria-disabled={!unlocked || undefined}
              data-testid={`nav-${l.feature}`}
              data-locked={unlocked ? "false" : "true"}
              title={unlocked ? l.label : `Unlocks at Level ${need}`}
              style={{ textDecoration: "none", opacity: unlocked ? 1 : 0.55 }}
            >
              <Tag
                outlined={!active || !unlocked}
                style={
                  active && unlocked
                    ? { background: "var(--violet-500)", color: "var(--paper-0)" }
                    : undefined
                }
              >
                {unlocked ? l.label : `${l.label} · L${need}`}
              </Tag>
            </Link>
          );
        })}
      </span>
      <span
        data-testid="nav-level"
        style={{
          marginLeft: "auto",
          marginRight: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
      >
        Lv {level}
      </span>
      <UserButton />
    </nav>
  );
}
