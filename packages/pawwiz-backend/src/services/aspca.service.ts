/**
 * Service Layer — ASPCA Plant Toxicity
 * Coordinator Pattern: orchestrates fuzzy lookup workflow via repository.
 * Contains guards only — no direct data access.
 * Singleton Pattern — exported as a single instance.
 */

import { aspcaRepository } from '../repositories/aspca.repository.js';
import { assertNonEmpty } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import type { PlantToxicityRecord } from '../types/shared.js';
import type { PlantLookupResponse } from '../types/shared.js';

class AspcaService {
  /**
   * Look up a plant by name using fuzzy matching.
   * Guards: plantName required and non-empty, plant must exist in database.
   */
  async lookupPlant(plantName: string): Promise<PlantLookupResponse> {
    assertNonEmpty(plantName, 'plantName');

    const record = await aspcaRepository.findByFuzzyMatch(plantName);

    if (!record) {
      throw AppError.notFound(
        `Plant "${plantName}" not found in ASPCA database. Try a different name or use the image scan feature.`
      );
    }

    return this.toResponse(record);
  }

  /**
   * List all plants in the ASPCA database.
   */
  async listAll(): Promise<PlantLookupResponse[]> {
    const records = await aspcaRepository.findAll();
    return records.map((record) => this.toResponse(record));
  }

  /**
   * Map a raw PlantToxicityRecord to the public PlantLookupResponse shape.
   */
  private toResponse(record: PlantToxicityRecord): PlantLookupResponse {
    return {
      plantName: record.plantName,
      scientificName: record.scientificName,
      isToxic: record.isToxic,
      clinicalSigns: record.clinicalSigns,
      severity: record.severity,
      actionRequired: record.actionRequired,
    };
  }
}

/** Singleton instance */
export const aspcaService = new AspcaService();
