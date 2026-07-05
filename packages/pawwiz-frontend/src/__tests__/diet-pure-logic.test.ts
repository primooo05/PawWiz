// Feature: diet-recommender — pure calculation helpers
//
// getAgeBracketInfo and calculateMealCalories are exported pure functions used
// by the diet dashboard UI. They have deterministic, math-based outputs that
// must remain correct across all edge values and life-stage transitions.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getAgeBracketInfo, calculateMealCalories } from '../hooks/features/useDietRecommender';

// ───────────────────────────────────────────────────────────────────────────
// calculateMealCalories — catalog-backed, unit-aware calorie math
//   kcal = grams(food, amount, unit) × caloric density, rounded.
// ───────────────────────────────────────────────────────────────────────────
describe('calculateMealCalories', () => {
  it('grams: kcal = grams × density (dry 3.9, wet 1.0, chicken 1.65)', () => {
    expect(calculateMealCalories('dry', 100, 'gram')).toBe(390);
    expect(calculateMealCalories('wet', 100, 'gram')).toBe(100);
    expect(calculateMealCalories('chicken', 100, 'gram')).toBe(165);
  });

  it('spoon: converts spoons → grams before applying density', () => {
    // dry: 1 tbsp ≈ 6 g × 3.9 = 23.4 → 23
    expect(calculateMealCalories('dry', 1, 'spoon')).toBe(23);
    // wet: 1 tbsp ≈ 15 g × 1.0 = 15
    expect(calculateMealCalories('wet', 1, 'spoon')).toBe(15);
  });

  it('zero / non-positive amount returns 0', () => {
    expect(calculateMealCalories('dry', 0, 'gram')).toBe(0);
    expect(calculateMealCalories('chicken', 0, 'spoon')).toBe(0);
  });

  it('Property: calories are non-negative and finite for any input', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dry' as const, 'wet' as const, 'mixed' as const, 'chicken' as const),
        fc.constantFrom('spoon' as const, 'gram' as const, 'cup' as const),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (foodType, unit, amount) => {
          const cal = calculateMealCalories(foodType, amount, unit);
          expect(cal).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(cal)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: per-gram density ordering dry >= mixed >= wet', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), (grams) => {
        const dry = calculateMealCalories('dry', grams, 'gram');
        const mixed = calculateMealCalories('mixed', grams, 'gram');
        const wet = calculateMealCalories('wet', grams, 'gram');
        expect(dry).toBeGreaterThanOrEqual(mixed);
        expect(mixed).toBeGreaterThanOrEqual(wet);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: monotonic in amount for a fixed food + unit', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dry' as const, 'wet' as const, 'chicken' as const),
        fc.constantFrom('spoon' as const, 'gram' as const, 'cup' as const),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (foodType, unit, a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          expect(calculateMealCalories(foodType, hi, unit)).toBeGreaterThanOrEqual(
            calculateMealCalories(foodType, lo, unit)
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: output is always an integer (Math.round applied)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dry' as const, 'wet' as const, 'mixed' as const),
        fc.constantFrom('spoon' as const, 'gram' as const, 'cup' as const),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (foodType, unit, amount) => {
          const cal = calculateMealCalories(foodType, amount, unit);
          expect(Number.isInteger(cal)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// getAgeBracketInfo — life-stage transitions + boundary probing
// ───────────────────────────────────────────────────────────────────────────
describe('getAgeBracketInfo', () => {
  it('kitten ≤1 month: formula/KMR bracket', () => {
    const r = getAgeBracketInfo('kitten', 0.5);
    expect(r.bracket).toContain('0 – 4 weeks');
    expect(r.recommendedFood).toMatch(/milk/i);
  });

  it('kitten 1–1.5 months: KMR + slurry bracket', () => {
    const r = getAgeBracketInfo('kitten', 1.2);
    expect(r.bracket).toContain('4 – 6 weeks');
  });

  it('kitten 1.5–2 months: weaning bracket', () => {
    const r = getAgeBracketInfo('kitten', 1.8);
    expect(r.bracket).toContain('6 – 8 weeks');
  });

  it('kitten 2–6 months: kitten kibble bracket', () => {
    const r = getAgeBracketInfo('kitten', 4);
    expect(r.bracket).toContain('2 – 6 months');
  });

  it('kitten >6 months: older kitten bracket', () => {
    const r = getAgeBracketInfo('kitten', 9);
    expect(r.bracket).toContain('6 – 12 months');
  });

  it('adult: uses age in bracket label', () => {
    const r = getAgeBracketInfo('adult', 3);
    expect(r.bracket).toContain('3 years old');
    expect(r.frequency).toMatch(/2 times/i);
  });

  it('adult age=1: singular "year"', () => {
    const r = getAgeBracketInfo('adult', 1);
    expect(r.bracket).toContain('1 year old');
    expect(r.bracket).not.toContain('years');
  });

  it('senior: uses senior food recommendation', () => {
    const r = getAgeBracketInfo('senior', 12);
    expect(r.bracket).toContain('Senior');
    expect(r.recommendedFood).toMatch(/senior/i);
  });

  it('Property: always returns all 4 non-empty fields regardless of inputs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('kitten' as const, 'adult' as const, 'senior' as const),
        fc.double({ min: 0, max: 25, noNaN: true }),
        (lifeStage, age) => {
          const r = getAgeBracketInfo(lifeStage, age);
          expect(r.bracket.length).toBeGreaterThan(0);
          expect(r.recommendedFood.length).toBeGreaterThan(0);
          expect(r.frequency.length).toBeGreaterThan(0);
          expect(r.portionGuide.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 150 }
    );
  });

  // Boundary probing — exact transition values
  it('boundary: kitten age=1 (exactly) → 0–4 weeks bracket', () => {
    const r = getAgeBracketInfo('kitten', 1);
    expect(r.bracket).toContain('0 – 4 weeks');
  });

  it('boundary: kitten age=1.5 (exactly) → 4–6 weeks bracket', () => {
    const r = getAgeBracketInfo('kitten', 1.5);
    expect(r.bracket).toContain('4 – 6 weeks');
  });

  it('boundary: kitten age=2 (exactly) → 6–8 weeks bracket', () => {
    const r = getAgeBracketInfo('kitten', 2);
    expect(r.bracket).toContain('6 – 8 weeks');
  });

  it('boundary: kitten age=6 (exactly) → 2–6 months bracket', () => {
    const r = getAgeBracketInfo('kitten', 6);
    expect(r.bracket).toContain('2 – 6 months');
  });

  it('boundary: kitten age=6.01 → 6–12 months bracket', () => {
    const r = getAgeBracketInfo('kitten', 6.01);
    expect(r.bracket).toContain('6 – 12 months');
  });
});
