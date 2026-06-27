import { z } from 'zod';

export const scanSchema = z.object({
  image: z.string().optional(),
  plantNameQuery: z.string().optional(),
}).refine(
  (data) => data.image || data.plantNameQuery,
  { message: 'Either image or plantNameQuery must be provided' }
);

export const dietSchema = z.object({
  weightKg: z.number().positive(),
  ageYears: z.number().nonnegative(),
  activityLevel: z.enum(['sedentary', 'moderate', 'active']),
  healthConditions: z.array(z.string()),
});

export const behaviorSchema = z.object({
  vocalDescription: z.string().min(1),
  bodyLanguageSigns: z.array(z.string()).nonempty(),
  context: z.string().min(1),
});
