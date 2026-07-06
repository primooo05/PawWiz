-- Migration: fix_insight_unique_constraint
--
-- The previous migration created a functional unique index on DATE(generated_at)
-- but Prisma's upsert emits ON CONFLICT (cat_id, type, generated_at) which requires
-- a plain unique CONSTRAINT — not a functional index — to resolve.
--
-- Fix: drop the functional index and add a real UNIQUE CONSTRAINT on the raw
-- (cat_id, type, generated_at) columns. The repository already normalises
-- generated_at to midnight UTC before upserting, so the day-deduplication
-- invariant is preserved without needing a functional index.

-- 1. Drop the old functional unique index (safe — IF EXISTS guard)
DROP INDEX IF EXISTS "health_timeline_insights_catid_type_day_idx";

-- 2. Add the plain unique constraint that Prisma's ON CONFLICT clause expects
ALTER TABLE "health_timeline_insights"
  ADD CONSTRAINT "health_timeline_insights_catid_type_genAt_key"
    UNIQUE ("cat_id", "type", "generated_at");
