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

  // Check that file was uploaded
  const file = (req as any).file;
  if (!file) {
    console.debug('[uploadAvatarFile] No file in request');
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  console.debug('[uploadAvatarFile] File received:', {
    supabaseUserId,
    profileId,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  });

  try {
    // Verify profile ownership by checking if this diet profile belongs to the authenticated user
    const dietProfile = await prisma.dietProfile.findFirst({
      where: {
        id: profileId,
        profile: { supabaseUserId },
      },
      include: { profile: true },
    });

    if (!dietProfile) {
      console.debug('[uploadAvatarFile] Profile not found or not owned by user:', {
        supabaseUserId,
        profileId,
      });
      res.status(403).json({ message: 'Profile not found or unauthorized' });
      return;
    }

    // Derive extension from the MIME type (server-verified by multer) rather than
    // the client-supplied filename, then build the storage path entirely from
    // server-controlled values so a crafted filename like "../../other/file.jpg"
    // cannot traverse outside the owner's folder.
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = MIME_TO_EXT[file.mimetype] ?? 'jpg';
    const filePath = `${supabaseUserId}/${profileId}/${Date.now()}.${ext}`;

    console.debug('[uploadAvatarFile] Uploading to Supabase:', { filePath });

    // Import Supabase dynamically to avoid circular dependencies
    const { createClient } = await import('@supabase/supabase-js');
    // Support both naming conventions: backend uses SUPABASE_URL, but fallback to VITE_SUPABASE_URL if available
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    console.debug('[uploadAvatarFile] Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? '✓' : '✗ Missing SUPABASE_URL or VITE_SUPABASE_URL',
      key: supabaseServiceKey ? '✓' : '✗ Missing SUPABASE_SERVICE_ROLE_KEY',
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[uploadAvatarFile] Missing Supabase config:', {
        SUPABASE_URL: process.env.SUPABASE_URL ? '✓' : '✗',
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✓' : '✗',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')).sort(),
      });
      res.status(500).json({ message: 'Storage service unavailable' });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload file to private bucket
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('cat_profile')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadAvatarFile] Upload error:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        name: uploadError.name,
        fullError: uploadError,
      });
      res.status(500).json({ 
        message: 'Failed to upload file',
        error: uploadError.message,
      });
      return;
    }

    console.debug('[uploadAvatarFile] Upload successful:', uploadData);

    console.debug('[uploadAvatarFile] File uploaded, generating signed URL');

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cat_profile')
      .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[uploadAvatarFile] Signed URL error:', signedUrlError);
      res.status(500).json({ message: 'Failed to generate URL' });
      return;
    }

    const publicUrl = signedUrlData.signedUrl;

    console.debug('[uploadAvatarFile] Updating database:', { publicUrl });

    // Update database with signed URL
    if (dietProfile?.catId) {
      await prisma.cat.update({
        where: { id: dietProfile.catId },
        data: { photoUrl: publicUrl } as any,
      });
    }

    res.json({ photoUrl: publicUrl });
  } catch (error) {
    console.error('[uploadAvatarFile] Unexpected error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});
