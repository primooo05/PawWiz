import { z } from 'zod';

export const gestationSchema = z.object({
  matingDate: z.string().min(1, 'Please select a mating date'),
});

export const dietSchema = z.object({
  weight: z.number().min(0.1, 'Weight must be greater than 0'),
  age: z.number().min(1, 'Age must be at least 1').max(30, 'Age is too high'),
  activity: z.enum(['', 'sedentary', 'moderate', 'active']),
  selectedConditions: z.array(z.string()),
  customCondition: z.string().optional()
});

export const behaviorSchema = z.object({
  vocal: z.string().min(1, 'Please describe vocalizations'),
  context: z.string().min(1, 'Context is required'),
  bodySigns: z.array(z.string())
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().optional(),
  catDetails: z.string().optional(),
  inquiryReason: z.string().min(1, 'Please select a reason'),
  budgetTier: z.string(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});
