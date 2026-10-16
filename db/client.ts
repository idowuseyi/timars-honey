// Neon connection. Uses the WebSocket Pool driver (not neon-http) because order
// placement needs a real transaction. On Cloudflare Workers a connection must not
// outlive the request that opened it, so `withDb` opens a pool per call and always
// closes it — never hoist the pool to module scope.
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/** Any Drizzle Postgres database over our schema — Neon in prod, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: url });
  try {
    return await fn(drizzle(pool, { schema }) as unknown as Db);
  } finally {
    await pool.end();
  }
}
