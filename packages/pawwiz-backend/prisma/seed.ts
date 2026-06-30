import { prisma } from '../src/lib/prisma.js';
import { ASPCA_DATABASE } from '../src/data/aspca.js';
import { ASPCA_CSV_PLANTS } from '../src/data/aspca-csv.js';
import { ASPCA_SAFE_PLANTS } from '../src/data/safe-plants-csv.js';

function mapToxicityStatus(isToxic: boolean): string {
  return isToxic ? 'toxic' : 'safe';
}

function mapSeverity(severity: 'None' | 'Mild' | 'Moderate' | 'Severe'): string | null {
  switch (severity) {
    case 'Severe':   return 'severe';
    case 'Moderate': return 'moderate';
    case 'Mild':     return 'mild';
    case 'None':     return null;
  }
}

async function main(): Promise<void> {
  console.log('Seeding ASPCA plant toxicity records...');

  const records = Object.values(ASPCA_DATABASE);

  for (const record of records) {
    const toxicityStatus = mapToxicityStatus(record.isToxic);
    const severity = mapSeverity(record.severity);
    const now = new Date();

    await prisma.plant.upsert({
      where: { scientificName: record.scientificName },
      create: {
        commonName:     record.plantName,
        scientificName: record.scientificName,
        toxicityStatus,
        severity,
        clinicalSigns:  record.clinicalSigns,
        source:         'aspca',
        mediaUrl:       record.mediaUrl ?? null,
        perenualId:     null,
        cachedAt:       null,
        lastVerifiedAt: now,
      },
      update: {
        commonName:     record.plantName,
        toxicityStatus,
        severity,
        clinicalSigns:  record.clinicalSigns,
        source:         'aspca',
        mediaUrl:       record.mediaUrl ?? null,
        cachedAt:       null,
        lastVerifiedAt: now,
      },
    });

    console.log(`  Upserted: ${record.scientificName}`);
  }

  console.log(`Done — seeded ${records.length} ASPCA records.`);

  // Seed CSV plants that aren't already in ASPCA_DATABASE
  console.log('\nSeeding supplementary ASPCA CSV plant records...');
  const existingScientificNames = new Set(records.map(r => r.scientificName));
  const csvOnlyPlants = ASPCA_CSV_PLANTS.filter(
    p => !existingScientificNames.has(p.scientificName)
  );

  for (const plant of csvOnlyPlants) {
    const now = new Date();
    await prisma.plant.upsert({
      where: { scientificName: plant.scientificName },
      create: {
        commonName:     plant.commonName,
        scientificName: plant.scientificName,
        toxicityStatus: 'toxic',
        severity:       null,
        clinicalSigns:  [],
        source:         'aspca',
        mediaUrl:       null,
        perenualId:     null,
        cachedAt:       null,
        lastVerifiedAt: now,
      },
      update: {
        commonName:     plant.commonName,
        toxicityStatus: 'toxic',
        clinicalSigns:  [],
        source:         'aspca',
        lastVerifiedAt: now,
      },
    });
    console.log(`  Upserted CSV: ${plant.scientificName}`);
  }

  console.log(`Done — seeded ${csvOnlyPlants.length} supplementary CSV records.`);

  // Seed safe plants
  console.log('\nSeeding ASPCA safe plant records...');
  const allSeededNames = new Set([
    ...records.map(r => r.scientificName),
    ...csvOnlyPlants.map(p => p.scientificName),
  ]);
  const safePlantsToSeed = ASPCA_SAFE_PLANTS.filter(
    p => !allSeededNames.has(p.scientificName)
  );

  for (const plant of safePlantsToSeed) {
    const now = new Date();
    await prisma.plant.upsert({
      where: { scientificName: plant.scientificName },
      create: {
        commonName:     plant.commonName,
        scientificName: plant.scientificName,
        toxicityStatus: 'safe',
        severity:       null,
        clinicalSigns:  [],
        source:         'aspca',
        mediaUrl:       null,
        perenualId:     null,
        cachedAt:       null,
        lastVerifiedAt: now,
      },
      update: {
        commonName:     plant.commonName,
        toxicityStatus: 'safe',
        clinicalSigns:  [],
        source:         'aspca',
        lastVerifiedAt: now,
      },
    });
    console.log(`  Upserted safe: ${plant.scientificName}`);
  }

  console.log(`Done — seeded ${safePlantsToSeed.length} safe plant records.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
