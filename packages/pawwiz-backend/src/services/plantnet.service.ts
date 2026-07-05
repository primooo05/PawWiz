/**
 * Service Layer — PlantNet Plant Identification
 * Orchestrates image-based plant identification via the PlantNet API.
 * Returns a { scientificName, confidence } shape identical to the former
 * Gemini Vision contract, so downstream pipeline code requires no changes.
 *
 * Graceful fallback: when PLANTNET_API_KEY is absent, returns a deterministic
 * mock result (same behaviour as the Gemini Vision mock path it replaces).
 *
 * Singleton Pattern — exported as a single instance.
 */

import { plantNetRepository } from '../repositories/plantnet.repository.js';
import { logger } from '../utils/winston.js';

/** Contract shared with toxicity_cache.service.ts — do not change field names. */
export interface PlantIdentificationResult {
  scientificName: string | null;
  confidence: number;
}

class PlantNetService {
  /**
   * Identify a plant from a raw image buffer.
   * Extracts `results[0]` (highest-confidence entry; PlantNet pre-sorts descending).
   * Maps `results[0].score` directly to `confidence` — no transformation needed.
   *
   * @param imageBuffer  Raw image bytes (JPEG or PNG, max 10 MB).
   * @param mimetype     MIME type of the uploaded file.
   */
  async identify(imageBuffer: Buffer, mimetype: string): Promise<PlantIdentificationResult> {
    // Mock fallback when API key is not configured.
    if (!process.env.PLANTNET_API_KEY) {
      logger.warn('PLANTNET_API_KEY not set — PlantNet identification using mock fallback.');
      return { scientificName: 'Spathiphyllum wallisii', confidence: 0.94 };
    }

    const apiResponse = await plantNetRepository.identify(imageBuffer, mimetype);

    if (!apiResponse.results || apiResponse.results.length === 0) {
      logger.warn('PlantNet API returned an empty results array.');
      return { scientificName: null, confidence: 0 };
    }

    // results[0] is always the top-confidence result per PlantNet's documented sort order.
    const top = apiResponse.results[0];

    return {
      scientificName: top.species.scientificName ?? null,
      confidence: top.score, // already 0.0–1.0 float — maps directly to identificationConfidence
    };
  }
}

/** Singleton instance */
export const plantnetService = new PlantNetService();
