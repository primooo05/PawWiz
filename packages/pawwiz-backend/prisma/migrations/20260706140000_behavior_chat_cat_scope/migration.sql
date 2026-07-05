-- Migration: behavior_chat_cat_scope
-- Adds cat_id to behavior_chats so each chat is scoped to a specific cat.
-- The column is nullable to preserve existing rows (legacy user-scoped chats and
-- the reserved "Quick Logs" anchor chat both keep cat_id = NULL).
-- A composite index on (supabase_user_id, cat_id) replaces the single-column
-- user index for efficient per-cat chat list queries.

ALTER TABLE "behavior_chats"
  ADD COLUMN "cat_id" TEXT;

ALTER TABLE "behavior_chats"
  ADD CONSTRAINT "behavior_chats_cat_id_fkey"
    FOREIGN KEY ("cat_id") REFERENCES "cats"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "behavior_chats_supabase_user_id_cat_id_idx"
  ON "behavior_chats" ("supabase_user_id", "cat_id");
