/**
 * Route Registry
 * Central place to mount all routers onto the Express app.
 */

import type { Express } from 'express';
import { profileRouter } from './profile.routes.js';
import { aspcaRouter } from './aspca.routes.js';
import { geminiRouter } from './gemini.routes.js';
import { onboardingRouter } from './onboarding.routes.js';
import { dietRouter } from './diet.routes.js';
import { toxicityRouter } from './toxicity.routes.js';

export function registerRoutes(app: Express): void {
  app.use('/api/profile', profileRouter);
  app.use('/api/aspca', aspcaRouter);
  app.use('/api/gemini', geminiRouter);
  app.use('/api/onboarding', onboardingRouter);
  app.use('/api/toxicity', toxicityRouter);
  app.use('/api/diet', dietRouter);
}

