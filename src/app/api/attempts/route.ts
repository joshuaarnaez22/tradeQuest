import { NextResponse } from "next/server";

// TODO(Phase 5/6): auth() check -> Upstash rate limit -> existing-attempt check (idempotent,
// keyed on (userId, attempt_date)) -> grade via lib/grading.ts -> generateText() explanation ->
// store on attempts row -> return { isCorrect, forwardReturnPct, explanation, xpAwarded }.
export async function POST() {
  return NextResponse.json({ error: "Not implemented until Phase 5/6" }, { status: 501 });
}
