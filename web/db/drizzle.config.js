import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't know about Next.js's .env.local convention, so load it ourselves.
try {
  loadEnvFile(new URL("../.env.local", import.meta.url));
} catch {
  // fine if it's missing — CI/hosted envs set DATABASE_URL directly
}

// drizzle-kit resolves these relative to the invocation directory (web/,
// via the npm script), not relative to this config file's own location.
export default defineConfig({
  schema: "./db/schema/index.js",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // migrations need session-mode (prepared statements); the app runtime
    // uses the transaction pooler instead — see DATABASE_URL in db/index.js
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
