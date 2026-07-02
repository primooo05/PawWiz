/**
 * Chain of Responsibility (Middleware Pattern)
 * Behavior Chat routes — CRUD for chat sessions and messages.
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
} from '../controllers/behavior-chat.controller.js';

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

export { behaviorChatRouter };
