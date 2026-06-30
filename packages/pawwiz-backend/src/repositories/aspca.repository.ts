/**
 * Repository Layer — ASPCA Plant Toxicity
 * Async data access layer replacing in-memory dictionary lookup.
 * Encapsulates all data retrieval for plant toxicity records.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { ASPCA_DATABASE, type PlantToxicityRecord } from '../data/aspca.js';
import { ASPCA_CSV_PLANTS } from '../data/aspca-csv.js';

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
   * Searches the rich ASPCA_DATABASE first (14 entries with full clinical detail),
   * then falls back to ASPCA_CSV_PLANTS (193 entries, toxicity flag only).
   * Also performs genus-level matching so species-specific names (e.g. "Spathiphyllum wallisii")
   * resolve against genus-keyed records (e.g. scientificName "Spathiphyllum spp.").
   * Returns the first matching record or null.
   */
  async findByFuzzyMatch(query: string): Promise<PlantToxicityRecord | null> {
    const cleanQuery = query.toLowerCase().trim();

    // Exact key match first
    if (ASPCA_DATABASE[cleanQuery]) {
      return ASPCA_DATABASE[cleanQuery];
    }

    // Extract genus (first word) from the query for genus-level fallback
    const queryGenus = cleanQuery.split(/\s+/)[0];

    // Search rich ASPCA_DATABASE — substring + genus-level match
    for (const key in ASPCA_DATABASE) {
      const record = ASPCA_DATABASE[key];
      const recordScientific = record.scientificName.toLowerCase();
      const recordCommon = record.plantName.toLowerCase();

      if (
        recordCommon.includes(cleanQuery) ||
        recordScientific.includes(cleanQuery) ||
        cleanQuery.includes(key) ||
        // Genus-level: query is "Rosa canina" → genus "rosa" matches "Rosa spp."
        (queryGenus.length >= 4 && recordScientific.startsWith(queryGenus))
      ) {
        return record;
      }
    }

    // Fall through to the broader CSV dataset (193 entries, toxic-only, no clinical detail)
    for (const csvRecord of ASPCA_CSV_PLANTS) {
      const csvScientific = csvRecord.scientificName.toLowerCase();
      const csvCommon = csvRecord.commonName.toLowerCase();
      const csvGenus = csvScientific.split(/\s+/)[0];

      if (
        csvCommon.includes(cleanQuery) ||
        csvScientific.includes(cleanQuery) ||
        cleanQuery.includes(csvCommon) ||
        // Bidirectional genus match: query genus == record genus
        (queryGenus.length >= 4 && csvGenus === queryGenus) ||
        (queryGenus.length >= 4 && csvScientific.startsWith(queryGenus))
      ) {
        // Synthesise a PlantToxicityRecord — CSV only has name + toxic flag (all entries are toxic)
        return {
          plantName: csvRecord.commonName,
          scientificName: csvRecord.scientificName,
          isToxic: true,
          clinicalSigns: [],
          severity: 'Mild',
          actionRequired: `${csvRecord.commonName} is listed as toxic to cats by the ASPCA. Contact a veterinarian or animal poison control if your cat has ingested it.`,
        };
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
