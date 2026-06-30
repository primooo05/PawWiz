-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "toxicity_status" TEXT NOT NULL,
    "severity" TEXT,
    "clinical_signs" TEXT[],
    "source" TEXT NOT NULL,
    "media_url" TEXT,
    "perenual_id" TEXT,
    "cached_at" TIMESTAMP(3),
    "last_verified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plants_scientific_name_key" ON "plants"("scientific_name");

-- CreateIndex
CREATE INDEX "plants_scientific_name_idx" ON "plants"("scientific_name");

-- CreateIndex
CREATE INDEX "plants_common_name_idx" ON "plants"("common_name");
