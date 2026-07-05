/**
 * Repository Layer — PlantNet API Client
 * Encapsulates all outbound HTTP calls to the PlantNet `/v2/identify` endpoint.
 * No business logic. Only network I/O and raw JSON parsing.
 * Singleton Pattern — exported as a single instance.
 *
 * Security: PLANTNET_API_KEY is read at call time and never logged.
 * Timeout: 30-second AbortController guard prevents server memory hold on slow responses.
 */

import { AppError } from '../utils/errors.js';
import { logger } from '../utils/winston.js';

const PLANTNET_API_BASE = 'https://my-api.plantnet.org/v2/identify';
const REQUEST_TIMEOUT_MS = 30_000;

/** Shape of a single result entry from the PlantNet API response array. */
export interface PlantNetResult {
  score: number;
  species: {
    scientificName: string;
    scientificNameWithoutAuthor: string;
    commonNames: string[];
  };
}

/** Minimal shape of the PlantNet API JSON response we care about. */
export interface PlantNetApiResponse {
  results: PlantNetResult[];
  remainingIdentificationRequests?: number;
}

class PlantNetRepository {
  /**
   * Submit an image buffer to PlantNet `/v2/identify/all` and return the raw response.
   * Throws AppError on non-2xx status, timeout, or missing API key.
   *
   * @param imageBuffer  Raw image bytes (JPEG or PNG).
   * @param mimetype     MIME type of the image (`image/jpeg` or `image/png`).
   */
  async identify(imageBuffer: Buffer, mimetype: string): Promise<PlantNetApiResponse> {
    const apiKey = process.env.PLANTNET_API_KEY;
    if (!apiKey) {
      throw AppError.internal('PLANTNET_API_KEY is not configured.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Build multipart/form-data — attach image as `images` field and organ hint.
      const formData = new FormData();
      const extension = mimetype === 'image/png' ? 'png' : 'jpg';
      const file = new File([imageBuffer], `plant.${extension}`, { type: mimetype });
      formData.append('images', file);
      formData.append('organs', 'auto');

      const url = `${PLANTNET_API_BASE}/all?api-key=${apiKey}&include-related-images=false&no-reject=false&lang=en`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Do NOT set Content-Type — the fetch API sets it with the correct boundary.
          'Cache-Control': 'no-store',
        },
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.warn('PlantNet API returned non-2xx status', {
          status: response.status,
          body: body.slice(0, 200), // truncate — never log full response
        });
        throw AppError.internal(`PlantNet API error: HTTP ${response.status}`);
      }

      return (await response.json()) as PlantNetApiResponse;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw AppError.internal('PlantNet API request timed out after 30 seconds.');
      }
      // Re-throw AppErrors as-is; wrap unknown errors.
      if (err instanceof AppError) throw err;
      throw AppError.internal(`PlantNet API fetch failed: ${(err as Error).message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/** Singleton instance */
export const plantNetRepository = new PlantNetRepository();
