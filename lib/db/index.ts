import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// A single shared connection pool. Works with any standard Postgres host
// (Supabase, Neon, Railway, RDS, a self-hosted box, etc) — just point
// DATABASE_URL at it. This is the same database future lürú tools apps
// should read from if they want to look up the same users.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Most hosted Postgres providers (Supabase, Neon, Railway) require SSL.
  // Disable this only if you're connecting to a local/self-hosted Postgres
  // without SSL configured.
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
