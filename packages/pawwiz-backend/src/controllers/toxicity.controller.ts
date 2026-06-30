/**
 * Controller Layer — Plant Toxicity Cache
 * Thin layer: extracts request data, delegates to toxicityCacheService, formats response.
 * Uses Template Method (withErrorHandling) for standardized try/catch flow.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { toxicityCacheService } from '../services/toxicity_cache.service.js';
import { AppError } from '../utils/errors.js';

/**
 * POST /api/toxicity/search
 * Resolves plant toxicity by text name query via the cache pipeline.
 * Body: { plantNameQuery: string }
 */
export const search = withErrorHandling(async (req: Request, res: Response) => {
  const { plantNameQuery } = req.body as { plantNameQuery: string };

  const result = await toxicityCacheService.resolveTextPipeline(plantNameQuery);

  res.json(result);
});

/**
 * POST /api/toxicity/scan
 * Resolves plant toxicity from an uploaded image via Gemini Vision + cache pipeline.
 * Multipart/form-data: file field name "image"
 */
export const scan = withErrorHandling(async (req: Request, res: Response) => {
  if (!req.file) {
    throw AppError.badRequest('Image file is required.');
  }

  const result = await toxicityCacheService.resolveImagePipeline(req.file);

  res.json(result);
});
