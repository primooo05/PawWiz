/**
 * Repository Layer — Wikipedia REST API Client
 * Encapsulates outbound HTTP calls to Wikipedia's `/page/summary/{title}` endpoint.
 * No business logic. Only network I/O and raw JSON parsing.
 * Singleton Pattern — exported as a single instance.
 *
 * Used to backfill `physicalDescription` on Plant records via structured,
 * deterministic text extracts — never raw HTML scraping.
 */

import { logger } from '../utils/winston.js';

const WIKIPEDIA_SUMMARY_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const REQUEST_TIMEOUT_MS = 10_000;

/** Minimal shape of the Wikipedia REST summary response we care about. */
interface WikipediaSummaryResponse {
  extract?: string;
  type?: string; // 'standard' | 'disambiguation' | 'no-extract' etc.
}

class WikipediaRepository {
  /**
   * Fetch the plain-text summary extract for a page title.
   * Returns null on 404, disambiguation pages, empty extracts, or any network/timeout error.
   * Never throws — enrichment is best-effort and must not abort the batch run.
   */
  async fetchSummaryExtract(title: string): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = `${WIKIPEDIA_SUMMARY_BASE}/${encodeURIComponent(title)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          // Wikipedia's REST API asks consumers to identify their app.
          'User-Agent': 'PawWiz-Enrichment-Script/1.0 (https://github.com/pawwiz)',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status !== 404) {
          logger.warn('Wikipedia API returned non-2xx status', { title, status: response.status });
        }
        return null;
      }

      const body = (await response.json()) as WikipediaSummaryResponse;

      if (body.type === 'disambiguation' || body.type === 'no-extract') {
        return null;
      }

      const extract = body.extract?.trim();
      return extract && extract.length > 0 ? extract : null;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        logger.warn('Wikipedia API request timed out', { title });
      } else {
        logger.warn('Wikipedia API fetch failed', { title, error: (err as Error).message });
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/** Singleton instance */
export const wikipediaRepository = new WikipediaRepository();
