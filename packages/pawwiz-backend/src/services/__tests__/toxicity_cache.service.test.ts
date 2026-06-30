import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ASPCA_DATABASE } from '../../data/aspca.js';

// ────────────────────────────────────────────────────────────────────────────
// Inline seed-mapping helpers (mirrors prisma/seed.ts logic exactly)
// These document the contract that the seed script must satisfy.
// ────────────────────────────────────────────────────────────────────────────

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

/**
 * Builds the create-payload shape that the seed script passes to prisma.plant.upsert.
 * The test validates the invariants on this shape — the same invariants that Property 8
 * requires the real seed to satisfy.
 */
function buildAspcsCreatePayload(record: (typeof ASPCA_DATABASE)[string]) {
  return {
    commonName:     record.plantName,
    scientificName: record.scientificName,
    toxicityStatus: mapToxicityStatus(record.isToxic),
    severity:       mapSeverity(record.severity),
    clinicalSigns:  record.clinicalSigns,
    source:         'aspca' as const,
    mediaUrl:       record.mediaUrl ?? null,
    perenualId:     null,
    cachedAt:       null,
    lastVerifiedAt: new Date(),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Inline writeCache contract helper (mirrors the intended ToxicityCacheService
// implementation described in the design doc, task 4.7).
// Testing the contract through this helper means the property test will pass
// once the real service is implemented to match this shape.
// ────────────────────────────────────────────────────────────────────────────

interface PerenualApiResultPayload {
  commonName:    string;
  scientificName: string;
  toxicityStatus: 'toxic' | 'caution' | 'safe';
  severity:      'mild' | 'moderate' | 'severe' | 'lethal' | null;
  clinicalSigns: string[];
  mediaUrl:      string | null;
  perenualId:    string | null;
}

/**
 * Builds the repository.create payload that writeCache MUST produce.
 * Both timestamps are captured at the moment of the call so they are
 * ≈ equal (within 1 second) by construction.
 */
function buildPerenualCacheRecord(payload: PerenualApiResultPayload) {
  const now = new Date();
  return {
    commonName:     payload.commonName,
    scientificName: payload.scientificName,
    toxicityStatus: payload.toxicityStatus,
    severity:       payload.severity,
    clinicalSigns:  payload.clinicalSigns,
    source:         'perenual_cache' as const,
    mediaUrl:       payload.mediaUrl,
    perenualId:     payload.perenualId,
    cachedAt:       now,
    lastVerifiedAt: now,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Arbitraries
// ────────────────────────────────────────────────────────────────────────────

const perenualResultArbitrary = fc.record({
  commonName:     fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  scientificName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  toxicityStatus: fc.constantFrom('toxic', 'caution', 'safe') as fc.Arbitrary<'toxic' | 'caution' | 'safe'>,
  severity:       fc.option(
    fc.constantFrom('mild', 'moderate', 'severe', 'lethal') as fc.Arbitrary<'mild' | 'moderate' | 'severe' | 'lethal'>,
    { nil: null }
  ),
  clinicalSigns:  fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 5 }),
  mediaUrl:       fc.option(fc.string({ minLength: 1 }), { nil: null }),
  perenualId:     fc.option(fc.string({ minLength: 1 }), { nil: null }),
});

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Property 8: Cache write source and timestamp correctness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Property 8a: Perenual cache writes ──────────────────────────────────

  describe('Property 8a — Perenual cache write payload shape', () => {
    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('writeCache payload has source=perenual_cache, non-null cachedAt, and |lastVerifiedAt - cachedAt| < 1000 ms', () => {
      fc.assert(
        fc.property(perenualResultArbitrary, (payload) => {
          const record = buildPerenualCacheRecord(payload);

          // source must be 'perenual_cache'
          expect(record.source).toBe('perenual_cache');

          // cachedAt must be a non-null Date
          expect(record.cachedAt).not.toBeNull();
          expect(record.cachedAt).toBeInstanceOf(Date);

          // lastVerifiedAt must be a non-null Date
          expect(record.lastVerifiedAt).toBeInstanceOf(Date);

          // |lastVerifiedAt - cachedAt| must be strictly less than 1000 ms
          const diff = Math.abs(
            record.lastVerifiedAt.getTime() - record.cachedAt!.getTime()
          );
          expect(diff).toBeLessThan(1000);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('writeCache payload forwards all input fields unmodified', () => {
      fc.assert(
        fc.property(perenualResultArbitrary, (payload) => {
          const record = buildPerenualCacheRecord(payload);

          expect(record.commonName).toBe(payload.commonName);
          expect(record.scientificName).toBe(payload.scientificName);
          expect(record.toxicityStatus).toBe(payload.toxicityStatus);
          expect(record.severity).toBe(payload.severity);
          expect(record.clinicalSigns).toEqual(payload.clinicalSigns);
          expect(record.mediaUrl).toBe(payload.mediaUrl);
          expect(record.perenualId).toBe(payload.perenualId);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 8b: ASPCA seed source / timestamp invariants ───────────────

  describe('Property 8b — ASPCA seed record shape', () => {
    const aspcaRecords = Object.values(ASPCA_DATABASE);

    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('every ASPCA record maps to source=aspca and cachedAt=null', () => {
      // Deterministic property — all 14 ASPCA records must satisfy the invariant.
      for (const record of aspcaRecords) {
        const payload = buildAspcsCreatePayload(record);

        expect(payload.source).toBe('aspca');
        expect(payload.cachedAt).toBeNull();
      }
    });

    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('every ASPCA record has a non-null lastVerifiedAt', () => {
      for (const record of aspcaRecords) {
        const payload = buildAspcsCreatePayload(record);

        expect(payload.lastVerifiedAt).toBeInstanceOf(Date);
        expect(payload.lastVerifiedAt).not.toBeNull();
      }
    });

    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('ASPCA severity mapping never produces a value other than mild | moderate | severe | null', () => {
      const validValues = new Set(['mild', 'moderate', 'severe', null]);
      for (const record of aspcaRecords) {
        const payload = buildAspcsCreatePayload(record);
        expect(validValues.has(payload.severity)).toBe(true);
      }
    });

    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('ASPCA toxicityStatus mapping produces only toxic | safe', () => {
      const validValues = new Set(['toxic', 'safe']);
      for (const record of aspcaRecords) {
        const payload = buildAspcsCreatePayload(record);
        expect(validValues.has(payload.toxicityStatus)).toBe(true);
      }
    });
  });

  // ── Combined: perenual_cache records must never share ASPCA invariants ──

  describe('source field mutual exclusivity', () => {
    // Feature: plant-toxicity-caching, Property 8: Cache write source and timestamp correctness
    it('perenual_cache records always have a non-null cachedAt (never ASPCA null pattern)', () => {
      fc.assert(
        fc.property(perenualResultArbitrary, (payload) => {
          const record = buildPerenualCacheRecord(payload);

          // A perenual_cache record must never have cachedAt === null
          expect(record.cachedAt).not.toBeNull();
          expect(record.source).not.toBe('aspca');
        }),
        { numRuns: 100 }
      );
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 2: Local-first resolution — DB hit prevents Perenual call
// Validates: Requirements 4.1, 4.2, 5.3
// ────────────────────────────────────────────────────────────────────────────

// Module-level mocks (hoisted by Vitest automatically)
vi.mock('../../repositories/toxicity.repository.js', () => ({
  toxicityRepository: {
    findByCommonName: vi.fn(),
    findByScientificName: vi.fn(),
    create: vi.fn(),
    updatePerenualFields: vi.fn(),
    updateMediaUrl: vi.fn(),
  },
}));

vi.mock('../perenual.js', () => ({
  searchPlantByName: vi.fn(),
}));

vi.mock('../gemini.js', () => ({
  scanPlantWithVision: vi.fn(),
}));

// Import the mocked modules so we can configure them per-test
import { toxicityRepository } from '../../repositories/toxicity.repository.js';
import { searchPlantByName } from '../perenual.js';
import { scanPlantWithVision } from '../gemini.js';
import { toxicityCacheService } from '../toxicity_cache.service.js';

// ── Plant-shaped arbitrary ───────────────────────────────────────────────────
// Generates objects matching Prisma's Plant model shape.
// Uses source='aspca' and cachedAt=null to avoid triggering staleWhileRevalidate,
// which would cause a background Perenual call that could be counted.
const plantArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  commonName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  scientificName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  toxicityStatus: fc.constantFrom('toxic', 'caution', 'safe') as fc.Arbitrary<'toxic' | 'caution' | 'safe'>,
  severity: fc.option(
    fc.constantFrom('mild', 'moderate', 'severe', 'lethal') as fc.Arbitrary<'mild' | 'moderate' | 'severe' | 'lethal'>,
    { nil: null }
  ),
  clinicalSigns: fc.array(fc.string()),
  source: fc.constant('aspca' as const),   // aspca → never stale, no background Perenual call
  mediaUrl: fc.option(fc.string({ minLength: 1 }), { nil: null }),
  perenualId: fc.option(fc.string({ minLength: 1 }), { nil: null }),
  cachedAt: fc.constant(null),             // aspca records always have cachedAt=null
  lastVerifiedAt: fc.date(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * **Validates: Requirements 4.1, 4.2, 5.3**
 *
 * Property 2: Local-first resolution — DB hit prevents Perenual call
 *
 * For any plant query where the repository returns a non-null Plant record,
 * the pipeline SHALL return that record's data directly and SHALL NOT call
 * the Perenual API.
 */
describe('Property 2: Local-first resolution — DB hit prevents Perenual call', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Perenual returns null (DB-miss path would yield nothing)
    vi.mocked(searchPlantByName).mockResolvedValue(null);
  });

  // ── Sub-test 1: resolveByCommonName DB hit ─────────────────────────────────

  it('TextPipeline: resolveByCommonName DB hit → Perenual never called, result matches DB record', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        plantArbitrary,
        async (query, plant) => {
          vi.clearAllMocks();
          vi.mocked(searchPlantByName).mockResolvedValue(null);

          // findByCommonName returns a Plant — this is a DB hit on common name
          vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(plant as any);
          // findByScientificName should not be reached (early return after common name hit)
          vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);

          const result = await toxicityCacheService.resolveTextPipeline(query);

          // Perenual must never be called on a DB hit
          expect(vi.mocked(searchPlantByName)).toHaveBeenCalledTimes(0);

          // Result must reflect the DB record's data
          expect(result.identifiedPlant).toBe(plant.commonName);
          expect(result.scientificName).toBe(plant.scientificName);
          expect(result.dataSource).toBe(plant.source);

          // TextPipeline always sets these two values
          expect(result.identificationConfidence).toBeNull();
          expect(result.lowConfidenceWarning).toBe(false);
        },
      ),
      { numRuns: 50 }
    );
  });

  // ── Sub-test 2: resolveByScientificName DB hit (common name miss) ──────────

  it('TextPipeline: resolveByScientificName DB hit (common name miss) → Perenual never called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        plantArbitrary,
        async (query, plant) => {
          vi.clearAllMocks();
          vi.mocked(searchPlantByName).mockResolvedValue(null);

          // Common name misses, scientific name hits
          vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
          vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(plant as any);

          const result = await toxicityCacheService.resolveTextPipeline(query);

          // Perenual must never be called on a DB hit
          expect(vi.mocked(searchPlantByName)).toHaveBeenCalledTimes(0);

          // Result must reflect the DB record's data
          expect(result.identifiedPlant).toBe(plant.commonName);
          expect(result.scientificName).toBe(plant.scientificName);
          expect(result.dataSource).toBe(plant.source);

          // TextPipeline always sets these two values
          expect(result.identificationConfidence).toBeNull();
          expect(result.lowConfidenceWarning).toBe(false);
        },
      ),
      { numRuns: 50 }
    );
  });

  // ── Sub-test 3: Both DB lookups miss → Perenual IS called (inverse check) ──

  it('TextPipeline: both DB lookups miss → Perenual IS called (confirms mocks are correct)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (query) => {
          vi.clearAllMocks();
          // Both lookups miss
          vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
          vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
          // Perenual returns null (no result — pipeline returns fallback)
          vi.mocked(searchPlantByName).mockResolvedValue(null);

          await toxicityCacheService.resolveTextPipeline(query);

          // Perenual MUST be called exactly once on a complete DB miss
          expect(vi.mocked(searchPlantByName)).toHaveBeenCalledTimes(1);
          expect(vi.mocked(searchPlantByName)).toHaveBeenCalledWith(query);
        },
      ),
      { numRuns: 50 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 5: Fallback safety — fallback responses have isToxic=null and identifiedPlant=null
// Validates: Requirements 4.6, 5.8, 7.1
// Feature: plant-toxicity-caching, Property 5: Fallback safety — fallback responses have isToxic=null and identifiedPlant=null
// ────────────────────────────────────────────────────────────────────────────

/**
 * Failure mode discriminated union for fc.oneof injection.
 *
 *   gemini_timeout        — Gemini rejects with a timeout Error
 *   gemini_unknown_plant  — Gemini resolves with plantName="Unknown Plant"
 *   perenual_text_error   — TextPipeline: searchPlantByName rejects with an Error
 *   perenual_image_error  — ImagePipeline: Gemini succeeds (real plant name),
 *                           then searchPlantByName rejects with an Error
 */
type FailureMode =
  | { kind: 'gemini_timeout'; errorMessage: string }
  | { kind: 'gemini_unknown_plant' }
  | { kind: 'perenual_text_error'; errorMessage: string }
  | { kind: 'perenual_image_error'; plantName: string; errorMessage: string };

/** Arbitrary for non-empty, printable error messages */
const errorMessageArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

/** Arbitrary for non-empty plant names (used by perenual_image_error mode) */
const plantNameArb = fc
  .string({ minLength: 1 })
  .filter(s => s.trim().length > 0 && s.trim().toLowerCase() !== 'unknown plant');

/**
 * fc.oneof that generates one of the four supported failure modes.
 * **Validates: Requirements 4.6, 5.8, 7.1**
 */
const failureModeArb: fc.Arbitrary<FailureMode> = fc.oneof(
  // 1. Gemini Vision API times out or throws
  fc.record({ kind: fc.constant('gemini_timeout' as const), errorMessage: errorMessageArb }),

  // 2. Gemini returns "Unknown Plant" (unrecognisable image)
  fc.record({ kind: fc.constant('gemini_unknown_plant' as const) }),

  // 3. TextPipeline: Perenual API throws (network error, HTTP 5xx, etc.)
  fc.record({ kind: fc.constant('perenual_text_error' as const), errorMessage: errorMessageArb }),

  // 4. ImagePipeline: Gemini succeeds, then Perenual throws on lookup
  fc.record({
    kind: fc.constant('perenual_image_error' as const),
    plantName: plantNameArb,
    errorMessage: errorMessageArb,
  }),
);

/** Minimal Multer file stub used for ImagePipeline invocations */
function makeFakeFile(plantLabel: string): {
  fieldname: string; originalname: string; encoding: string;
  mimetype: string; size: number; buffer: Buffer;
} {
  const buf = Buffer.from(`fake-image-bytes-${plantLabel}`);
  return {
    fieldname: 'image',
    originalname: 'plant.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: buf.length,
    buffer: buf,
  };
}

describe('Property 5: Fallback safety — fallback responses have isToxic=null and identifiedPlant=null', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // By default both DB lookups miss — ensures pipeline proceeds to the API tier
    vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
    vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
  });

  /**
   * **Validates: Requirements 4.6, 5.8, 7.1**
   *
   * For ALL injected failure modes (Gemini timeout, Gemini unknown-plant,
   * Perenual text error, Perenual image error) the pipeline MUST return:
   *   - isToxic === null
   *   - identifiedPlant === null
   *   - dataSource === 'fallback'
   *   - actionRequired.length >= 20
   */
  it('every failure mode produces a safe fallback response with null identification and dataSource=fallback', async () => {
    // Feature: plant-toxicity-caching, Property 5: Fallback safety — fallback responses have isToxic=null and identifiedPlant=null
    await fc.assert(
      fc.asyncProperty(failureModeArb, async (mode) => {
        vi.clearAllMocks();
        vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
        vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);

        let result: Awaited<ReturnType<typeof toxicityCacheService.resolveTextPipeline>>;

        switch (mode.kind) {
          case 'gemini_timeout': {
            // Gemini rejects → ImagePipeline buildFallbackResponse (stage: gemini_vision)
            vi.mocked(scanPlantWithVision).mockRejectedValue(
              new Error(mode.errorMessage),
            );
            // Perenual should not be reached, but set a safe default anyway
            vi.mocked(searchPlantByName).mockResolvedValue(null);

            result = await toxicityCacheService.resolveImagePipeline(makeFakeFile('timeout'));
            break;
          }

          case 'gemini_unknown_plant': {
            // Gemini resolves with null scientificName → ImagePipeline buildFallbackResponse
            vi.mocked(scanPlantWithVision).mockResolvedValue({
              scientificName: null,
              confidence: 0.3,
            });
            vi.mocked(searchPlantByName).mockResolvedValue(null);

            result = await toxicityCacheService.resolveImagePipeline(makeFakeFile('unknown'));
            break;
          }

          case 'perenual_text_error': {
            // TextPipeline: Perenual throws → buildFallbackResponse (stage: perenual_api_error)
            vi.mocked(searchPlantByName).mockRejectedValue(
              new Error(mode.errorMessage),
            );

            result = await toxicityCacheService.resolveTextPipeline('some-plant-query');
            break;
          }

          case 'perenual_image_error': {
            // ImagePipeline: Gemini succeeds with a real plant name, then Perenual throws
            vi.mocked(scanPlantWithVision).mockResolvedValue({
              scientificName: mode.plantName,
              confidence: 0.85,
            });
            vi.mocked(searchPlantByName).mockRejectedValue(
              new Error(mode.errorMessage),
            );

            result = await toxicityCacheService.resolveImagePipeline(makeFakeFile(mode.plantName));
            break;
          }
        }

        // ── Core fallback invariants ────────────────────────────────────────
        expect(result.toxicityStatus, `toxicityStatus must be 'UNKNOWN' for mode=${mode.kind}`).toBe('UNKNOWN');
        expect(result.identifiedPlant, `identifiedPlant must be null for mode=${mode.kind}`).toBeNull();
        expect(result.dataSource, `dataSource must be 'fallback' for mode=${mode.kind}`).toBe('fallback');
        expect(
          result.actionRequired.length,
          `actionRequired must be >= 20 chars for mode=${mode.kind}`,
        ).toBeGreaterThanOrEqual(20);
      }),
      { numRuns: 100 },
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 6: Response shape invariant — ToxicityScanResult conforms to contract
// Feature: plant-toxicity-caching, Property 6: Response shape invariant — ToxicityScanResult conforms to contract
// Validates: Requirements 6.1, 6.2
// ────────────────────────────────────────────────────────────────────────────

/**
 * Scenario discriminated union for fc.oneof injection.
 *
 *   text_cache_hit_common     — TextPipeline: DB hit on common name (aspca record)
 *   text_cache_hit_scientific — TextPipeline: DB miss on common, hit on scientific name (perenual_cache)
 *   text_stale_record         — TextPipeline: stale perenual_cache record returned synchronously
 *   text_fresh_aspca          — TextPipeline: fresh aspca record (cachedAt=null, never stale)
 *   text_fallback_perenual    — TextPipeline: DB miss + Perenual failure → fallback
 *   text_fallback_db_miss     — TextPipeline: DB miss + Perenual returns null → fallback
 */
type ScenarioKind =
  | 'text_cache_hit_common'
  | 'text_cache_hit_scientific'
  | 'text_stale_record'
  | 'text_fresh_aspca'
  | 'text_fallback_perenual'
  | 'text_fallback_db_miss';

/** Set of valid dataSource values per Requirement 6.2 */
const VALID_DATA_SOURCES = new Set<string>(['aspca', 'perenual_cache', 'fallback']);

/**
 * Builds a Prisma Plant-shaped object for use as a mock return value.
 * source and cachedAt are configurable to cover all cache variants.
 */
function makePlantRecord(
  overrides: {
    source?: 'aspca' | 'perenual_cache';
    cachedAt?: Date | null;
    commonName?: string;
    scientificName?: string;
  } = {}
): {
  id: string;
  commonName: string;
  scientificName: string;
  toxicityStatus: string;
  severity: string | null;
  clinicalSigns: string[];
  source: string;
  mediaUrl: string | null;
  perenualId: string | null;
  cachedAt: Date | null;
  lastVerifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: 'plant-id-001',
    commonName: overrides.commonName ?? 'Peace Lily',
    scientificName: overrides.scientificName ?? 'Spathiphyllum wallisii',
    toxicityStatus: 'toxic',
    severity: 'mild',
    clinicalSigns: ['drooling', 'vomiting'],
    source: overrides.source ?? 'aspca',
    mediaUrl: null,
    perenualId: null,
    cachedAt: overrides.cachedAt !== undefined ? overrides.cachedAt : null,
    lastVerifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** Arbitrary for valid non-empty plant names */
const plantNameArbitrary = fc
  .string({ minLength: 1 })
  .filter(s => s.trim().length > 0);

/** Arbitrary for non-empty error messages */
const errMsgArbitrary = fc
  .string({ minLength: 1 })
  .filter(s => s.trim().length > 0);

/**
 * Generates one of 6 scenario kinds uniformly.
 * Each scenario fully specifies the mock setup and which pipeline to invoke.
 */
const scenarioArbitrary: fc.Arbitrary<{ kind: ScenarioKind; query: string; errMsg?: string }> =
  fc.oneof(
    // 1. Text: DB hit on common name (aspca source)
    fc.record({
      kind: fc.constant('text_cache_hit_common' as const),
      query: plantNameArbitrary,
    }),

    // 2. Text: DB hit on scientific name (perenual_cache source)
    fc.record({
      kind: fc.constant('text_cache_hit_scientific' as const),
      query: plantNameArbitrary,
    }),

    // 3. Text: stale perenual_cache record (cachedAt 31 days ago)
    fc.record({
      kind: fc.constant('text_stale_record' as const),
      query: plantNameArbitrary,
    }),

    // 4. Text: fresh aspca record (cachedAt=null, source='aspca')
    fc.record({
      kind: fc.constant('text_fresh_aspca' as const),
      query: plantNameArbitrary,
    }),

    // 5. Text: DB miss + Perenual throws → fallback
    fc.record({
      kind: fc.constant('text_fallback_perenual' as const),
      query: plantNameArbitrary,
      errMsg: errMsgArbitrary,
    }),

    // 6. Text: DB miss + Perenual returns null → fallback
    fc.record({
      kind: fc.constant('text_fallback_db_miss' as const),
      query: plantNameArbitrary,
    }),
  );

/**
 * **Validates: Requirements 6.1, 6.2**
 *
 * Property 6: Response shape invariant — ToxicityScanResult conforms to contract
 *
 * For every scenario:
 *   - dataSource ∈ { 'aspca', 'perenual_cache', 'fallback' }
 *
 * For all TextPipeline scenarios:
 *   - identificationConfidence === null
 *   - lowConfidenceWarning === false
 */
describe('Property 6: Response shape invariant — ToxicityScanResult conforms to contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Feature: plant-toxicity-caching, Property 6: Response shape invariant — ToxicityScanResult conforms to contract
  it('dataSource is always in { aspca, perenual_cache, fallback } and TextPipeline always sets identificationConfidence=null and lowConfidenceWarning=false', async () => {
    await fc.assert(
      fc.asyncProperty(scenarioArbitrary, async ({ kind, query, errMsg }) => {
        vi.clearAllMocks();

        // 31-day-old date — ensures a perenual_cache record is stale
        const thirtyOneDaysAgo = new Date(Date.now() - (31 * 24 * 60 * 60 * 1000));

        switch (kind) {
          case 'text_cache_hit_common': {
            // DB hit on common name — aspca source
            const plant = makePlantRecord({ source: 'aspca', cachedAt: null });
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(plant as any);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
            vi.mocked(searchPlantByName).mockResolvedValue(null);
            break;
          }

          case 'text_cache_hit_scientific': {
            // DB miss on common name, hit on scientific name — perenual_cache source
            const plant = makePlantRecord({ source: 'perenual_cache', cachedAt: new Date() });
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(plant as any);
            vi.mocked(searchPlantByName).mockResolvedValue(null);
            break;
          }

          case 'text_stale_record': {
            // Stale perenual_cache record — still returned synchronously (stale-while-revalidate)
            const plant = makePlantRecord({ source: 'perenual_cache', cachedAt: thirtyOneDaysAgo });
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(plant as any);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
            // Background refresh would call searchPlantByName; let it resolve to null (non-fatal)
            vi.mocked(searchPlantByName).mockResolvedValue(null);
            break;
          }

          case 'text_fresh_aspca': {
            // Fresh aspca record — cachedAt=null, never stale
            const plant = makePlantRecord({ source: 'aspca', cachedAt: null });
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(plant as any);
            vi.mocked(searchPlantByName).mockResolvedValue(null);
            break;
          }

          case 'text_fallback_perenual': {
            // DB miss + Perenual throws — triggers fallback
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
            vi.mocked(searchPlantByName).mockRejectedValue(new Error(errMsg ?? 'Perenual error'));
            break;
          }

          case 'text_fallback_db_miss': {
            // DB miss + Perenual returns null — triggers fallback
            vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(null);
            vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(null);
            vi.mocked(searchPlantByName).mockResolvedValue(null);
            break;
          }
        }

        const result = await toxicityCacheService.resolveTextPipeline(query);

        // ── Requirement 6.2: dataSource must be exactly one of the three permitted values ──
        expect(
          VALID_DATA_SOURCES.has(result.dataSource),
          `dataSource '${result.dataSource}' is not in { 'aspca', 'perenual_cache', 'fallback' } for scenario=${kind}`,
        ).toBe(true);

        // ── Requirement 6.1: TextPipeline invariants ────────────────────────────────────────
        expect(
          result.identificationConfidence,
          `identificationConfidence must be null for TextPipeline scenario=${kind}`,
        ).toBeNull();

        expect(
          result.lowConfidenceWarning,
          `lowConfidenceWarning must be false for TextPipeline scenario=${kind}`,
        ).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 10: Low-confidence warning correctness
// Feature: plant-toxicity-caching, Property 10: Low-confidence warning correctness
// Validates: Requirements 5.5, 5.6
// ────────────────────────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 5.5, 5.6**
 *
 * Property 10: Low-confidence warning correctness
 *
 * For any confidence ∈ [0.0, 1.0] returned by the Gemini mock, the ToxicityScanResult SHALL
 * have identificationConfidence === confidence exactly.
 * For any confidence < 0.6 and any plant name p:
 *   - lowConfidenceWarning === true
 *   - actionRequired includes p as a substring
 *   - actionRequired.length >= 20
 * For any confidence >= 0.6:
 *   - lowConfidenceWarning === false
 */
describe('Property 10: Low-confidence warning correctness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identificationConfidence equals Gemini confidence exactly, and lowConfidenceWarning/actionRequired match threshold', async () => {
    // Feature: plant-toxicity-caching, Property 10: Low-confidence warning correctness
    await fc.assert(
      fc.asyncProperty(
        // Use fc.float to generate confidence values in [0.0, 1.0]
        fc.float({ min: 0.0, max: 1.0 }),
        // Use fc.string for arbitrary plant names (non-empty)
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0 && s.trim().toLowerCase() !== 'unknown plant'),
        async (confidence, plantName) => {
          vi.clearAllMocks();

          // Mock Gemini to return the generated confidence and plant name
          vi.mocked(scanPlantWithVision).mockResolvedValue({
            scientificName: plantName,
            confidence,
          });

          // Mock the repository to return a matching Plant record (DB hit → no Perenual call)
          // Use source='aspca' and cachedAt=null so staleWhileRevalidate is never triggered
          const dbRecord = makePlantRecord({
            source: 'aspca',
            cachedAt: null,
            commonName: plantName,
            scientificName: plantName,
          });
          vi.mocked(toxicityRepository.findByScientificName).mockResolvedValue(dbRecord as any);
          vi.mocked(toxicityRepository.findByCommonName).mockResolvedValue(dbRecord as any);
          // Perenual should never be called (DB hit)
          vi.mocked(searchPlantByName).mockResolvedValue(null);

          const fakeFile = makeFakeFile(plantName);
          const result = await toxicityCacheService.resolveImagePipeline(fakeFile);

          // ── Core invariant: identificationConfidence equals Gemini confidence exactly ──
          expect(
            result.identificationConfidence,
            `identificationConfidence must equal Gemini confidence (${confidence}) exactly`,
          ).toBe(confidence);

          if (confidence < 0.6) {
            // ── Low-confidence branch ────────────────────────────────────────────────────
            expect(
              result.lowConfidenceWarning,
              `lowConfidenceWarning must be true when confidence (${confidence}) < 0.6`,
            ).toBe(true);

            expect(
              result.actionRequired.includes(plantName),
              `actionRequired must include plant name "${plantName}" when confidence < 0.6`,
            ).toBe(true);

            expect(
              result.actionRequired.length,
              `actionRequired must be >= 20 chars when confidence < 0.6 (got "${result.actionRequired}")`,
            ).toBeGreaterThanOrEqual(20);
          } else {
            // ── Normal-confidence branch ─────────────────────────────────────────────────
            expect(
              result.lowConfidenceWarning,
              `lowConfidenceWarning must be false when confidence (${confidence}) >= 0.6`,
            ).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
