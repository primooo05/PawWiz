import { Router } from 'express';
import { postRequestRecovery } from '../controllers/auth.controller.js';
import { recoveryLimiter } from '../middleware/rateLimiter.js';

const authRouter = Router();

/**
 * POST /api/auth/recover
 * Triggers a password reset email. Rate-limited to 3 req / 15 min per IP.
 * Returns an identical response whether the email exists or not.
 */
authRouter.post('/recover', recoveryLimiter, postRequestRecovery);

export { authRouter };
