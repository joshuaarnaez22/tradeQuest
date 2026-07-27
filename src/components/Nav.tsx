"use client";

import { motion } from "motion/react";

const liftTransition = { duration: 0.12, ease: [0.16, 1, 0.3, 1] as const };

export function Nav({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 1120,
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
          background: "var(--surface-card)",
          border: "var(--border-width-thick) solid var(--border-default)",
          borderRadius: "var(--radius-pill)",
          padding: "10px 12px 10px 24px",
          boxShadow: "var(--shadow-flat-md)",
        }}
      >
        <a
          href="#top"
          className="font-display"
          style={{ fontSize: 24, lineHeight: 1 }}
        >
          TradeQuest
        </a>

        <div className="nav-links">
          <a href="#how" style={navLinkStyle}>
            How it works
          </a>
          <a href="#loop" style={navLinkStyle}>
            The daily loop
          </a>
          <a href="#fair" style={navLinkStyle}>
            Not gambling
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            transition={liftTransition}
            style={{
              width: 40,
              height: 40,
              flex: "0 0 auto",
              borderRadius: "var(--radius-pill)",
              border: "var(--border-width-thick) solid var(--border-default)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </motion.button>
          <motion.a
            href="#waitlist"
            whileHover={{
              x: -2,
              y: -2,
              boxShadow: "6px 6px 0 0 var(--surface-inverse)",
            }}
            whileTap={{ x: 0, y: 0, boxShadow: "0 0 0 0 var(--surface-inverse)" }}
            transition={liftTransition}
            style={{
              fontSize: 15,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "var(--radius-pill)",
              border: "var(--border-width-thick) solid var(--surface-inverse)",
              background: "var(--surface-inverse)",
              color: "var(--text-on-inverse)",
              boxShadow: "var(--shadow-flat-sm)",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Join the waitlist
          </motion.a>
        </div>
      </nav>
    </div>
  );
}

const navLinkStyle = {
  fontSize: 14,
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "var(--radius-pill)",
} as const;
