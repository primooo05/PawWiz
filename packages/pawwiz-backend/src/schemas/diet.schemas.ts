import { z } from 'zod';

export const createDietProfileSchema = z.object({
  name: z.string().min(1, 'Cat name cannot be empty').max(60, 'Cat name cannot exceed 60 characters'),
  gender: z.enum(['male', 'female'], {
    message: "Please select male or female"
  }),
  lifeStage: z.enum(['kitten', 'adult', 'senior'], {
    message: "Please select kitten, adult, or senior"
  }),
  age: z.number().int().nonnegative('Age must be non-negative'),
  weight: z.number().positive('Weight must be greater than zero'),
  isKg: z.boolean(),
  foodPreference: z.enum(['dry', 'wet', 'mixed']),
  isSpayedNeutered: z.boolean(),
  isTracking: z.boolean().optional().default(false),
  waterIntake: z.number().int().nonnegative().optional().default(0),
  breed: z.string().nullable().optional(),
  marking: z.string().nullable().optional(),
});

export const updateDietProfileSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  gender: z.enum(['male', 'female']).optional(),
  lifeStage: z.enum(['kitten', 'adult', 'senior']).optional(),
  age: z.number().int().nonnegative().optional(),
  weight: z.number().positive().optional(),
  isKg: z.boolean().optional(),
  foodPreference: z.enum(['dry', 'wet', 'mixed']).optional(),
  isSpayedNeutered: z.boolean().optional(),
  isTracking: z.boolean().optional(),
  waterIntake: z.number().int().nonnegative().optional(),
  breed: z.string().nullable().optional(),
  marking: z.string().nullable().optional(),
});

export const updateDietMealLogSchema = z.object({
  foodType: z.enum(['dry', 'wet', 'mixed']).nullable().optional(),
  amount: z.number().nonnegative().nullable().optional(),
  unit: z.enum(['spoon', 'cup']).nullable().optional(),
  kcal: z.number().nonnegative().optional(),
  status: z.enum(['pending', 'logged', 'skipped']),
  timestamp: z.string().nullable().optional(),
});

export const updateWaterIntakeSchema = z.object({
  amount: z.number(), // This can be positive to add water or negative/zero (e.g. for reset)
});
