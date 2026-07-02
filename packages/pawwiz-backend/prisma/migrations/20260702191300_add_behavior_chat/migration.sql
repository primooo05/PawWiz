-- CreateTable
CREATE TABLE "behavior_chats" (
    "id" TEXT NOT NULL,
    "supabase_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "behavior_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavior_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "analysis" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "behavior_chats_supabase_user_id_idx" ON "behavior_chats"("supabase_user_id");

-- CreateIndex
CREATE INDEX "behavior_messages_chat_id_idx" ON "behavior_messages"("chat_id");

-- AddForeignKey
ALTER TABLE "behavior_messages" ADD CONSTRAINT "behavior_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "behavior_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
