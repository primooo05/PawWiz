/**
 * Controller Layer — Quick Log
 * Handles HTTP request/response for one-tap behavior logging.
 * Delegates business logic to QuickLogService.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { quickLogService } from '../services/quick-log.service.js';
import { quickLogBehaviorSchema } from '../schemas/quick-log.schemas.js';

/** POST /api/quick-log/behavior — Record a single behavior with one tap */
export const logQuickBehavior = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const parsed = quickLogBehaviorSchema.parse(req.body);
  const log = await quickLogService.logBehavior(supabaseUserId, parsed);
  res.status(201).json(log);
});
