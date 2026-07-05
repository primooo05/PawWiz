/**
 * Feline gestation math — shared by PregnancySessionService and PregnancyLogService.
 *
 * A queen's gestation runs ~63–67 days; we use 65 as the canonical figure
 * (matching the frontend tracker). Week is 1-indexed and clamped to the
 * biologically meaningful 1..10 range so a stale or manipulated date can never
 * push pattern detection into nonsensical week values.
 */

export const GESTATION_DAYS = 65;
export const MAX_GESTATION_WEEK = 10;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days elapsed between two instants (floored, never negative). */
export function daysBetween(from: Date, to: Date): number {
  const diff = Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
  return diff < 0 ? 0 : diff;
}

/**
 * Compute the 1-indexed gestation week for a log taken on `logDate` given the
 * `matingDate`. Clamped to [1, MAX_GESTATION_WEEK].
 */
export function computeGestationWeek(matingDate: Date, logDate: Date): number {
  const days = daysBetween(matingDate, logDate);
  const week = Math.ceil(days / 7) || 1;
  return Math.min(MAX_GESTATION_WEEK, Math.max(1, week));
}

/** Expected delivery date = matingDate + GESTATION_DAYS. */
export function computeExpectedDelivery(matingDate: Date): Date {
  return new Date(matingDate.getTime() + GESTATION_DAYS * MS_PER_DAY);
}

/** Whole days remaining until expected delivery (never negative). */
export function daysRemaining(expectedDeliveryDate: Date, now: Date): number {
  return daysBetween(now, expectedDeliveryDate);
}

/**
 * Human-readable phase label for a gestation week. Aligned to the milestones
 * the UI surfaces (nipple pinking, fetal swell, nesting search, labor prep).
 */
export function phaseForWeek(week: number): string {
  if (week <= 2) return 'Fertilization';
  if (week <= 4) return 'Implantation';
  if (week <= 6) return 'Fetal Swell';
  if (week <= 8) return 'Nesting Search';
  return 'Labor Prep';
}
