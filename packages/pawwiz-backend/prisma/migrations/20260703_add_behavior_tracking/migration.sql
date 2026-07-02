-- Add BehaviorLog table for tracking behavior patterns throughout conversations
CREATE TABLE behavior_logs (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  supabase_user_id TEXT NOT NULL,
  cat_id TEXT,
  behavior_type TEXT NOT NULL, -- 'playful', 'anxious', 'aggressive', 'lethargic', 'affectionate', etc.
  intensity TEXT NOT NULL, -- 'mild', 'moderate', 'severe'
  description TEXT NOT NULL, -- e.g. "Cat sprinting around house at 2 AM"
  context TEXT, -- e.g. "night time", "after meal"
  extracted_from TEXT NOT NULL, -- description of the user message it came from
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0-1 scale
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES behavior_chats(id) ON DELETE CASCADE
);

CREATE INDEX idx_behavior_logs_supabase_user_id ON behavior_logs(supabase_user_id);
CREATE INDEX idx_behavior_logs_chat_id ON behavior_logs(chat_id);
CREATE INDEX idx_behavior_logs_cat_id ON behavior_logs(cat_id);
CREATE INDEX idx_behavior_logs_behavior_type ON behavior_logs(behavior_type);
CREATE INDEX idx_behavior_logs_created_at ON behavior_logs(created_at);
