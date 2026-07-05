/**
 * Meal-time helpers shared by the Diet Recommender and the Quick Log bar.
 *
 * Each meal has a sensible default feed time (and an allowed range) so a user
 * logging "Dinner" is never pre-filled with a morning time. Kept in its own
 * module so it can be imported without pulling in the modal component.
 */

export type MealName = 'Breakfast' | 'Lunch' | 'Dinner';

export const MEAL_TIME_DEFAULTS: Record<
  MealName,
  { default: string; min: string; max: string }
> = {
  Breakfast: { default: '07:30', min: '05:00', max: '11:00' },
  Lunch: { default: '12:00', min: '10:00', max: '15:00' },
  Dinner: { default: '18:30', min: '15:00', max: '23:59' },
};

/**
 * Returns the best-guess 24h "HH:MM" timestamp for a meal:
 * - If a real saved 12h timestamp (e.g. "8:30am") exists, parse and return it.
 * - Otherwise return the canonical default for that meal name, falling back to
 *   the current time for custom periods (e.g. "Midnight Snack") that aren't
 *   one of the 3 standard slots.
 */
export const defaultTimeForMeal = (mealName: string, savedTimestamp?: string): string => {
  if (savedTimestamp) {
    const match = savedTimestamp.match(/(\d+):(\d+)(am|pm)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${m}`;
    }
  }
  if (mealName in MEAL_TIME_DEFAULTS) {
    return MEAL_TIME_DEFAULTS[mealName as MealName].default;
  }
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};
