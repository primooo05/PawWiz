/**
 * Chain of Responsibility (Middleware Pattern)
 * Request passes sequentially through middleware chain before hitting controller.
 * Auth middleware will be added here once Supabase integration is complete.
 */

import { Router } from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.post('/', createProfile);
profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export { profileRouter };
