-- Migration: add session_token to onboarding_sessions
-- Binds each onboarding session to a cryptographically random token that
-- must be supplied on all mutating operations. UUID-only knowledge of the
-- session ID is no longer sufficient to read or advance the session.

ALTER TABLE "onboarding_sessions"
  ADD COLUMN "session_token" TEXT;

-- Back-fill existing rows with a random UUID so NOT NULL can be enforced.
UPDATE "onboarding_sessions"
  SET "session_token" = gen_random_uuid()::text
  WHERE "session_token" IS NULL;

ALTER TABLE "onboarding_sessions"
  ALTER COLUMN "session_token" SET NOT NULL;

CREATE UNIQUE INDEX "onboarding_sessions_session_token_key"
  ON "onboarding_sessions"("session_token");
