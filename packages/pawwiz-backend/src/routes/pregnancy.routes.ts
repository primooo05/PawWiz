import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { trackingWriteLimiter } from '../middleware/rateLimiter.js';
import {
  startSession,
  getActiveSession,
  upsertLog,
  getLogHistory,
  getInsights,
  markInsightRead,
  completeSession,
  deleteLog,
} from '../controllers/pregnancy.controller.js';

const pregnancyRouter = Router();

// All pregnancy endpoints require a valid Supabase JWT.
pregnancyRouter.use(authMiddleware);

// Session lifecycle
pregnancyRouter.post('/session/start', startSession);
pregnancyRouter.get('/session/active/:catId', getActiveSession);
pregnancyRouter.patch('/session/:sessionId/complete', completeSession);

// Flo-style daily logging (one-tap, high-frequency → rate-limited)
pregnancyRouter.post('/log', trackingWriteLimiter, upsertLog);
pregnancyRouter.delete('/log/:sessionId/:dateStr', deleteLog);
pregnancyRouter.get('/log/history/:sessionId', getLogHistory);

// Insight cards
pregnancyRouter.get('/insights/:sessionId', getInsights);
pregnancyRouter.patch('/insights/:insightId/read', markInsightRead);

export { pregnancyRouter };
