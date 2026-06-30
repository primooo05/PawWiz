/**
 * Chain of Responsibility (Middleware Pattern)
 * Gemini AI service routes — diet, behavior.
 * All endpoints require authentication and request validation.
 *
 * NOTE: The /vision/scan route has been removed as part of the plant-toxicity-caching
 * migration (Req 9.1, 9.2, 9.3). Plant toxicity scanning is now served by:
 *   POST /api/toxicity/scan  (toxicity.routes.ts → toxicity.controller.ts)
 */

import { Router } from 'express';
import { optimizeDiet, decodeBehavior } from '../controllers/gemini.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { dietSchema, behaviorSchema } from '../schemas/index.js';

const geminiRouter = Router();

// All Gemini routes require authentication
geminiRouter.use(authMiddleware);

// Diet — Personalized feline nutrition plan
geminiRouter.post('/diet/optimize', validate(dietSchema), optimizeDiet);

// Behavior — Cat vocalization and body language decoder
geminiRouter.post('/behavior/decode', validate(behaviorSchema), decodeBehavior);

export { geminiRouter };
