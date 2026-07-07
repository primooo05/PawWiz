import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { pregnancySessionService } from '../services/pregnancy-session.service.js';
import { pregnancyLogService } from '../services/pregnancy-log.service.js';
import { pregnancyInsightService } from '../services/pregnancy-insight.service.js';
import { verifySessionOwnership } from '../services/pregnancy-access.js';
import {
  startSessionSchema,
  createLogSchema,
  logHistoryQuerySchema,
} from '../schemas/pregnancy.schemas.js';

export const startSession = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const { catId, matingDate } = startSessionSchema.parse(req.body);
  const session = await pregnancySessionService.startSession(supabaseUserId, catId, matingDate);
  res.status(201).json(session);
});

export const getActiveSession = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const catId = req.params.catId as string;
  const session = await pregnancySessionService.getActiveSession(supabaseUserId, catId);
  // 200 with null body when there's no active session — the frontend renders
  // the "Start Pregnancy Tracker" CTA rather than treating it as an error.
  res.json(session);
});

export const upsertLog = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const payload = createLogSchema.parse(req.body);
  const entry = await pregnancyLogService.upsertDailyLog(supabaseUserId, payload);
  res.status(200).json(entry);
});

export const getLogHistory = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const sessionId = req.params.sessionId as string;
  const { week } = logHistoryQuerySchema.parse(req.query);
  const history = await pregnancyLogService.getHistory(supabaseUserId, sessionId, week);
  res.json(history);
});

export const getInsights = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const sessionId = req.params.sessionId as string;
  await verifySessionOwnership(sessionId, supabaseUserId); // throws 403/404 if not owned
  const insights = await pregnancyInsightService.getUnread(sessionId);
  res.json(insights);
});

export const markInsightRead = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const insightId = req.params.insightId as string;
  const card = await pregnancyInsightService.markRead(insightId, supabaseUserId);
  res.json(card);
});

export const completeSession = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const sessionId = req.params.sessionId as string;
  const result = await pregnancySessionService.completeSession(supabaseUserId, sessionId);
  res.json(result);
});

export const deleteLog = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = req.user!.sub;
  const sessionId = req.params.sessionId as string;
  const dateStr = req.params.dateStr as string;
  await pregnancyLogService.deleteDailyLog(supabaseUserId, sessionId, dateStr);
  res.status(200).json({ success: true });
});
