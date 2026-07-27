import { PhasePlaceholder } from "@/components/PhasePlaceholder";

// TODO(Phase 3): replace with Clerk's <SignUp /> (appearance prop themed against globals.css tokens).
// Post-signup redirect target is /replay, not /dashboard — PRD §5: land straight in a puzzle.
export default function SignUpPage() {
  return <PhasePlaceholder title="Sign up" note="Clerk's sign-up form lands here in Phase 3." />;
}
