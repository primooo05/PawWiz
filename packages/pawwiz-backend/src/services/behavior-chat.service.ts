/**
 * Service Layer — Behavior Chat
 * Orchestrates chat session CRUD and message persistence.
 * Delegates data access to BehaviorChatRepository.
 * Extracts and logs behavior patterns from conversations.
 * Singleton Pattern — exported as a single instance.
 */

import { behaviorChatRepository } from '../repositories/behavior-chat.repository.js';
import { createBehaviorLog, findRecentByTypeForUser } from '../repositories/behavior-log.repository.js';
import type { ChatWithMessages, CreateMessageData } from '../repositories/behavior-chat.repository.js';
import { behaviorDecoderService } from './behavior-decoder.service.js';
import type { DecoderResponse } from './behavior-decoder.service.js';
import { extractTitle } from '../utils/keyword-extractor.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/winston.js';

class BehaviorChatService {
  /** Get all chat sessions for the authenticated user, optionally scoped to a cat */
  async getChats(supabaseUserId: string, catId?: string | null): Promise<ChatWithMessages[]> {
    logger.debug('[BehaviorChat] Fetching chats', { catId: catId ?? 'all' });
    return behaviorChatRepository.findAllByUser(supabaseUserId, catId ?? undefined);
  }

  /** Get a single chat by ID (with ownership check) */
  async getChat(supabaseUserId: string, chatId: string): Promise<ChatWithMessages> {
    const belongs = await behaviorChatRepository.belongsToUser(chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }
    const chat = await behaviorChatRepository.findById(chatId);
    if (!chat) {
      throw new AppError('Chat not found', 404);
    }
    return chat;
  }

  /** Create a new chat session, scoped to a specific cat when catId is provided */
  async createChat(supabaseUserId: string, title?: string, catId?: string | null) {
    logger.info('[BehaviorChat] Creating new chat', { catId: catId ?? null });
    const chat = await behaviorChatRepository.createChat({
      supabaseUserId,
      catId: catId ?? null,
      title,
    });

    // Add welcome message
    await behaviorChatRepository.addMessage({
      chatId: chat.id,
      speaker: 'wiz',
      text: "Hey there! 🐾 I'm Wiz, your cat behavior specialist. Describe what your cat is doing — vocalizations, body language, or context — and I'll decode it for you.",
    });

    // Return with messages included
    return behaviorChatRepository.findById(chat.id);
  }

  /** Add a message to a chat (with ownership check & behavior extraction) */
  async addMessage(supabaseUserId: string, data: CreateMessageData & { decodeResult?: DecoderResponse }) {
    const belongs = await behaviorChatRepository.belongsToUser(data.chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }

    const message = await behaviorChatRepository.addMessage(data);

    // Extract and log behaviors from the AI decode result attached to Wiz messages.
    // Using the decoder's structured output is far more reliable than keyword-matching
    // raw user text — the AI has already classified catState, confidence, and meaning.
    if (data.speaker === 'wiz' && data.decodeResult) {
      const decodeResult = data.decodeResult;

      setImmediate(async () => {
        try {
          const parentChat = await behaviorChatRepository.findById(data.chatId);
          const catId = (parentChat as any)?.catId ?? null;

          // Use the last user message in the conversation as the source text
          // (Wiz messages are responses, so the behavior originated from the user's input).
          const lastUserMsg = (parentChat?.messages ?? [])
            .filter((m: { speaker: string }) => m.speaker === 'user')
            .at(-1);
          const sourceText = (data.analysis as Record<string, unknown> | null)?.userMessage as string
            ?? lastUserMsg?.text
            ?? data.text;

          const extracted = behaviorDecoderService.extractFromDecodeResult(
            sourceText,
            decodeResult,
          );

          for (const behavior of extracted) {
            try {
              await createBehaviorLog({
                chatId: data.chatId,
                supabaseUserId,
                catId: catId ?? undefined,
                behaviorType: behavior.behaviorType,
                intensity: behavior.intensity,
                description: behavior.description,
                context: behavior.context,
                extractedFrom: sourceText,
                confidence: behavior.confidence,
              });
            } catch (logError) {
              logger.warn('[BehaviorChat] Failed to create behavior log', {
                error: (logError as Error).message,
                behaviorType: behavior.behaviorType,
              });
            }
          }

          if (extracted.length > 0) {
            logger.debug('[BehaviorChat] Logged behaviors from AI decode', {
              supabaseUserId,
              chatId: data.chatId,
              catId: catId ?? null,
              count: extracted.length,
              types: extracted.map(b => b.behaviorType),
            });
          }
        } catch (error) {
          logger.error('[BehaviorChat] Error extracting behaviors from decode result', {
            error: (error as Error).message,
            stack: (error as Error).stack,
          });
        }
      });
    }

    // Auto-update title from first user message using deterministic RAKE
    // keyword extraction — no LLM round-trip, no external dependency.
    const chat = await behaviorChatRepository.findById(data.chatId);
    if (chat && data.speaker === 'user') {
      const userMessages = chat.messages.filter((m: { speaker: string }) => m.speaker === 'user');
      if (userMessages.length === 1) {
        const newTitle = extractTitle(data.text);
        await behaviorChatRepository.updateTitle(data.chatId, newTitle);
      }
    }

    return message;
  }

