import { SignUp } from "@clerk/nextjs";

// forceRedirectUrl="/replay", not /dashboard — PRD §5: land straight in a puzzle, no onboarding wall.
export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--surface-page)" }}>
      <SignUp forceRedirectUrl="/replay" />
    </div>
  );
}
