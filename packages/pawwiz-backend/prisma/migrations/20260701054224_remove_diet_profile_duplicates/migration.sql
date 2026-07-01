/*
  Warnings:

  - You are about to drop the column `age` on the `diet_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `diet_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `life_stage` on the `diet_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `diet_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[diet_profile_id,meal_name]` on the table `diet_meal_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "diet_meal_logs_diet_profile_id_meal_name_key" ON "diet_meal_logs"("diet_profile_id", "meal_name");
