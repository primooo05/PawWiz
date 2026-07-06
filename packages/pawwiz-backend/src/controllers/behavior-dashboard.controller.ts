/**
 * Controller Layer — Behavior Dashboard
 * Handles HTTP endpoints for behavior insights and pattern analysis
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { behaviorDashboardService } from '../services/behavior-dashboard.service.js';

/** GET /api/behavior/dashboard/week — Get weekly behavior summary */
export const getWeeklySummary = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { catId } = req.query;
  
  const summary = await behaviorDashboardService.getWeeklySummary(
    supabaseUserId,
    catId as string | undefined
  );
  res.json(summary);
});

/** GET /api/behavior/dashboard/patterns — Get behavior patterns */
export const getBehaviorPatterns = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { catId, days = '7' } = req.query;
  
  const patterns = await behaviorDashboardService.getBehaviorPatterns(
    supabaseUserId,
    catId as string | undefined,
    parseInt(days as string)
  );
  res.json(patterns);
});

/** GET /api/behavior/dashboard/timeline — Get daily behavior timeline */
export const getDailyTimeline = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { catId, date } = req.query;
  
  if (!date) {
    res.status(400).json({ error: 'date parameter is required' });
    return;
  }
  
  const timeline = await behaviorDashboardService.getDailyTimeline(
    supabaseUserId,
    date as string,
    catId as string | undefined
  );
  res.json(timeline);
});

/** GET /api/behavior/dashboard/insights — Get AI insights summary */
export const getInsights = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { catId } = req.query;
  
  const insights = await behaviorDashboardService.generateInsights(
    supabaseUserId,
    catId as string | undefined
  );
  res.json(insights);
});

/** GET /api/behavior/dashboard/trend?days=7|30|365 — Per-bucket behavior trend data for charts */
export const getBehaviorTrend = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { catId, days = '7' } = req.query;

  const daysNum = days === 'all' ? 365 : parseInt(days as string, 10);

  const trend = await behaviorDashboardService.getDailyTrend(
    supabaseUserId,
    daysNum,
    catId as string | undefined
  );
  res.json(trend);
});
