// Feature: diet-optimizer (RER nutrition engine + 3-tier AI failover)
//
// Coverage goals for this suite:
//  - Property-based invariants over the deterministic RER fallback math
//    (positivity, integrality, activity-level monotonicity, macro-split closure).
//  - Aggressive edge probing of the weight/activity/health-condition input space.
//  - Full branch coverage of the Groq -> Gemini -> heuristic failover chain,
//    including intentional dependency breakage (throws, nulls, malformed JSON).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import type { DietOptimizeRequest, DietPlan } from '../../types/shared.js';

// ── Mock the AI clients so we can drive every failover branch deterministically ──
vi.mock('../../repositories/groq.repository.js', () => ({
  groqClient: { isAvailable: true, generateText: vi.fn() },
}));
vi.mock('../../repositories/gemini.repository.js', () => ({
  geminiClient: { isAvailable: true, generateText: vi.fn() },
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { dietOptimizationService } from '../diet-optimization.service.js';
import { groqClient } from '../../repositories/groq.repository.js';
import { geminiClient } from '../../repositories/gemini.repository.js';

const groq = groqClient as unknown as { isAvailable: boolean; generateText: ReturnType<typeof vi.fn> };
const gemini = geminiClient as unknown as { isAvailable: boolean; generateText: ReturnType<typeof vi.fn> };

const baseReq = (over: Partial<DietOptimizeRequest> = {}): DietOptimizeRequest => ({
  weightKg: 4.5,
  ageYears: 3,
  activityLevel: 'moderate',
  healthConditions: [],
  ...over,
});

/** Reference implementation of the documented RER formula for cross-checking. */
const expectedCalories = (weightKg: number, activity: DietOptimizeRequest['activityLevel']): number => {
  const rer = 70 * Math.pow(weightKg, 0.75);
  const factor = activity === 'sedentary' ? 1.0 : activity === 'active' ? 1.4 : 1.2;
  return Math.round(rer * factor);
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default both providers to unavailable so tests target the heuristic unless
  // a test explicitly opts a provider in. This isolates the fallback math.
  groq.isAvailable = false;
  gemini.isAvailable = false;
});

// ───────────────────────────────────────────────────────────────────────────
// Deterministic RER fallback — invariants (property-based)
// ───────────────────────────────────────────────────────────────────────────
describe('DietOptimizationService — RER heuristic fallback invariants', () => {
  const activities: DietOptimizeRequest['activityLevel'][] = ['sedentary', 'moderate', 'active'];

  it('Property: dailyCalories is always a positive integer for any positive weight', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 15, noNaN: true }),
        fc.constantFrom(...activities),
        async (weightKg, activityLevel) => {
          const plan = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel }));
          expect(Number.isInteger(plan.dailyCalories)).toBe(true);
          expect(plan.dailyCalories).toBeGreaterThan(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: dailyCalories exactly matches the documented RER × activity-factor formula', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.5, max: 12, noNaN: true }),
        fc.constantFrom(...activities),
        async (weightKg, activityLevel) => {
          const plan = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel }));
          expect(plan.dailyCalories).toBe(expectedCalories(weightKg, activityLevel));
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: calories are monotonic in weight for a fixed activity level', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.5, max: 8, noNaN: true }),
        fc.double({ min: 0.01, max: 4, noNaN: true }),
        fc.constantFrom(...activities),
        async (weightKg, delta, activityLevel) => {
          const lighter = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel }));
          const heavier = await dietOptimizationService.optimize(
            baseReq({ weightKg: weightKg + delta, activityLevel })
          );
          expect(heavier.dailyCalories).toBeGreaterThanOrEqual(lighter.dailyCalories);
        }
      ),
      { numRuns: 150 }
    );
  });

  it('Property: active >= moderate >= sedentary calories at identical weight', async () => {
    await fc.assert(
      fc.asyncProperty(fc.double({ min: 0.5, max: 12, noNaN: true }), async (weightKg) => {
        const sed = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel: 'sedentary' }));
        const mod = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel: 'moderate' }));
        const act = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel: 'active' }));
        expect(mod.dailyCalories).toBeGreaterThanOrEqual(sed.dailyCalories);
        expect(act.dailyCalories).toBeGreaterThanOrEqual(mod.dailyCalories);
      }),
      { numRuns: 150 }
    );
  });

  it('Property: macronutrient split is well-formed and sums to exactly 100%', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 15, noNaN: true }),
        fc.constantFrom(...activities),
        async (weightKg, activityLevel) => {
          const { macronutrientSplit: m } = await dietOptimizationService.optimize(
            baseReq({ weightKg, activityLevel })
          );
          expect(m.proteinPercent + m.fatPercent + m.carbsPercent).toBe(100);
          for (const v of [m.proteinPercent, m.fatPercent, m.carbsPercent]) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: a complete, non-empty plan is always returned', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.1, max: 15, noNaN: true }),
        fc.constantFrom(...activities),
        async (weightKg, activityLevel) => {
          const plan = await dietOptimizationService.optimize(baseReq({ weightKg, activityLevel }));
          expect(plan.recommendedFoods.length).toBeGreaterThan(0);
          expect(plan.avoidFoods.length).toBeGreaterThan(0);
          expect(plan.feedingSchedule.length).toBeGreaterThan(0);
          expect(plan.dietRationale.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Edge probing of the input domain
// ───────────────────────────────────────────────────────────────────────────
describe('DietOptimizationService — edge probing', () => {
  it('uses activity factor 1.2 for an unrecognized activity level (default branch)', async () => {
    const plan = await dietOptimizationService.optimize(
      // deliberately out-of-enum value to exercise the untyped default branch
      baseReq({ weightKg: 4, activityLevel: 'hyperactive' as unknown as DietOptimizeRequest['activityLevel'] })
    );
    expect(plan.dailyCalories).toBe(Math.round(70 * Math.pow(4, 0.75) * 1.2));
  });

  it('handles a near-zero weight without producing NaN/negative calories', async () => {
    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 0.01 }));
    expect(Number.isFinite(plan.dailyCalories)).toBe(true);
    expect(plan.dailyCalories).toBeGreaterThanOrEqual(0);
  });

  it('weight of exactly 0 yields 0 calories (RER of 0), not NaN', async () => {
    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 0 }));
    expect(plan.dailyCalories).toBe(0);
  });

  it('augments avoid list and rationale for renal conditions (case-insensitive match)', async () => {
    for (const condition of ['renal disease', 'Renal Failure', 'CHRONIC RENAL']) {
      const plan = await dietOptimizationService.optimize(
        baseReq({ healthConditions: [condition] })
      );
      expect(plan.avoidFoods).toContain('High phosphorus foods');
      expect(plan.avoidFoods).toContain('Dry kibble without supplemental water');
      expect(plan.dietRationale.toLowerCase()).toContain('renal');
    }
  });

  it('does NOT add renal adjustments for non-renal conditions', async () => {
    const plan = await dietOptimizationService.optimize(
      baseReq({ healthConditions: ['obesity', 'diabetes'] })
    );
    expect(plan.avoidFoods).not.toContain('High phosphorus foods');
    expect(plan.dietRationale.toLowerCase()).not.toContain('renal');
  });

  it('always keeps the baseline toxic-food avoid entries', async () => {
    const plan = await dietOptimizationService.optimize(baseReq({ healthConditions: [] }));
    for (const toxic of ['Chocolate', 'Onions/Garlic', 'Grapes/Raisins']) {
      expect(plan.avoidFoods).toContain(toxic);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Failover chain — failure handling (break each dependency intentionally)
// ───────────────────────────────────────────────────────────────────────────
describe('DietOptimizationService — Groq→Gemini→heuristic failover', () => {
  const goodGroqPlan: DietPlan = {
    dailyCalories: 999,
    macronutrientSplit: { proteinPercent: 50, fatPercent: 30, carbsPercent: 20 },
    recommendedFoods: ['groq-food'],
    avoidFoods: ['groq-avoid'],
    feedingSchedule: 'groq-schedule',
    dietRationale: 'groq-rationale',
  };
  const goodGeminiPlan: DietPlan = { ...goodGroqPlan, dailyCalories: 777, recommendedFoods: ['gemini-food'] };

  it('Tier 1: returns the Groq plan when Groq succeeds (Gemini never called)', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockResolvedValueOnce(JSON.stringify(goodGroqPlan));

    const plan = await dietOptimizationService.optimize(baseReq());

    expect(plan.dailyCalories).toBe(999);
    expect(groq.generateText).toHaveBeenCalledTimes(1);
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it('Tier 2: falls back to Gemini when Groq throws', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockRejectedValueOnce(new Error('Groq 503 timeout'));
    gemini.generateText.mockResolvedValueOnce(JSON.stringify(goodGeminiPlan));

    const plan = await dietOptimizationService.optimize(baseReq());

    expect(plan.recommendedFoods).toEqual(['gemini-food']);
    expect(gemini.generateText).toHaveBeenCalledTimes(1);
  });

  it('Tier 2: falls back to Gemini when Groq returns null (no content)', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockResolvedValueOnce(null);
    gemini.generateText.mockResolvedValueOnce(JSON.stringify(goodGeminiPlan));

    const plan = await dietOptimizationService.optimize(baseReq());
    expect(plan.dailyCalories).toBe(777);
  });

  it('Tier 2: falls back to Gemini when Groq returns malformed JSON', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockResolvedValueOnce('{ not-valid-json ');
    gemini.generateText.mockResolvedValueOnce(JSON.stringify(goodGeminiPlan));

    const plan = await dietOptimizationService.optimize(baseReq());
    expect(plan.dailyCalories).toBe(777);
  });

  it('Tier 3: falls back to deterministic RER heuristic when BOTH providers throw', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockRejectedValueOnce(new Error('groq down'));
    gemini.generateText.mockRejectedValueOnce(new Error('gemini down'));

    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 5, activityLevel: 'active' }));
    expect(plan.dailyCalories).toBe(expectedCalories(5, 'active'));
    expect(plan.dietRationale).toContain('RER');
  });

  it('Tier 3: falls back to heuristic when Gemini returns empty string', async () => {
    groq.isAvailable = false;
    gemini.isAvailable = true;
    gemini.generateText.mockResolvedValueOnce('');

    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 5, activityLevel: 'active' }));
    expect(plan.dailyCalories).toBe(expectedCalories(5, 'active'));
  });

  it('Tier 3: falls back to heuristic when Gemini returns malformed JSON', async () => {
    groq.isAvailable = false;
    gemini.isAvailable = true;
    gemini.generateText.mockResolvedValueOnce('<<garbage>>');

    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 5, activityLevel: 'active' }));
    expect(plan.dailyCalories).toBe(expectedCalories(5, 'active'));
  });

  it('skips both AI tiers entirely when neither provider is available', async () => {
    groq.isAvailable = false;
    gemini.isAvailable = false;

    const plan = await dietOptimizationService.optimize(baseReq({ weightKg: 3.2, activityLevel: 'sedentary' }));

    expect(groq.generateText).not.toHaveBeenCalled();
    expect(gemini.generateText).not.toHaveBeenCalled();
    expect(plan.dailyCalories).toBe(expectedCalories(3.2, 'sedentary'));
  });
});
