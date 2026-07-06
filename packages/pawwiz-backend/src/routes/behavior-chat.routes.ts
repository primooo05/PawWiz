/**
 * Chain of Responsibility (Middleware Pattern)
 * Behavior Chat routes — CRUD for chat sessions, messages, and dashboard.
 * All endpoints require authentication.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getChats,
  getChat,
  createChat,
  addMessage,
  updateChat,
  deleteChat,
  backfillBehaviorLogs,
} from '../controllers/behavior-chat.controller.js';
import {
  getWeeklySummary,
  getBehaviorPatterns,
  getDailyTimeline,
  getInsights,
  getBehaviorTrend,
} from '../controllers/behavior-dashboard.controller.js';

const behaviorChatRouter = Router();

// All behavior chat routes require authentication
behaviorChatRouter.use(authMiddleware);

// Chat sessions
behaviorChatRouter.get('/chats', getChats);
behaviorChatRouter.get('/chats/:id', getChat);
behaviorChatRouter.post('/chats', createChat);
behaviorChatRouter.patch('/chats/:id', updateChat);
behaviorChatRouter.delete('/chats/:id', deleteChat);

// Messages within a chat
behaviorChatRouter.post('/chats/:id/messages', addMessage);

// One-shot backfill for existing conversations
behaviorChatRouter.post('/backfill-logs', backfillBehaviorLogs);

// Dashboard & Analytics
behaviorChatRouter.get('/dashboard/week', getWeeklySummary);
behaviorChatRouter.get('/dashboard/patterns', getBehaviorPatterns);
behaviorChatRouter.get('/dashboard/timeline', getDailyTimeline);
behaviorChatRouter.get('/dashboard/insights', getInsights);
behaviorChatRouter.get('/dashboard/trend', getBehaviorTrend);

export { behaviorChatRouter };
