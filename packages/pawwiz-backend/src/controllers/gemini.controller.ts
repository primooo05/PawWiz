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
import { createBehaviorLog } from '../repositories/behavior-log.repository.js';
import { logger } from '../utils/winston.js';

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
 *
 * After a successful full analysis, a BehaviorLog entry is written
 * immediately — no round-trip through the frontend required.
 */
export const decodeBehavior = withErrorHandling(async (req: Request, res: Response) => {
  const body = req.body;
  const supabaseUserId = (req as any).user?.sub as string;

  // Enrich cat context with diet + pregnancy data when catId is available
  if (body.catContext?.catId) {
    body.catContext = await behaviorContextService.enrich(body.catContext);
  }

  const result = await behaviorDecoderService.decode(body);

  // Write a BehaviorLog immediately when we get a full analysis result.
  // This is more reliable than waiting for the frontend to save the Wiz message
  // back with the analysis payload — it fires regardless of network hiccups or
  // response type mismatches on the client side.
  if (result.type === 'analysis' && body.chatId) {
    setImmediate(async () => {
      try {
        const extracted = behaviorDecoderService.extractFromDecodeResult(
          body.vocalDescription ?? '',
          result,
        );
        for (const behavior of extracted) {
          await createBehaviorLog({
            chatId: body.chatId,
            supabaseUserId,
            catId: body.catContext?.catId ?? undefined,
            behaviorType: behavior.behaviorType,
            intensity: behavior.intensity,
            description: behavior.description,
            context: behavior.context,
            extractedFrom: body.vocalDescription ?? '',
            confidence: behavior.confidence,
          });
        }
        if (extracted.length > 0) {
          logger.debug('[decodeBehavior] Behavior log written from decode', {
            supabaseUserId,
            chatId: body.chatId,
            types: extracted.map(b => b.behaviorType),
          });
        }
      } catch (err) {
        logger.warn('[decodeBehavior] Non-fatal: failed to write behavior log', {
          error: (err as Error).message,
        });
      }
    });
  }

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
