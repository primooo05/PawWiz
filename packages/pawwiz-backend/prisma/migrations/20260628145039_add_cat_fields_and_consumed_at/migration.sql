-- AlterTable
ALTER TABLE "onboarding_sessions" ALTER COLUMN "consumed_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "cat_name" DROP DEFAULT,
ALTER COLUMN "cat_sex" DROP DEFAULT,
ALTER COLUMN "cat_life_stage" DROP DEFAULT;
