import { z } from 'zod';

export const scanSchema = z.object({
  image: z.string().optional(),
  plantNameQuery: z.string().optional(),
}).refine(
  (data) => data.image || data.plantNameQuery,
  { message: 'Either image or plantNameQuery must be provided' }
);

export const plantLookupRequestSchema = z.object({
  plantName: z.string().min(1),
});

export const plantLookupResponseSchema = z.object({
  plantName: z.string(),
  scientificName: z.string(),
  isToxic: z.boolean(),
  clinicalSigns: z.array(z.string()),
  severity: z.enum(['None', 'Mild', 'Moderate', 'Severe']),
  actionRequired: z.string(),
});

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
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'wiz']),
      content: z.string(),
    })
  ).max(6).optional(),
});

export const dietAdviceSchema = z.object({
  question: z.string().min(1).max(1000),
  catProfile: z.object({
    catName: z.string().min(1),
    gender: z.enum(['male', 'female']),
    lifeStage: z.enum(['kitten', 'adult', 'senior']),
    age: z.number().nonnegative(),
    weight: z.number().positive(),
    isKg: z.boolean(),
    foodPreference: z.enum(['dry', 'wet', 'mixed', 'chicken', 'chicken_thigh', 'fish', 'egg', 'other']),
    isSpayedNeutered: z.boolean(),
    dailyCalories: z.number().nonnegative(),
    totalLoggedCalories: z.number().nonnegative(),
    waterIntake: z.number().nonnegative(),
    waterTarget: z.number().nonnegative(),
    mealsLoggedToday: z.number().nonnegative(),
    mealsPendingToday: z.number().nonnegative(),
  }),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'wiz']),
      content: z.string(),
    })
  ).max(6).optional(),
});

// Toxicity search endpoint — POST /api/toxicity/search
export const toxicitySearchSchema = z.object({
  plantNameQuery: z.string().min(1).max(200),
});

// Image upload validation constants — used by multer fileFilter in toxicity.routes.ts
// PlantNet API only accepts JPEG and PNG; max payload is 50 MB per their documented limit.
export const IMAGE_UPLOAD_MAX_BYTES = 50 * 1024 * 1024; // 50 MB
export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
] as const;
export type AllowedImageMimeType = (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number];
