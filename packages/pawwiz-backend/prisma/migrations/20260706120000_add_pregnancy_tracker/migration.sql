-- Migration: add_pregnancy_tracker
-- Creates the Flo-style pregnancy tracker tables:
--   pregnancy_sessions, pregnancy_logs, pregnancy_insights
-- Purely additive — no existing tables are modified.

-- 1. pregnancy_sessions
CREATE TABLE IF NOT EXISTS "pregnancy_sessions" (
  "id"                     TEXT        NOT NULL,
  "cat_id"                 TEXT        NOT NULL,
  "mating_date"            TIMESTAMP(3) NOT NULL,
  "status"                 TEXT        NOT NULL DEFAULT 'active',
  "expected_delivery_date" TIMESTAMP(3) NOT NULL,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pregnancy_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pregnancy_sessions_cat_id_fkey"
    FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "pregnancy_sessions_cat_id_idx"
  ON "pregnancy_sessions" ("cat_id");

CREATE INDEX IF NOT EXISTS "pregnancy_sessions_cat_id_status_idx"
  ON "pregnancy_sessions" ("cat_id", "status");

-- 2. pregnancy_logs
CREATE TABLE IF NOT EXISTS "pregnancy_logs" (
  "id"                   TEXT        NOT NULL,
  "pregnancy_session_id" TEXT        NOT NULL,
  "symptoms"             TEXT[],
  "mood_behavior"        TEXT[],
  "appetite_level"       TEXT,
  "energy_level"         TEXT,
  "nesting_observed"     BOOLEAN     NOT NULL DEFAULT false,
  "weight"               DOUBLE PRECISION,
  "temp"                 DOUBLE PRECISION,
  "gestation_week"       INTEGER     NOT NULL,
  "notes"                TEXT,
  "log_date"             TIMESTAMP(3) NOT NULL,
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pregnancy_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pregnancy_logs_pregnancy_session_id_fkey"
    FOREIGN KEY ("pregnancy_session_id") REFERENCES "pregnancy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "pregnancy_logs_pregnancy_session_id_idx"
  ON "pregnancy_logs" ("pregnancy_session_id");

CREATE INDEX IF NOT EXISTS "pregnancy_logs_gestation_week_idx"
  ON "pregnancy_logs" ("gestation_week");

-- 3. pregnancy_insights
CREATE TABLE IF NOT EXISTS "pregnancy_insights" (
  "id"                   TEXT        NOT NULL,
  "pregnancy_session_id" TEXT        NOT NULL,
  "insight_type"         TEXT        NOT NULL,
  "title"                TEXT        NOT NULL,
  "body"                 TEXT        NOT NULL,
  "gestation_week"       INTEGER     NOT NULL,
  "is_read"              BOOLEAN     NOT NULL DEFAULT false,
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pregnancy_insights_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pregnancy_insights_pregnancy_session_id_fkey"
    FOREIGN KEY ("pregnancy_session_id") REFERENCES "pregnancy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "pregnancy_insights_pregnancy_session_id_idx"
  ON "pregnancy_insights" ("pregnancy_session_id");

CREATE INDEX IF NOT EXISTS "pregnancy_insights_pregnancy_session_id_is_read_idx"
  ON "pregnancy_insights" ("pregnancy_session_id", "is_read");
