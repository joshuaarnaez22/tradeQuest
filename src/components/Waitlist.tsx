"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { EASE_BOUNCE, LIFT_TRANSITION } from "@/lib/motion";

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="waitlist"
      style={{
        padding: "96px 20px",
        background: "var(--violet-500)",
        color: "var(--paper-0)",
        borderTop: "var(--border-width-thick) solid var(--ink-900)",
        borderBottom: "var(--border-width-thick) solid var(--ink-900)",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 24, justifyItems: "center", textAlign: "center" }}>
        <h2 className="font-display" style={{ fontSize: "var(--text-display-2)", lineHeight: 1, margin: 0 }}>
          Get in on day one
        </h2>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, maxWidth: "48ch" }}>
          TradeQuest is free and launching soon. Leave your email and we&apos;ll send one message when your first
          replay is ready.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%", maxWidth: 520, justifyContent: "center" }}
        >
          <div style={{ flex: "1 1 240px", minWidth: 240 }}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              aria-label="Email address"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                padding: "14px 20px",
                borderRadius: "var(--radius-pill)",
                border: "var(--border-width-thick) solid var(--ink-900)",
                background: "var(--paper-0)",
                color: "var(--ink-900)",
                width: "100%",
                outline: "none",
              }}
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 var(--paper-0)" }}
            whileTap={{ x: 0, y: 0, boxShadow: "0 0 0 0 var(--paper-0)" }}
            transition={LIFT_TRANSITION}
            style={{
              fontSize: 15,
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: "var(--radius-pill)",
              border: "var(--border-width-thick) solid var(--ink-900)",
              background: "var(--ink-900)",
              color: "var(--paper-0)",
              cursor: "pointer",
              boxShadow: "4px 4px 0 0 var(--paper-0)",
            }}
          >
            Join the waitlist
          </motion.button>
        </form>

        {submitted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: [0.4, 1.12, 1] }}
            transition={{ duration: 0.42, ease: EASE_BOUNCE }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: "var(--radius-pill)",
              background: "var(--mint-500)",
              color: "var(--ink-900)",
              border: "var(--border-width-thick) solid var(--ink-900)",
            }}
          >
            You&apos;re on the list. See you at launch.
          </motion.span>
        )}

        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
          No spam, one launch email. Historical replay only — no live trading, no real funds, not financial advice.
        </p>
      </div>
    </section>
  );
}
