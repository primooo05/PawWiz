import { z } from 'zod';
import {
  SYMPTOM_CHIPS,
  MOOD_CHIPS,
  APPETITE_LEVELS,
  ENERGY_LEVELS,
} from '../types/shared.js';

/**
 * Start a pregnancy session. `matingDate` is bounded: it cannot be in the
 * future, nor absurdly far in the past (a full gestation is ~65 days, so a
 * mating date older than ~120 days almost certainly means the session should
 * already have been completed — reject it as an input error).
 */
export const startSessionSchema = z.object({
  catId: z.string().cuid(),
  matingDate: z.coerce
    .date()
    .max(new Date(), { message: 'Mating date cannot be in the future' })
    .refine(
      (d) => d.getTime() >= Date.now() - 120 * 24 * 60 * 60 * 1000,
      { message: 'Mating date is too far in the past for an active pregnancy' },
    ),
});

/**
 * Upsert today's log. Chips are validated against the shared const registry so
 * an unknown chip value is rejected with 400. `gestationWeek` is intentionally
 * absent — it is always computed server-side from the session's matingDate.
 */
export const createLogSchema = z.object({
  sessionId: z.string().cuid(),
  symptoms: z.array(z.enum(SYMPTOM_CHIPS)).max(SYMPTOM_CHIPS.length).optional().default([]),
  moodBehavior: z.array(z.enum(MOOD_CHIPS)).max(MOOD_CHIPS.length).optional().default([]),
  appetiteLevel: z.enum(APPETITE_LEVELS).optional(),
  energyLevel: z.enum(ENERGY_LEVELS).optional(),
  nestingObserved: z.boolean().optional().default(false),
  // max 20 kg — catches obvious input errors (no cat weighs 50 kg)
  weight: z.number().positive().max(20).optional(),
  // normal feline range 38–39.2 °C; bounds reject nonsense input
  temp: z.number().min(35).max(42).optional(),
  notes: z.string().max(300).optional(),
  logDate: z.coerce.date().optional(),
});

/** Optional `?week=` filter for the history endpoint. */
export const logHistoryQuerySchema = z.object({
  week: z.coerce.number().int().min(1).max(10).optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
export type LogHistoryQuery = z.infer<typeof logHistoryQuerySchema>;
