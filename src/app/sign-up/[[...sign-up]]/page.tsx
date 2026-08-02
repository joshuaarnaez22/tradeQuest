import { SignUp } from "@clerk/nextjs";

// /home picks Learn (L1) or Replay (L2+) — Learn-first unlock ladder.
export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--surface-page)" }}>
      <SignUp forceRedirectUrl="/home" />
    </div>
  );
}
