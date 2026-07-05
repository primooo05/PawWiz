/**
 * Chain of Responsibility (Middleware Pattern)
 * Quick Log routes — one-tap behavior logging.
 * All endpoints require authentication.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { trackingWriteLimiter } from '../middleware/rateLimiter.js';
import { logQuickBehavior } from '../controllers/quick-log.controller.js';

const quickLogRouter = Router();

// All quick-log routes require authentication
quickLogRouter.use(authMiddleware);

quickLogRouter.post('/behavior', trackingWriteLimiter, logQuickBehavior);

export { quickLogRouter };
