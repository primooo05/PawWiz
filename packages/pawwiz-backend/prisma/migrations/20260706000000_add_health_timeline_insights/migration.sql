-- Migration: add_health_timeline_insights
-- Creates the InsightSeverity enum and health_timeline_insights table.
-- This is a purely additive migration — no existing tables are modified.

-- 1. Create the enum (guard against re-run)
DO $$ BEGIN
  CREATE TYPE "InsightSeverity" AS ENUM ('info', 'warning', 'concern');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create the table
CREATE TABLE IF NOT EXISTS "health_timeline_insights" (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "cat_id"       TEXT        NOT NULL,
  "type"         VARCHAR(100) NOT NULL,
  "summary"      VARCHAR(160) NOT NULL,
  "detail"       VARCHAR(500) NOT NULL,
  "severity"     "InsightSeverity" NOT NULL,
  "event_ids"    JSONB       NOT NULL,
  "source"       VARCHAR(20) NOT NULL,
  "generated_at" TIMESTAMPTZ NOT NULL,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "health_timeline_insights_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "health_timeline_insights_cat_id_fkey"
    FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE
);

-- 3. Unique constraint used by the upsert key (cat_id, type, generated_at day)
--    A functional unique index on the day-truncated generated_at enforces
--    the "one insight per correlation type per cat per day" invariant.
CREATE UNIQUE INDEX IF NOT EXISTS "health_timeline_insights_catid_type_day_idx"
  ON "health_timeline_insights" ("cat_id", "type", DATE("generated_at" AT TIME ZONE 'UTC'));

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS "health_timeline_insights_catid_genAt_idx"
  ON "health_timeline_insights" ("cat_id", "generated_at" DESC);

CREATE INDEX IF NOT EXISTS "health_timeline_insights_catid_type_idx"
  ON "health_timeline_insights" ("cat_id", "type");
