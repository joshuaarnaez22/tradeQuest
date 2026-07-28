import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";

const PAD = { sm: "8px 18px", md: "12px 24px", lg: "16px 32px" };
const FONT_SIZE = { sm: 14, md: 15, lg: 17 };

const VARIANTS: Record<string, CSSProperties> = {
  primary: { background: "var(--surface-inverse)", color: "var(--text-on-inverse)", borderColor: "var(--surface-inverse)" },
  secondary: { background: "var(--surface-card)", color: "var(--text-primary)" },
  accent: { background: "var(--brand-primary)", color: "var(--brand-on-primary)", borderColor: "var(--border-default)" },
  ghost: { background: "transparent", color: "var(--text-primary)", border: "var(--border-width-thick) solid transparent" },
};

export function Button({
  variant = "primary",
  size = "md",
  icon = null,
  disabled = false,
  type = "button",
  children,
  onClick,
}: {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof PAD;
  icon?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { y: 1 }}
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: FONT_SIZE[size],
        borderRadius: "var(--radius-pill)",
        padding: PAD[size],
        border: "var(--border-width-thick) solid var(--border-default)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        ...VARIANTS[variant],
      }}
    >
      {icon}
      {children}
    </motion.button>
  );
}
