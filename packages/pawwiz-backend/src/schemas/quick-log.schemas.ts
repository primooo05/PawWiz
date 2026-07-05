import { z } from 'zod';

/**
 * Curated set of one-tap behaviors surfaced in the Quick Log bar.
 * Deliberately aligned with the behavior types the dashboard analytics
 * recognizes (concern flags: aggressive/anxious/lethargic; positive
 * indicators: affectionate/playful) so quick logs feed straight into the
 * existing weekly summaries, patterns, and insights.
 */
export const QUICK_LOG_BEHAVIOR_TYPES = [
  'playful',
  'affectionate',
  'vocal',
  'anxious',
  'aggressive',
  'lethargic',
] as const;

export const quickLogBehaviorSchema = z.object({
  behaviorType: z.enum(QUICK_LOG_BEHAVIOR_TYPES, {
    message: 'Unsupported behavior type',
  }),
  intensity: z.enum(['mild', 'moderate', 'severe']).optional().default('moderate'),
  context: z.string().max(200, 'Context too long').optional(),
  catId: z.string().min(1).max(64).optional(),
});

export type QuickLogBehaviorInput = z.infer<typeof quickLogBehaviorSchema>;
