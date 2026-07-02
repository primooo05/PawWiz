/**
 * Routes — Behavior Dashboard
 * Endpoints for behavior analytics and pattern insights
 */

import { Router } from 'express';
import {
  getWeeklySummary,
  getBehaviorPatterns,
  getDailyTimeline,
  getInsights,
} from '../controllers/behavior-dashboard.controller.js';

const router = Router();

/** GET /api/behavior/dashboard/week */
router.get('/week', getWeeklySummary);

/** GET /api/behavior/dashboard/patterns */
router.get('/patterns', getBehaviorPatterns);

/** GET /api/behavior/dashboard/timeline */
router.get('/timeline', getDailyTimeline);

/** GET /api/behavior/dashboard/insights */
router.get('/insights', getInsights);

export default router;
