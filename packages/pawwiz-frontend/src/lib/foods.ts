/**
 * Feline food catalog + calorie math.
 *
 * Each food carries a real-ish caloric density (kcal per gram) plus how many
 * grams a household "spoon" (tablespoon) and "cup" of it weigh — because a
 * spoon of dry kibble and a spoon of wet food are very different masses.
 *
 * All calorie math funnels through calculateKcal() so the Diet Recommender and
 * the Quick Log bar always agree.
 */

export type FoodType =
  | 'dry'
  | 'wet'
  | 'mixed'
  | 'chicken'
  | 'chicken_thigh'
  | 'fish'
  | 'egg'
  | 'other';

export type MealUnit = 'spoon' | 'gram' | 'cup';

export interface FoodInfo {
  id: FoodType;
  label: string;
  kcalPerGram: number;
  gramsPerSpoon: number; // 1 level tablespoon
  gramsPerCup: number; // 1 standard 240ml cup
  typicalGrams: number; // sensible single-meal portion (for the "typical" quick-fill)
}

// Approximate values drawn from common pet-nutrition references. Density is the
// figure that matters most for accuracy; per-spoon/cup masses are practical
// household estimates.
export const FOOD_CATALOG: Record<FoodType, FoodInfo> = {
  dry:           { id: 'dry',           label: 'Dry Kibble',      kcalPerGram: 3.9,  gramsPerSpoon: 6,  gramsPerCup: 120, typicalGrams: 20 },
  wet:           { id: 'wet',           label: 'Wet Food',        kcalPerGram: 1.0,  gramsPerSpoon: 15, gramsPerCup: 240, typicalGrams: 60 },
  mixed:         { id: 'mixed',         label: 'Mixed (Dry+Wet)', kcalPerGram: 2.45, gramsPerSpoon: 10, gramsPerCup: 180, typicalGrams: 40 },
  chicken:       { id: 'chicken',       label: 'Chicken Breast',  kcalPerGram: 1.65, gramsPerSpoon: 15, gramsPerCup: 140, typicalGrams: 30 },
  chicken_thigh: { id: 'chicken_thigh', label: 'Chicken Thigh',   kcalPerGram: 2.1,  gramsPerSpoon: 15, gramsPerCup: 140, typicalGrams: 30 },
  fish:          { id: 'fish',          label: 'Fish / Salmon',   kcalPerGram: 2.0,  gramsPerSpoon: 15, gramsPerCup: 145, typicalGrams: 30 },
  egg:           { id: 'egg',           label: 'Cooked Egg',      kcalPerGram: 1.55, gramsPerSpoon: 15, gramsPerCup: 140, typicalGrams: 25 },
  // "Other" — a food not in the catalog. Its calories come from a user-entered
  // label value (kcal per 100 g), so the catalog density here is only a
  // last-resort fallback and is never used when a custom value is supplied.
  other:         { id: 'other',         label: 'Other / Custom',  kcalPerGram: 2.0,  gramsPerSpoon: 12, gramsPerCup: 150, typicalGrams: 30 },
};

// Safe fallback for unexpected/legacy foodType strings coming from the DB.
const FALLBACK_FOOD: FoodInfo = {
  id: 'dry',
  label: 'Food',
  kcalPerGram: 2.0,
  gramsPerSpoon: 10,
  gramsPerCup: 150,
  typicalGrams: 30,
};

