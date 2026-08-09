import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  (databaseUrl ? new Pool({ connectionString: databaseUrl }) : undefined);

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not set — API routes will fall back to sample data until it is configured."
  );
}

// Route handlers already wrap DB calls in try/catch and return fallback data
// on failure. Throwing eagerly at import time (the old behavior) bypassed
// that fallback entirely, since the throw happened before any handler body
// ran. Deferring the throw to first query keeps those fallbacks reachable.
export const db: ReturnType<typeof drizzle> = pool
  ? drizzle(pool)
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "DATABASE_URL is required to query the database. Set it in .env.local."
          );
        },
      }
    ) as ReturnType<typeof drizzle>);
