/**
 * Perenual API Client
 * Thin HTTP client for the Perenual plant species API.
 * Returns null on error or missing required fields.
 */

export interface PerenualApiResult {
  scientific_name: string;
  common_name: string;
  toxicity_status: 'toxic' | 'caution' | 'safe';
  severity?: 'mild' | 'moderate' | 'severe' | 'lethal' | null;
  clinical_signs?: string[];
  media_url?: string | null;
  perenual_id?: string | null;
}

const PERENUAL_BASE_URL = 'https://perenual.com/api/v2';

/**
 * Search for a plant by name using the Perenual species-list endpoint.
 * Returns the first matching result that has both scientific_name and toxicity_status,
 * or null if no valid result is found or an error occurs.
 */
export async function searchPlantByName(query: string): Promise<PerenualApiResult | null> {
  const apiKey = process.env.PERENUAL_API_KEY;

  if (!apiKey) {
    console.warn('[Perenual] PERENUAL_API_KEY is not set — skipping API call.');
    return null;
  }

  try {
    const url = `${PERENUAL_BASE_URL}/species-list?q=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[Perenual] API returned HTTP ${response.status} for query: ${query}`);
      return null;
    }

    const data = await response.json() as {
      data?: Array<{
        scientific_name?: string | string[];
        common_name?: string;
        poisonous_to_pets?: boolean | string | null;
        default_image?: { medium_url?: string | null } | null;
        id?: number | null;
      }>;
    };

    if (!data?.data || data.data.length === 0) {
      const words = query.trim().split(/\s+/);
      if (words.length > 1) {
        console.warn(`[Perenual] No results for species query "${query}". Falling back to genus search for "${words[0]}"`);
        return searchPlantByName(words[0]);
      }
      return null;
    }

    const first = data.data[0];

    // scientific_name may be an array in Perenual's API
    const rawScientificName = Array.isArray(first.scientific_name)
      ? first.scientific_name[0]
      : first.scientific_name;

    if (!rawScientificName || !first.common_name) {
      return null;
    }

    // Map Perenual's poisonous_to_pets to our toxicity_status
    const poisonous = first.poisonous_to_pets;
    let toxicity_status: 'toxic' | 'caution' | 'safe';
    if (poisonous === true || poisonous === 'true' || poisonous === '1') {
      toxicity_status = 'toxic';
    } else if (poisonous === false || poisonous === 'false' || poisonous === '0') {
      toxicity_status = 'safe';
    } else {
      // Unknown — mark as caution
      toxicity_status = 'caution';
    }

    return {
      scientific_name: rawScientificName,
      common_name: first.common_name,
      toxicity_status,
      severity: null,
      clinical_signs: [],
      media_url: first.default_image?.medium_url ?? null,
      perenual_id: first.id != null ? String(first.id) : null,
    };
  } catch (error) {
    console.warn('[Perenual] Request failed:', (error as Error).message);
    return null;
  }
}
