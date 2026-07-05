/**
 * Timeline Routes — Unified Health Timeline
 * All routes are mounted at /api/timeline (prefix added in routes/index.ts).
 * All endpoints require authentication via authMiddleware.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getTimelineQuerySchema,
  getInsightsQuerySchema,
  exportPdfBodySchema,
} from '../schemas/timeline.schemas.js';
import { timelineController } from '../controllers/timeline.controller.js';

/**
 * PDF export rate limiter — co-located with the route it guards.
 * 5 requests per 60 s, keyed on the authenticated user's JWT sub claim
 * (falling back to IP, then 'unknown' when neither is available).
 */
const pdfRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.sub ?? req.ip ?? 'unknown',
  handler: (_req: Request, res: Response, _next: NextFunction) => {
    res
      .status(429)
      .json({ error: 'Too many export requests. Please wait before retrying.' });
  },
});

const timelineRouter = Router();

timelineRouter.use(authMiddleware);

// GET /:catId — paginated timeline events for a cat
timelineRouter.get(
  '/:catId',
  validate(getTimelineQuerySchema, 'query'),
  timelineController.getTimeline,
);

// GET /:catId/insights — AI-generated insights for a cat
timelineRouter.get(
  '/:catId/insights',
  validate(getInsightsQuerySchema, 'query'),
  timelineController.getInsights,
);

// POST /:catId/insights/refresh — trigger an on-demand insights refresh
timelineRouter.post('/:catId/insights/refresh', timelineController.refreshInsights);

// POST /:catId/export/pdf — generate and stream a PDF health summary
timelineRouter.post(
  '/:catId/export/pdf',
  validate(exportPdfBodySchema, 'body'),
  pdfRateLimiter,
  timelineController.exportPdf,
);

export { timelineRouter };
