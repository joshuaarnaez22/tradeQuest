import { NextResponse } from "next/server";

// TODO(Phase 3): verify svix signature headers, upsert into `users` on user.created/user.updated.
export async function POST() {
  return NextResponse.json({ error: "Not implemented until Phase 3" }, { status: 501 });
}
