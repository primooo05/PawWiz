/**
 * Repository Layer — ASPCA Plant Toxicity
 * Async data access layer replacing in-memory dictionary lookup.
 * Encapsulates all data retrieval for plant toxicity records.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { ASPCA_DATABASE, type PlantToxicityRecord } from '../data/aspca.js';

class AspcaRepository {
  /**
   * Find a plant record by exact key match.
   */
  async findByKey(key: string): Promise<PlantToxicityRecord | null> {
    const normalized = key.toLowerCase().trim();
    return ASPCA_DATABASE[normalized] ?? null;
  }

  /**
   * Fuzzy search: matches against common name, scientific name, or database key.
   * Returns the first matching record or null.
   */
  async findByFuzzyMatch(query: string): Promise<PlantToxicityRecord | null> {
    const cleanQuery = query.toLowerCase().trim();

    // Exact key match first
    if (ASPCA_DATABASE[cleanQuery]) {
      return ASPCA_DATABASE[cleanQuery];
    }

    // Substring match in common name, scientific name, or key
    for (const key in ASPCA_DATABASE) {
      const record = ASPCA_DATABASE[key];
      if (
        record.plantName.toLowerCase().includes(cleanQuery) ||
        record.scientificName.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(key)
      ) {
        return record;
      }
    }

    return null;
  }

  /**
   * Return all plant records in the database.
   */
  async findAll(): Promise<PlantToxicityRecord[]> {
    return Object.values(ASPCA_DATABASE);
  }
}

/** Singleton instance */
export const aspcaRepository = new AspcaRepository();
