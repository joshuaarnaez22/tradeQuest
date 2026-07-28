const SIZES = { sm: 28, md: 40, lg: 56 };

export function StreakFlame({ days = 0, size = "md" }: { days?: number; size?: keyof typeof SIZES }) {
  const dim = SIZES[size];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C9 6 6 8 6 13a6 6 0 0 0 12 0c0-2-1-3-2-4 .3 2-.8 3-1.5 2.3C15 10 14 7 12 2Z"
          fill="var(--streak-flame)"
          stroke="var(--border-default)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: dim * 0.5, color: "var(--text-primary)" }}>{days}</span>
    </span>
  );
}
