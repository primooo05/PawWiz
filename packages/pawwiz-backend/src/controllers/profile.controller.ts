/**
 * Controller Layer — Profile
 * Thin layer: extracts request data, delegates to service, formats response.
 * Uses Template Method (withErrorHandling) for standardized try/catch flow.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { profileService } from '../services/profile.service.js';

/**
 * POST /api/profile
 * Creates a profile for the authenticated Supabase user.
 */
export const createProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const { displayName, onboardingSessionId, catName, catBreed, catMarking, catSex, catLifeStage } = req.body;

  const profile = await profileService.createProfile(supabaseUserId, displayName, onboardingSessionId, {
    catName,
    catBreed,
    catMarking,
    catSex,
    catLifeStage,
  });

  res.status(201).json({
    id: profile.id,
    supabaseUserId: profile.supabaseUserId,
    displayName: profile.displayName,
    catName: profile.catName,
    catBreed: profile.catBreed,
    catMarking: profile.catMarking,
    catSex: profile.catSex,
    catLifeStage: profile.catLifeStage,
    createdAt: profile.createdAt,
  });
});

/**
 * GET /api/profile
 * Gets the profile for the authenticated Supabase user.
 */
export const getProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;

  const profile = await profileService.getProfileByUserId(supabaseUserId);

  res.json({
    id: profile.id,
    supabaseUserId: profile.supabaseUserId,
    displayName: profile.displayName,
    catName: profile.catName,
    catBreed: profile.catBreed,       // null when not set
    catMarking: profile.catMarking,   // null when not set
    catSex: profile.catSex,
    catLifeStage: profile.catLifeStage,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  });
});

/**
 * PATCH /api/profile
 * Updates the display name for the authenticated user.
 */
export const updateProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const { displayName } = req.body;

  const profile = await profileService.updateDisplayName(supabaseUserId, displayName);

  res.json({
    id: profile.id,
    supabaseUserId: profile.supabaseUserId,
    displayName: profile.displayName,
    updatedAt: profile.updatedAt,
  });
});

/**
 * DELETE /api/profile
 * Deletes the profile for the authenticated user.
 */
export const deleteProfile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;

  await profileService.deleteProfile(supabaseUserId);

  res.status(204).send();
});
