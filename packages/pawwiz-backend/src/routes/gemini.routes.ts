/**
 * Chain of Responsibility (Middleware Pattern)
 * Gemini AI service routes — vision, diet, behavior.
 * All endpoints require authentication and request validation.
 */

import { Router } from 'express';
import { scanPlant, optimizeDiet, decodeBehavior } from '../controllers/gemini.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { scanSchema, dietSchema, behaviorSchema } from '../schemas/index.js';

const geminiRouter = Router();

// All Gemini routes require authentication
geminiRouter.use(authMiddleware);

// Vision — Plant toxicity scan (image or text query)
geminiRouter.post('/vision/scan', validate(scanSchema), scanPlant);

// Diet — Personalized feline nutrition plan
geminiRouter.post('/diet/optimize', validate(dietSchema), optimizeDiet);

// Behavior — Cat vocalization and body language decoder
geminiRouter.post('/behavior/decode', validate(behaviorSchema), decodeBehavior);

export { geminiRouter };
