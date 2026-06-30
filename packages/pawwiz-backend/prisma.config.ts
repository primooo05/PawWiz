// Secrets injected by Infisical — no dotenv needed
import { defineConfig } from "prisma/config";

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