/** Turn a raw foodType string into a human label ("home_cooked" → "Home Cooked"). */
export const prettifyFoodLabel = (raw: string): string =>
  raw.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Resolve a stored foodType to its FoodInfo. Known catalog ids return their
 * entry; any other non-empty string (a user's custom food name) returns a
 * synthetic entry whose label echoes that name, so custom foods still display
 * nicely in the tracker and activity feed.
 */
export const getFood = (foodType: string | null | undefined): FoodInfo => {
  if (foodType && FOOD_CATALOG[foodType as FoodType]) return FOOD_CATALOG[foodType as FoodType];
  if (foodType && foodType.trim()) return { ...FALLBACK_FOOD, label: prettifyFoodLabel(foodType) };
  return FALLBACK_FOOD;
};

/** kcal for a custom food measured in grams, from its label energy (kcal per 100 g). */
export const calculateCustomKcal = (grams: number, kcalPer100g: number): number => {
  if (!(grams > 0) || !(kcalPer100g > 0)) return 0;
  return Math.round((grams / 100) * kcalPer100g);
};

/** Ordered options for the food selector. */
export const FOOD_OPTIONS: FoodInfo[] = [
  FOOD_CATALOG.dry,
  FOOD_CATALOG.wet,
  FOOD_CATALOG.mixed,
  FOOD_CATALOG.chicken,
  FOOD_CATALOG.chicken_thigh,
  FOOD_CATALOG.fish,
  FOOD_CATALOG.egg,
];

export interface UnitConfig {
  id: MealUnit;
  label: string;
  short: string;
  min: number;
  max: number;
  step: number;
}

/** Selectable measurement units with sensible slider ranges per unit. */
export const UNIT_OPTIONS: UnitConfig[] = [
  { id: 'spoon', label: 'Spoon', short: 'spoon', min: 0.25, max: 12, step: 0.25 },
  { id: 'gram', label: 'Grams', short: 'g', min: 5, max: 500, step: 5 },
  { id: 'cup', label: 'Cup', short: 'cup', min: 0.25, max: 4, step: 0.25 },
];

export const getUnitConfig = (unit: MealUnit): UnitConfig =>
  UNIT_OPTIONS.find((u) => u.id === unit) ?? UNIT_OPTIONS[0];

/** Grams represented by one of the given unit for a given food. */
export const gramsPerUnit = (foodType: FoodType, unit: MealUnit): number => {
  if (unit === 'gram') return 1;
  const food = getFood(foodType);
  return unit === 'cup' ? food.gramsPerCup : food.gramsPerSpoon;
};

/** Total grams for an amount + unit of a food. */
export const gramsFor = (foodType: FoodType, amount: number, unit: MealUnit): number =>
  amount * gramsPerUnit(foodType, unit);

/**
 * Calories for a meal. Central calorie function used everywhere.
 * kcal = grams × caloric density, rounded to a whole number.
 */
export const calculateKcal = (
  foodType: FoodType,
  amount: number,
  unit: MealUnit = 'spoon'
): number => {
  if (!(amount > 0)) return 0;
  return Math.round(gramsFor(foodType, amount, unit) * getFood(foodType).kcalPerGram);
};

/**
 * Convert an amount from one unit to another for the same food, keeping the
 * underlying grams (and therefore calories) roughly constant. Used when the
 * user switches units mid-entry so the portion doesn't reset.
 */
export const convertUnitAmount = (
  foodType: FoodType,
  amount: number,
  fromUnit: MealUnit,
  toUnit: MealUnit
): number => {
  if (fromUnit === toUnit) return amount;
  const grams = gramsFor(foodType, amount, fromUnit);
  const raw = grams / gramsPerUnit(foodType, toUnit);
  const { min, max, step } = getUnitConfig(toUnit);
  const snapped = Math.round(raw / step) * step;
  return Math.min(max, Math.max(min, snapped));
};

/** Grams for a food's typical single-meal portion, expressed in the chosen unit. */
export const typicalAmountInUnit = (foodType: FoodType, unit: MealUnit): number => {
  const grams = getFood(foodType).typicalGrams;
  const raw = grams / gramsPerUnit(foodType, unit);
  const { min, max, step } = getUnitConfig(unit);
  const snapped = Math.round(raw / step) * step;
  return Math.min(max, Math.max(min, snapped));
};

/** Human label for an amount + unit, e.g. "2 spoons", "300 g", "1 cup". */
export const formatAmountUnit = (amount: number, unit: MealUnit): string => {
  const cfg = getUnitConfig(unit);
  if (unit === 'gram') return `${amount} g`;
  return `${amount} ${cfg.short}${amount === 1 ? '' : 's'}`;
};
