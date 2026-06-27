/**
 * Chain of Responsibility (Middleware Pattern)
 * Request passes sequentially through middleware chain before hitting controller.
 * Auth middleware will be added here once Supabase integration is complete.
 */

import { Router } from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

import { honeypotMiddleware } from '../middleware/honeypot.js';
import { turnstileMiddleware } from '../middleware/turnstile.js';

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.post('/', honeypotMiddleware, turnstileMiddleware, createProfile);
profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export { profileRouter };
