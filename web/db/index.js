import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — add it to web/.env.local (see .env.local.example)");
}

// Reuse the same connection pool across Turbopack/Fast Refresh reloads in
// dev — otherwise every hot-reloaded route file spins up a brand-new pool
// against Supabase's transaction pooler, which only allows a small number
// of connections, and they never get released.
const globalForDb = globalThis;

const client =
  globalForDb.__artisansDbClient ?? postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__artisansDbClient = client;
}

export const db = drizzle(client, { schema });
