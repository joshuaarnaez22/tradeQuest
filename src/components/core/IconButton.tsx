import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";

const VARIANTS: Record<string, CSSProperties> = {
  outline: { background: "var(--surface-card)", color: "var(--text-primary)" },
  solid: { background: "var(--surface-inverse)", color: "var(--text-on-inverse)" },
};

export function IconButton({
  icon,
  size = 40,
  variant = "outline",
  label,
  style,
  onClick,
}: {
  icon: ReactNode;
  size?: number;
  variant?: keyof typeof VARIANTS;
  label: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-pill)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "var(--border-width-thick) solid var(--border-default)",
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {icon}
    </motion.button>
  );
}
