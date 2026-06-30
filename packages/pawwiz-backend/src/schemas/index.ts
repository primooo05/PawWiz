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
});

// Toxicity search endpoint — POST /api/toxicity/search
export const toxicitySearchSchema = z.object({
  plantNameQuery: z.string().min(1).max(200),
});

// Image upload validation constants — used by multer fileFilter in toxicity.routes.ts
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
export type AllowedImageMimeType = (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number];
