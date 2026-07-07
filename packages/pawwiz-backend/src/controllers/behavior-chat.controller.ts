/**
 * Controller Layer — Behavior Chat
 * Handles HTTP request/response for behavior chat endpoints.
 * Delegates business logic to BehaviorChatService.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { behaviorChatService } from '../services/behavior-chat.service.js';

/** GET /api/behavior/chats — List chat sessions, optionally filtered by catId query param */
export const getChats = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  // ?catId=<id> scopes the list to a specific cat; omitting it returns all user chats.
  const catId = (req.query.catId as string | undefined) || null;
  const chats = await behaviorChatService.getChats(supabaseUserId, catId);
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
  const { title, catId } = req.body;
  const chat = await behaviorChatService.createChat(supabaseUserId, title, catId ?? null);
  res.status(201).json(chat);
});

/** POST /api/behavior/chats/:id/messages — Add a message to a chat */
export const addMessage = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const chatId = req.params.id as string;
  const { speaker, text } = req.body;

  // Security: validate speaker is one of the two allowed values.
  if (speaker !== 'user' && speaker !== 'wiz') {
    res.status(400).json({ message: 'Invalid speaker value.' });
    return;
  }

  // Security: always strip the client-supplied `analysis` field and never
  // reconstruct a decodeResult from it. BehaviorLog entries are written
  // server-side by the /api/gemini/behavior/decode handler immediately after
  // the AI produces a result — before this endpoint is even called.
  // Accepting a client-supplied analysis payload here would allow any
  // authenticated user to fabricate arbitrary catState / confidence values
  // and inject them into the behavior history without the AI being consulted.
  const message = await behaviorChatService.addMessage(supabaseUserId, {
    chatId,
    speaker,
    text,
    analysis: null,       // always null — never trust client-supplied analysis
    decodeResult: undefined, // never derive BehaviorLogs from client data
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

/**
 * POST /api/behavior/backfill-logs
 * One-shot backfill: scans all existing Wiz messages with a full analysis
 * payload and writes missing BehaviorLog entries for them.
 * Idempotent — already-logged messages are skipped.
 */
export const backfillBehaviorLogs = withErrorHandling(async (req: Request, res: Response) => {
  const supabaseUserId = (req as any).user?.sub as string;
  const result = await behaviorChatService.backfillBehaviorLogs(supabaseUserId);
  res.json(result);
});
