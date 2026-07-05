// Secrets are resolved from either a local `.env` file or Infisical.
// We search upward from the cwd so a single monorepo-root `.env` is picked up
// (mirrors src/lib/env.ts). When started via `infisical run --`, the injected
// vars already exist in process.env and dotenv will not override them.
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "prisma/config";

function findEnvFile(startDir: string): string | undefined {
  let dir = startDir;
  for (;;) {
    const candidate = resolve(dir, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

const envPath = findEnvFile(process.cwd());
config(envPath ? { path: envPath } : undefined);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Use directUrl for migrations (Supabase pooler doesn't support prepared statements)
    url: process.env["DIRECT_URL"]?.replace(/^Postgresql:/i, "postgresql:") || process.env["DATABASE_URL"]?.replace(/^Postgresql:/i, "postgresql:"),
    // @ts-expect-error directUrl is missing from type definitions in some Prisma 7 versions
    directUrl: process.env["DIRECT_URL"]?.replace(/^Postgresql:/i, "postgresql:"),

    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"]?.replace(/^Postgresql:/i, "postgresql:"),
  },
});
