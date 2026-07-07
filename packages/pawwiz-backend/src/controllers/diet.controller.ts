import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { dietService } from '../services/diet.service.js';
import {
  createDietProfileSchema,
  updateDietProfileSchema,
  updateDietMealLogSchema,
  createDietMealLogSchema,
  updateWaterIntakeSchema,
  updateAvatarSchema,
} from '../schemas/diet.schemas.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/winston.js';

export const getDietProfiles = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const email = (req as any).user?.email;
  const profiles = await dietService.getProfiles(supabaseUserId, email);
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

/** Create a new meal log entry for a custom period (e.g. "Midnight Snack"). */
export const createDietMealLog = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  const parsed = createDietMealLogSchema.parse(req.body);
  const profile = await dietService.createCustomMeal(supabaseUserId, id, parsed);
  res.status(201).json(profile);
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

export const updateAvatar = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const id = req.params.id as string;
  const parsed = updateAvatarSchema.parse(req.body);
  const profile = await dietService.updateAvatar(supabaseUserId, id, parsed.photoUrl);
  res.json(profile);
});

/**
 * Handle file upload via multipart FormData
 * Receives file from frontend, uploads to Supabase Storage (private bucket),
 * and updates the database with the public signed URL.
 */
export const uploadAvatarFile = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub;
  const profileId = req.params.id as string;

  const file = (req as any).file;
  if (!file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    // Verify profile ownership
    const dietProfile = await prisma.dietProfile.findFirst({
      where: {
        id: profileId,
        profile: { supabaseUserId },
      },
      include: { profile: true },
    });

    if (!dietProfile) {
      res.status(403).json({ message: 'Profile not found or unauthorized' });
      return;
    }

    // Derive extension from multer-verified MIME type (path traversal fix)
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = MIME_TO_EXT[file.mimetype] ?? 'jpg';
    const filePath = `${supabaseUserId}/${profileId}/${Date.now()}.${ext}`;

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      // Log presence flags only — never log env var names or values
      logger.error('[uploadAvatarFile] Storage service misconfigured — required env vars absent');
      res.status(500).json({ message: 'Storage service unavailable' });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: uploadError } = await supabase.storage
      .from('cat_profile')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // Log the SDK error internally but never forward it to the client
      logger.error('[uploadAvatarFile] Storage upload failed', { name: uploadError.name });
      res.status(500).json({ message: 'Failed to upload file' });
      return;
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cat_profile')
      .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logger.error('[uploadAvatarFile] Failed to generate signed URL');
      res.status(500).json({ message: 'Failed to generate URL' });
      return;
    }

    const publicUrl = signedUrlData.signedUrl;

    if (dietProfile?.catId) {
      await prisma.cat.update({
        where: { id: dietProfile.catId },
        data: { photoUrl: publicUrl } as any,
      });
    }

    res.json({ photoUrl: publicUrl });
  } catch (error) {
    logger.error('[uploadAvatarFile] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ message: 'Upload failed' });
  }
});
