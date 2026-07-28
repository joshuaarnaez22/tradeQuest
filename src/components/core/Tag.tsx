import type { CSSProperties, ReactNode } from "react";

export function Tag({
  children,
  outlined = true,
  style,
}: {
  children?: ReactNode;
  outlined?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 13,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        border: outlined ? "2px solid var(--border-default)" : "none",
        background: outlined ? "transparent" : "var(--surface-sunken)",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
