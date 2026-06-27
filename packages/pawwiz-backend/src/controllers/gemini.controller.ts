/**
 * Controller Layer — Gemini AI Services
 * Thin layer: extracts request data, delegates to services, formats response.
 * Uses Template Method (withErrorHandling) for standardized try/catch flow.
 * Covers: Vision (plant scan), Diet Optimization, Behavior Decoder.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { visionService } from '../services/vision.service.js';
import { dietOptimizationService } from '../services/diet-optimization.service.js';
import { behaviorDecoderService } from '../services/behavior-decoder.service.js';

/**
 * POST /api/gemini/vision/scan
 * Identify a plant from an image or text query and check toxicity.
 * Body: { image?: string, plantNameQuery?: string }
 */
export const scanPlant = withErrorHandling(async (req: Request, res: Response) => {
  const result = await visionService.scan(req.body);
  res.json(result);
});

/**
 * POST /api/gemini/diet/optimize
 * Generate a personalized diet plan for a cat.
 * Body: { weightKg, ageYears, activityLevel, healthConditions }
 */
export const optimizeDiet = withErrorHandling(async (req: Request, res: Response) => {
  const result = await dietOptimizationService.optimize(req.body);
  res.json(result);
});

/**
 * POST /api/gemini/behavior/decode
 * Decode cat behavior from vocal and body language descriptions.
 * Body: { vocalDescription, bodyLanguageSigns, context }
 */
export const decodeBehavior = withErrorHandling(async (req: Request, res: Response) => {
  const result = await behaviorDecoderService.decode(req.body);
  res.json(result);
});