  /**
   * Backfill BehaviorLog entries for all existing Wiz messages that carry a
   * full analysis payload but have no corresponding BehaviorLog row yet.
   *
   * Safe to call multiple times — skips any chat/message combination that
   * already has a log (checked by chatId + extractedFrom deduplication).
   * Returns the count of newly written log entries.
   */
  async backfillBehaviorLogs(supabaseUserId: string): Promise<{ created: number; skipped: number }> {
    // Fetch all chats for this user (including the Quick Log anchor chat)
    const chats = await behaviorChatRepository.findAllByUser(supabaseUserId);
    let created = 0;
    let skipped = 0;

    for (const chat of chats) {
      const messages = chat.messages;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        // Only process Wiz messages with a full analysis payload
        if (msg.speaker !== 'wiz') continue;
        const analysis = msg.analysis as Record<string, unknown> | null;
        if (!analysis?.catState) continue;

        // Find the preceding user message as source text
        const prevUserMsg = messages.slice(0, i).reverse().find(m => m.speaker === 'user');
        const sourceText = prevUserMsg?.text ?? msg.text;

        // Check if a log already exists for this chat + source text combination
        const stateToType: Record<string, string> = {
          'Happy/Relaxed': 'affectionate',
          'Anxious/Stressed': 'anxious',
          'Playful': 'playful',
          'Aggressive/Defensive': 'aggressive',
          'Overstimulated': 'aggressive',
          'Sick/In Pain': 'lethargic',
          'Unknown': 'vocalization',
        };
        const behaviorType = stateToType[analysis.catState as string] ?? 'vocalization';

        const existing = await findRecentByTypeForUser(
          supabaseUserId,
          behaviorType,
          new Date(msg.createdAt.getTime() - 60_000), // within 1 min of message
          (chat as any).catId ?? undefined,
        );

        if (existing) {
          skipped++;
          continue;
        }

        const decodeResult = {
          type: 'analysis' as const,
          analysis: analysis as any,
        };

        const extracted = behaviorDecoderService.extractFromDecodeResult(sourceText, decodeResult);

        for (const behavior of extracted) {
          try {
            await createBehaviorLog({
              chatId: chat.id,
              supabaseUserId,
              catId: (chat as any).catId ?? undefined,
              behaviorType: behavior.behaviorType,
              intensity: behavior.intensity,
              description: behavior.description,
              context: behavior.context,
              extractedFrom: sourceText,
              confidence: behavior.confidence,
            });
            created++;
          } catch (err) {
            logger.warn('[BehaviorChat] Backfill: failed to write log', {
              error: (err as Error).message,
              chatId: chat.id,
            });
          }
        }
      }
    }

    logger.info('[BehaviorChat] Backfill complete', { created, skipped });
    return { created, skipped };
  }

  /** Delete a chat (with ownership check) */
  async deleteChat(supabaseUserId: string, chatId: string): Promise<void> {
    const belongs = await behaviorChatRepository.belongsToUser(chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }

    logger.info('[BehaviorChat] Deleting chat', { chatId });
    await behaviorChatRepository.deleteChat(chatId);
  }

  /** Update chat title (with ownership check) */
  async updateTitle(supabaseUserId: string, chatId: string, title: string) {
    const belongs = await behaviorChatRepository.belongsToUser(chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }

    return behaviorChatRepository.updateTitle(chatId, title);
  }
}

/** Singleton instance */
export const behaviorChatService = new BehaviorChatService();
