/**
 * Flo-style chip display metadata.
 *
 * The chip KEYS are the single source of truth on the backend
 * (SYMPTOM_CHIPS / MOOD_CHIPS / APPETITE_LEVELS / ENERGY_LEVELS in
 * pawwiz-backend/src/types/shared.ts). Here we only attach display labels +
 * prominence rules. Typing each map as `Record<SymptomChip, …>` etc. makes the
 * compiler reject this file the moment a chip is added or removed on the
 * backend, so the two sides can never silently drift apart.
 */

import type {
  SymptomChip,
  MoodChip,
  AppetiteLevel,
  EnergyLevel,
} from '../../../../../pawwiz-backend/src/types/shared.js';

export interface ChipMeta {
  label: string;
  /** Gestation-week range in which this chip is surfaced prominently (inclusive). */
  prominentWeeks?: [number, number];
}

export const SYMPTOM_META: Record<SymptomChip, ChipMeta> = {
  appetite_loss: { label: 'Appetite loss' },
  appetite_increase: { label: 'Appetite up' },
  vomiting: { label: 'Vomiting' },
  discharge: { label: 'Discharge' },
  panting: { label: 'Panting' },
  restless: { label: 'Restless' },
  lethargy: { label: 'Lethargy' },
  contractions: { label: 'Contractions', prominentWeeks: [9, 10] },
  nesting: { label: 'Nesting', prominentWeeks: [7, 9] },
  nipple_swelling: { label: 'Nipple swelling', prominentWeeks: [3, 4] },
  weight_gain: { label: 'Weight gain' },
};

export const MOOD_META: Record<MoodChip, ChipMeta> = {
  affectionate: { label: 'Affectionate' },
  hiding: { label: 'Hiding' },
  vocal: { label: 'Vocal' },
  aggressive: { label: 'Aggressive' },
  calm: { label: 'Calm' },
  anxious: { label: 'Anxious' },
  grooming_more: { label: 'Grooming more' },
  grooming_less: { label: 'Grooming less' },
  seeking_solitude: { label: 'Seeking solitude', prominentWeeks: [7, 9] },
};

export const APPETITE_META: Record<AppetiteLevel, string> = {
  normal: 'Normal',
  increased: 'Increased',
  reduced: 'Reduced',
  none: 'None',
};

export const ENERGY_META: Record<EnergyLevel, string> = {
  normal: 'Normal',
  high: 'High',
  low: 'Low',
  very_low: 'Very low',
};

export const SYMPTOM_KEYS = Object.keys(SYMPTOM_META) as SymptomChip[];
export const MOOD_KEYS = Object.keys(MOOD_META) as MoodChip[];
export const APPETITE_KEYS = Object.keys(APPETITE_META) as AppetiteLevel[];
export const ENERGY_KEYS = Object.keys(ENERGY_META) as EnergyLevel[];

/** Whether a chip should be visually promoted for the given gestation week. */
export function isProminent(meta: ChipMeta, week: number): boolean {
  if (!meta.prominentWeeks) return false;
  const [lo, hi] = meta.prominentWeeks;
  return week >= lo && week <= hi;
}
