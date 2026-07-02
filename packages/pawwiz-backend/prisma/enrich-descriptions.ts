/**
 * Offline batch script — backfills `Plant.physicalDescription`.
 *
 * Pipeline (kept intentionally separate from request-serving code):
 *   1. Query local DB for plant records missing a physical description.
 *   2. For each, fetch a deterministic text extract from Wikipedia's
 *      structured REST summary endpoint (never raw HTML scraping).
 *   3. Throttle requests (500ms delay) to stay within Wikipedia's usage policy
 *      and avoid IP-level rate limiting or bans.
 *   4. Accumulate results in memory, then apply one chunked UPDATE transaction —
 *      isolated from the network-fetching loop above.
 *
 * Usage:
 *   infisical run -- npx tsx prisma/enrich-descriptions.ts
 *   infisical run -- npx tsx prisma/enrich-descriptions.ts --limit 50   (dry-run a subset)
 */

import { prisma } from '../src/lib/prisma.js';
import { wikipediaRepository } from '../src/repositories/wikipedia.repository.js';

const REQUEST_DELAY_MS = 500;
const UPDATE_CHUNK_SIZE = 50;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseLimitArg(): number | undefined {
  const idx = process.argv.indexOf('--limit');
  if (idx === -1) return undefined;
  const value = Number(process.argv[idx + 1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function main(): Promise<void> {
  const limit = parseLimitArg();

  console.log('Fetching plant records missing a physical description...');
  const plants = await prisma.plant.findMany({
    where: { physicalDescription: null },
    select: { id: true, commonName: true, scientificName: true },
    ...(limit !== undefined && { take: limit }),
  });

  console.log(`Found ${plants.length} record(s) to enrich.`);
  if (plants.length === 0) {
    return;
  }

  // Step 1: fetch descriptions with strict throttling — network I/O only, no DB writes here.
  const resolved: { id: string; physicalDescription: string }[] = [];
  let skipped = 0;

  for (const [index, plant] of plants.entries()) {
    const label = `[${index + 1}/${plants.length}] ${plant.scientificName}`;

    let extract = await wikipediaRepository.fetchSummaryExtract(plant.scientificName);

    if (!extract) {
      await delay(REQUEST_DELAY_MS);
      extract = await wikipediaRepository.fetchSummaryExtract(plant.commonName);
    }

    if (extract) {
      resolved.push({ id: plant.id, physicalDescription: extract });
      console.log(`${label} — resolved (${extract.length} chars)`);
    } else {
      skipped++;
      console.log(`${label} — no extract found, skipping`);
    }

    // Throttle between records regardless of hit/miss to respect API rate limits.
    if (index < plants.length - 1) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  console.log(
    `\nResolved ${resolved.length} description(s), skipped ${skipped}. Applying DB updates...`
  );

  // Step 2: apply updates in chunked transactions — isolated from the fetch loop above.
  const batches = chunk(resolved, UPDATE_CHUNK_SIZE);
  let updatedCount = 0;

  for (const [batchIndex, batch] of batches.entries()) {
    await prisma.$transaction(
      batch.map((record) =>
        prisma.plant.update({
          where: { id: record.id },
          data: { physicalDescription: record.physicalDescription },
        })
      )
    );
    updatedCount += batch.length;
    console.log(`  Applied batch ${batchIndex + 1}/${batches.length} (${updatedCount}/${resolved.length} total)`);
  }

  console.log(`\nDone — updated ${updatedCount} plant record(s) with physical descriptions.`);
}

main()
  .catch((err) => {
    console.error('Enrichment failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
