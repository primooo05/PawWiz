/**
 * Controller Layer — Gemini AI Services
 * Thin layer: extracts request data, delegates to services, formats response.
 * Uses Template Method (withErrorHandling) for standardized try/catch flow.
 * Covers: Diet Optimization, Behavior Decoder.
 *
 * NOTE: The legacy `scanPlant` handler (POST /api/gemini/vision/scan) has been
 * removed as part of the plant-toxicity-caching migration (Req 9.1, 9.2, 9.3).
 * Plant toxicity scanning is now served exclusively by:
 *   POST /api/toxicity/scan  (toxicity.controller.ts → toxicity_cache.service.ts)
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { dietOptimizationService } from '../services/diet-optimization.service.js';
import { behaviorDecoderService } from '../services/behavior-decoder.service.js';
import { dietAdvisorService } from '../services/diet-advisor.service.js';
import { behaviorContextService } from '../services/behavior-context.service.js';

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
 * Body: { vocalDescription, bodyLanguageSigns, context, catContext? }
 *
 * When catContext.catId is provided, the controller enriches the context
 * with the cat's current diet profile and pregnancy status from the DB
 * before delegating to the decoder service.
 */
export const decodeBehavior = withErrorHandling(async (req: Request, res: Response) => {
  const body = req.body;

  // Enrich cat context with diet + pregnancy data when catId is available
  if (body.catContext?.catId) {
    body.catContext = await behaviorContextService.enrich(body.catContext);
  }

  const result = await behaviorDecoderService.decode(body);
  res.json(result);
});

/**
 * POST /api/gemini/diet/advice
 * Answer a conversational question about a cat's diet recommendation,
 * grounded in the cat's current diet profile snapshot.
 * Body: { question, catProfile, conversationHistory }
 */
export const adviseDiet = withErrorHandling(async (req: Request, res: Response) => {
  const result = await dietAdvisorService.advise(req.body);
  res.json(result);
});
