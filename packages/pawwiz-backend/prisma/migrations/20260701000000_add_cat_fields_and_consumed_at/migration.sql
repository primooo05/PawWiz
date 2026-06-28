-- Migration: add_cat_fields_and_consumed_at
-- Adds five cat fields to profiles and consumed_at to onboarding_sessions

-- AlterTable: profiles — add cat fields
-- NOT NULL DEFAULT '' allows migration to run against existing rows without a backfill step.
-- The default can be removed once existing rows are populated (dev has no existing rows).
ALTER TABLE "profiles"
  ADD COLUMN "cat_name"       TEXT NOT NULL DEFAULT '',
  ADD COLUMN "cat_breed"      TEXT,
  ADD COLUMN "cat_marking"    TEXT,
  ADD COLUMN "cat_sex"        TEXT NOT NULL DEFAULT '',
  ADD COLUMN "cat_life_stage" TEXT NOT NULL DEFAULT '';

-- AlterTable: onboarding_sessions — add consumed_at for session replay prevention
ALTER TABLE "onboarding_sessions"
  ADD COLUMN "consumed_at" TIMESTAMPTZ;
