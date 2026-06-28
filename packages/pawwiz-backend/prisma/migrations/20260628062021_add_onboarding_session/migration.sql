-- CreateTable
CREATE TABLE "onboarding_sessions" (
    "id" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "owner_name" TEXT,
    "cats_count" TEXT,
    "custom_cats_count" TEXT,
    "cat_name" TEXT,
    "cat_breed" TEXT,
    "cat_marking" TEXT,
    "cat_sex" TEXT,
    "cat_life_stage" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_sessions_pkey" PRIMARY KEY ("id")
);
