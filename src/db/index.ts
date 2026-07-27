import { drizzle } from "drizzle-orm/neon-http";
import { neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Lazy accessor, not a top-level `neon()`/`drizzle()` call: the Neon driver throws
// at import time if DATABASE_URL is unset, which would break `next build` in any
// environment (CI, a fresh checkout) before env vars are wired up. A plain lazy
// `let` here — not a JS Proxy wrapper — since Proxy wrapping breaks libraries
// (Clerk included) that introspect the adapter shape.
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _db = drizzle(url, { schema });
  }
  return _db;
}

// Neon's serverless driver fetches over HTTP by default; disabling this cache
// keeps query results from being cached across requests in server environments.
neonConfig.fetchConnectionCache = true;
