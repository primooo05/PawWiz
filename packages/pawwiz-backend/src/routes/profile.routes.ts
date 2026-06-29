/**
 * Chain of Responsibility (Middleware Pattern)
 * Request passes sequentially through middleware chain before hitting controller.
 * Auth middleware will be added here once Supabase integration is complete.
 */

import { Router } from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

import { honeypotMiddleware } from '../middleware/honeypot.js';
import { registerLimiter } from '../middleware/rateLimiter.js';

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.post('/', registerLimiter, honeypotMiddleware, createProfile);
profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export { profileRouter };
