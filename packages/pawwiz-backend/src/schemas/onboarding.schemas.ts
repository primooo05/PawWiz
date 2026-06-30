import { z } from 'zod';

export const onboardingStep2Schema = z.object({
  ownerName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  ownerEmail: z.string().email('Invalid email address'),
});

export const onboardingStep3Schema = z.object({
  catsCount: z.string().optional(),
  customCatsCount: z.string().optional(),
}).refine(data => (data.catsCount && data.catsCount.trim().length > 0) || (data.customCatsCount && data.customCatsCount.trim().length > 0), {
  message: 'Please specify how many cats you have',
  path: ['catsCount']
});

export const onboardingStep4Schema = z.object({
  catName: z.string().min(1, "Cat name cannot be empty").max(60, "Cat name cannot exceed 60 characters"),
  catBreed: z.string().max(80, "Breed cannot exceed 80 characters").optional(),
  catMarking: z.string().max(80, "Marking cannot exceed 80 characters").optional(),
  catSex: z.enum(['Female', 'Male'], {
    message: "Please select your cat's biological gender, meow"
  }),
});

export const onboardingStep5Schema = z.object({
  catLifeStage: z.enum(['Kitten', 'Adult', 'Senior'], {
    message: "Please select your cat's life stage, meow"
  }),
});

export const profileCreateSchema = z.object({
  displayName: z.string().min(2).max(100),
  onboardingSessionId: z.string().uuid('Invalid onboardingSessionId'),
});


export const otpVerifySchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must be 6 numeric digits'),
});

export const checkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});
