-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "supabase_user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "cat_name" TEXT NOT NULL,
    "cat_breed" TEXT,
    "cat_marking" TEXT,
    "cat_sex" TEXT NOT NULL,
    "cat_life_stage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_sessions" (
    "id" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "owner_name" TEXT,
    "owner_email" TEXT,
    "otp_hash" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_last_sent_at" TIMESTAMP(3),
    "cats_count" TEXT,
    "custom_cats_count" TEXT,
    "cat_name" TEXT,
    "cat_breed" TEXT,
    "cat_marking" TEXT,
    "cat_sex" TEXT,
    "cat_life_stage" TEXT,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_supabase_user_id_key" ON "profiles"("supabase_user_id");


