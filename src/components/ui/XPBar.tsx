export function XPBar({
  xp = 0,
  max = 100,
  level,
}: {
  xp?: number;
  max?: number;
  level?: number;
}) {
  const pct = Math.min(100, Math.round((xp / max) * 100));
  return (
    <div>
      {level && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Level {level}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: 14,
          borderRadius: "var(--radius-pill)",
          background: "var(--surface-sunken)",
          border: "var(--border-width-thick) solid var(--border-default)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: pct + "%",
            height: "100%",
            background: "var(--xp-fill)",
            transition: "width var(--duration-slow) var(--ease-out)",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
        {xp} / {max} XP
      </div>
    </div>
  );
}
