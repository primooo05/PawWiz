/**
 * Chain of Responsibility (Middleware Pattern)
 * Request passes sequentially through middleware chain before hitting controller.
 * Auth middleware will be added here once Supabase integration is complete.
 */

import { Router } from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';

const profileRouter = Router();

// TODO: Add authMiddleware once Supabase JWT verification is implemented (Task 6)
profileRouter.post('/', createProfile);
profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export { profileRouter };
