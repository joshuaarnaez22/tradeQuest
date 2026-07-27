export function PhasePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "80px 20px",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          {title}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>{note}</p>
      </div>
    </div>
  );
}
