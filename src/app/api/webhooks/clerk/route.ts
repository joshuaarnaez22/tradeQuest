import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";

// CLERK_WEBHOOK_SIGNING_SECRET isn't provisioned yet — the Vercel Marketplace
// integration created the Clerk app + API keys, but the webhook endpoint itself
// (and its signing secret) has to be created in the Clerk Dashboard pointing at
// the deployed URL. Deferred to Phase 11 (deploy) since it needs a public URL.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new NextResponse("Verification failed", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, first_name, last_name } = evt.data;
    const displayName = `${first_name ?? ""} ${last_name ?? ""}`.trim() || null;
    const db = getDb();
    await db
      .insert(users)
      .values({ id, displayName })
      .onConflictDoUpdate({ target: users.id, set: { displayName } });
  }

  return NextResponse.json({ ok: true });
}
