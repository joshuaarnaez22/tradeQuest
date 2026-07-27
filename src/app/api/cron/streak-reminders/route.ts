import { NextResponse } from "next/server";

// TODO(Phase 8): validate `Authorization: Bearer $CRON_SECRET`, find users whose streak lapses
// today and last_reminder_sent_at isn't already today, send via Resend, update the column.
export async function GET() {
  return NextResponse.json({ error: "Not implemented until Phase 8" }, { status: 501 });
}
