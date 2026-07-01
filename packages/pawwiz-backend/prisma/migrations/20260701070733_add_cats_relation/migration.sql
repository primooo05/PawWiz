-- AlterTable
ALTER TABLE "diet_profiles" ADD COLUMN     "cat_id" TEXT;

-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT,
    "onboarding_session_id" TEXT,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "marking" TEXT,
    "sex" TEXT NOT NULL,
    "life_stage" TEXT NOT NULL,
    "age" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diet_profiles" ADD CONSTRAINT "diet_profiles_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_onboarding_session_id_fkey" FOREIGN KEY ("onboarding_session_id") REFERENCES "onboarding_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
