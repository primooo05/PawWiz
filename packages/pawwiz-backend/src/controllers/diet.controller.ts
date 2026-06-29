import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { dietService } from '../services/diet.service.js';
import {
  createDietProfileSchema,
  updateDietProfileSchema,
  updateDietMealLogSchema,
  updateWaterIntakeSchema,
} from '../schemas/diet.schemas.js';

export const getDietProfiles = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const profiles = await dietService.getProfiles(supabaseUserId);
  res.json(profiles);
});

export const createDietProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const parsed = createDietProfileSchema.parse(req.body);
  const profile = await dietService.createProfile(supabaseUserId, parsed);
  res.status(201).json(profile);
});

export const updateDietProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  const parsed = updateDietProfileSchema.parse(req.body);
  const profile = await dietService.updateProfile(supabaseUserId, id, parsed);
  res.json(profile);
});

export const deleteDietProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  await dietService.deleteProfile(supabaseUserId, id);
  res.status(204).send();
});

export const updateDietMealLog = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  const mealId = req.params.mealId as string;
  const parsed = updateDietMealLogSchema.parse(req.body);
  const profile = await dietService.updateMeal(supabaseUserId, id, mealId, parsed);
  res.json(profile);
});

export const updateWaterIntake = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  const parsed = updateWaterIntakeSchema.parse(req.body);
  const profile = await dietService.updateWater(supabaseUserId, id, {
    amount: parsed.amount,
    reset: parsed.amount === 0, // Reset when 0
  });
  res.json(profile);
});
