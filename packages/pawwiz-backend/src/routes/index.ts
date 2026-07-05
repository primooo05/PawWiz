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
import { behaviorChatRouter } from './behavior-chat.routes.js';
import { quickLogRouter } from './quick-log.routes.js';
import { authRouter } from './auth.routes.js';
import { timelineRouter } from './timeline.routes.js';
import { pregnancyRouter } from './pregnancy.routes.js';

export function registerRoutes(app: Express): void {
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/aspca', aspcaRouter);
  app.use('/api/gemini', geminiRouter);
  app.use('/api/onboarding', onboardingRouter);
  app.use('/api/toxicity', toxicityRouter);
  app.use('/api/diet', dietRouter);
  app.use('/api/behavior', behaviorChatRouter);
  app.use('/api/quick-log', quickLogRouter);
  app.use('/api/timeline', timelineRouter);
  app.use('/api/pregnancy', pregnancyRouter);
}

