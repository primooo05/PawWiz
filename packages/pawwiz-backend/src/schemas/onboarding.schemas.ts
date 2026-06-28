import { z } from 'zod';

export const onboardingStep2Schema = z.object({
  ownerName: z.string().min(2, 'Name must be at least 2 characters'),
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
  catName: z.string().min(2, "Is that really a cat's name? Try again, meow."),
  catBreed: z.string().optional(),
  catMarking: z.string().optional(),
  catSex: z.enum(['Female', 'Male'], {
    message: "Please select your cat's biological gender, meow"
  }),
});

export const onboardingStep5Schema = z.object({
  catLifeStage: z.enum(['Kitten', 'Adult', 'Senior'], {
    message: "Please select your cat's life stage, meow"
  }),
});
