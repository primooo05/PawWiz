-- CreateTable
CREATE TABLE "diet_profiles" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "is_kg" BOOLEAN NOT NULL,
    "food_preference" TEXT NOT NULL,
    "is_spayed_neutered" BOOLEAN NOT NULL,
    "is_tracking" BOOLEAN NOT NULL DEFAULT false,
    "water_intake" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_meal_logs" (
    "id" TEXT NOT NULL,
    "diet_profile_id" TEXT NOT NULL,
    "meal_name" TEXT NOT NULL,
    "food_type" TEXT,
    "amount" DOUBLE PRECISION,
    "unit" TEXT,
    "kcal" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "timestamp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_meal_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diet_profiles" ADD CONSTRAINT "diet_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_meal_logs" ADD CONSTRAINT "diet_meal_logs_diet_profile_id_fkey" FOREIGN KEY ("diet_profile_id") REFERENCES "diet_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
