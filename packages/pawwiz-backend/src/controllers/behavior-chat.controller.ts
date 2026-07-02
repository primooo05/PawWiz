/**
 * Controller Layer — Behavior Chat
 * Handles HTTP request/response for behavior chat endpoints.
 * Delegates business logic to BehaviorChatService.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { behaviorChatService } from '../services/behavior-chat.service.js';

/** GET /api/behavior/chats — List all chat sessions */
export const getChats = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chats = await behaviorChatService.getChats(supabaseUserId);
  res.json({ chats });
});

/** GET /api/behavior/chats/:id — Get a single chat with messages */
export const getChat = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chatId = req.params.id as string;
  const chat = await behaviorChatService.getChat(supabaseUserId, chatId);
  res.json(chat);
});

/** POST /api/behavior/chats — Create a new chat session */
export const createChat = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const { title } = req.body;
  const chat = await behaviorChatService.createChat(supabaseUserId, title);
  res.status(201).json(chat);
});

/** POST /api/behavior/chats/:id/messages — Add a message to a chat */
export const addMessage = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chatId = req.params.id as string;
  const { speaker, text, analysis } = req.body;

  const message = await behaviorChatService.addMessage(supabaseUserId, {
    chatId,
    speaker,
    text,
    analysis: analysis || null,
  });

  res.status(201).json(message);
});

/** PATCH /api/behavior/chats/:id — Update chat title */
export const updateChat = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chatId = req.params.id as string;
  const { title } = req.body;
  const chat = await behaviorChatService.updateTitle(supabaseUserId, chatId, title);
  res.json(chat);
});

/** DELETE /api/behavior/chats/:id — Delete a chat */
export const deleteChat = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chatId = req.params.id as string;
  await behaviorChatService.deleteChat(supabaseUserId, chatId);
  res.status(204).send();
});
