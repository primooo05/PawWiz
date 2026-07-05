-- Security & performance refactor
-- A07: per-session OTP brute-force lockout counter
-- A01/A07: index the enumeration lookup column
-- Perf: index hot foreign-key / range-scan columns and add pg_trgm GIN
--       indexes for case-insensitive substring plant lookups.

-- Enable trigram matching (safe if already present).
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- A07: failed-attempt counter for the onboarding OTP gate.
ALTER TABLE "onboarding_sessions"
  ADD COLUMN IF NOT EXISTS "otp_attempts" INTEGER NOT NULL DEFAULT 0;

-- A01: index the email column used by isEmailConsumed / findLatestByEmail.
CREATE INDEX IF NOT EXISTS "onboarding_sessions_owner_email_idx"
  ON "onboarding_sessions" ("owner_email");

-- Perf: FK lookups performed on every diet read.
CREATE INDEX IF NOT EXISTS "diet_profiles_profile_id_idx"
  ON "diet_profiles" ("profile_id");

CREATE INDEX IF NOT EXISTS "cats_profile_id_idx"
  ON "cats" ("profile_id");

-- Perf: bounded meal-log window queries (dietProfileId + date range).
CREATE INDEX IF NOT EXISTS "diet_meal_logs_diet_profile_id_created_at_idx"
  ON "diet_meal_logs" ("diet_profile_id", "created_at");

-- Perf: trigram GIN indexes accelerate ILIKE '%term%' substring matching.
CREATE INDEX IF NOT EXISTS "plants_common_name_trgm_idx"
  ON "plants" USING GIN ("common_name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "plants_scientific_name_trgm_idx"
  ON "plants" USING GIN ("scientific_name" gin_trgm_ops);
