/**
 * Repository Layer — ASPCA Plant Toxicity
 * Async data access layer replacing in-memory dictionary lookup.
 * Encapsulates all data retrieval for plant toxicity records.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { type PlantToxicityRecord } from '../types/shared.js';
import { ASPCA_CSV_PLANTS } from '../data/aspca-csv.js';
import { ASPCA_SAFE_PLANTS } from '../data/safe-plants-csv.js';

class AspcaRepository {
  /**
   * Find a plant record by exact key match.
   */
  async findByKey(key: string): Promise<PlantToxicityRecord | null> {
    const normalized = key.toLowerCase().trim();
    return ASPCA_CSV_PLANTS[normalized] ?? ASPCA_SAFE_PLANTS[normalized] ?? null;
  }

  /**
   * Fuzzy search: matches against common name, scientific name, or database key.
   * Searches the toxic plants database first (ASPCA_CSV_PLANTS),
   * then falls back to the safe plants database (ASPCA_SAFE_PLANTS).
   * Also performs genus-level matching so species-specific names (e.g. "Spathiphyllum wallisii")
   * resolve against genus-keyed records (e.g. scientificName "Spathiphyllum spp.").
   * Returns the first matching record or null.
   */
  async findByFuzzyMatch(query: string): Promise<PlantToxicityRecord | null> {
    const cleanQuery = query.toLowerCase().trim();

    // Exact key match first
    if (ASPCA_CSV_PLANTS[cleanQuery]) {
      return ASPCA_CSV_PLANTS[cleanQuery];
    }
    if (ASPCA_SAFE_PLANTS[cleanQuery]) {
      return ASPCA_SAFE_PLANTS[cleanQuery];
    }

    // Extract genus (first word) from the query for genus-level fallback
    const queryGenus = cleanQuery.split(/\s+/)[0];

    // Search toxic plants database
    for (const key in ASPCA_CSV_PLANTS) {
      const record = ASPAS_CSV_PLANTS_OR_SAFE(ASPCA_CSV_PLANTS[key], cleanQuery, queryGenus, key);
      if (record) return record;
    }

    // Search safe plants database
    for (const key in ASPCA_SAFE_PLANTS) {
      const record = ASPAS_CSV_PLANTS_OR_SAFE(ASPCA_SAFE_PLANTS[key], cleanQuery, queryGenus, key);
      if (record) return record;
    }

    return null;
  }

  /**
   * Return all plant records in the database.
   */
  async findAll(): Promise<PlantToxicityRecord[]> {
    return [
      ...Object.values(ASPCA_CSV_PLANTS),
      ...Object.values(ASPCA_SAFE_PLANTS),
    ];
  }
}

function ASPAS_CSV_PLANTS_OR_SAFE(record: PlantToxicityRecord, cleanQuery: string, queryGenus: string, key: string): PlantToxicityRecord | null {
  const recordScientific = record.scientificName.toLowerCase();
  const recordCommon = record.plantName.toLowerCase();
  const recordGenus = recordScientific.split(/\s+/)[0];

  if (
    recordCommon.includes(cleanQuery) ||
    recordScientific.includes(cleanQuery) ||
    cleanQuery.includes(key) ||
    // Genus-level fallback
    (queryGenus.length >= 4 && recordScientific.startsWith(queryGenus)) ||
    (queryGenus.length >= 4 && recordGenus === queryGenus)
  ) {
    return record;
  }
  return null;
}

/** Singleton instance */
export const aspcaRepository = new AspcaRepository();
