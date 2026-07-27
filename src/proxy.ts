import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 renamed middleware.ts -> proxy.ts (verified against
// node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md).
// The marketing page, sign-in/up, the Clerk webhook, and cron routes stay
// public — cron/webhooks are secured separately (CRON_SECRET / svix signature),
// not by session cookies.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
