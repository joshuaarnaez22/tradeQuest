type Item = { label: string; spin: number; icon: React.ReactNode };

const ITEMS: Item[] = [
  {
    label: "16 candles",
    spin: 2.4,
    icon: (
      <>
        <rect x="5" y="8" width="8" height="16" rx="2" fill="var(--blue-500)" stroke="var(--ink-900)" strokeWidth="2.5" />
        <rect x="17" y="12" width="8" height="12" rx="2" fill="var(--paper-0)" stroke="var(--ink-900)" strokeWidth="2.5" />
      </>
    ),
  },
  {
    label: "one call",
    spin: 3.1,
    icon: (
      <path
        d="M15 3c-4 5-7 7-7 12a7 7 0 0 0 14 0c0-3-1.5-4.5-3-6 .4 3-1 4-2 3-1-2-2-6-2-9Z"
        fill="var(--orange-500)"
        stroke="var(--ink-900)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "daily streak",
    spin: 2.7,
    icon: (
      <>
        <circle cx="15" cy="15" r="11" fill="var(--mint-500)" stroke="var(--ink-900)" strokeWidth="2.5" />
        <path d="M9.5 15.5l4 4 7-8" fill="none" stroke="var(--ink-900)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: "no real money",
    spin: 2.2,
    icon: (
      <>
        <rect x="4" y="7" width="22" height="16" rx="5" fill="var(--violet-500)" stroke="var(--ink-900)" strokeWidth="2.5" />
        <path d="M10 15h10" stroke="var(--paper-0)" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "+15 XP",
    spin: 2.9,
    icon: (
      <>
        <rect x="5" y="8" width="8" height="16" rx="2" fill="var(--blue-500)" stroke="var(--ink-900)" strokeWidth="2.5" />
        <rect x="17" y="12" width="8" height="12" rx="2" fill="var(--paper-0)" stroke="var(--ink-900)" strokeWidth="2.5" />
      </>
    ),
  },
];

function MarqueeGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        paddingRight: 40,
      }}
      className="font-display"
    >
      {ITEMS.map((item, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span style={{ fontSize: 34, color: "var(--ink-900)", whiteSpace: "nowrap" }}>{item.label}</span>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            aria-hidden="true"
            style={{ flex: "0 0 auto", animation: `tqSpinSticker ${item.spin}s var(--ease-out) infinite alternate` }}
          >
            {item.icon}
          </svg>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div
      style={{
        background: "var(--amber-500)",
        borderTop: "var(--border-width-thick) solid var(--ink-900)",
        borderBottom: "var(--border-width-thick) solid var(--ink-900)",
        overflow: "hidden",
        padding: "16px 0",
      }}
    >
      <div style={{ display: "flex", width: "max-content", animation: "tqMarquee 26s linear infinite" }}>
        <MarqueeGroup />
        <MarqueeGroup ariaHidden />
      </div>
    </div>
  );
}
