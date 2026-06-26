-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "supabase_user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_supabase_user_id_key" ON "profiles"("supabase_user_id");
