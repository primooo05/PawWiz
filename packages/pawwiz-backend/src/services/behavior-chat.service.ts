/**
 * Service Layer — Behavior Chat
 * Orchestrates chat session CRUD and message persistence.
 * Delegates data access to BehaviorChatRepository.
 * Extracts and logs behavior patterns from conversations.
 * Singleton Pattern — exported as a single instance.
 */

import { behaviorChatRepository } from '../repositories/behavior-chat.repository.js';
import { createBehaviorLog } from '../repositories/behavior-log.repository.js';
import type { ChatWithMessages, CreateMessageData } from '../repositories/behavior-chat.repository.js';
import { extractBehaviors } from '../utils/behavior-extractor.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/winston.js';

class BehaviorChatService {
  /** Get all chat sessions for the authenticated user */
  async getChats(supabaseUserId: string): Promise<ChatWithMessages[]> {
    logger.info('[BehaviorChat] Fetching all chats', { supabaseUserId });
    return behaviorChatRepository.findAllByUser(supabaseUserId);
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

  /** Create a new chat session */
  async createChat(supabaseUserId: string, title?: string) {
    logger.info('[BehaviorChat] Creating new chat', { supabaseUserId, title });
    const chat = await behaviorChatRepository.createChat({
      supabaseUserId,
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
  async addMessage(supabaseUserId: string, data: CreateMessageData) {
    const belongs = await behaviorChatRepository.belongsToUser(data.chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }

    const message = await behaviorChatRepository.addMessage(data);

    // Extract and log behaviors from user messages
    if (data.speaker === 'user') {
      // Non-blocking behavior extraction — errors don't fail message creation
      setImmediate(async () => {
        try {
          const extractedBehaviors = extractBehaviors(data.text);
          
          for (const behavior of extractedBehaviors) {
            try {
              await createBehaviorLog({
                chatId: data.chatId,
                supabaseUserId,
                behaviorType: behavior.type,
                intensity: behavior.intensity,
                description: behavior.description,
                context: behavior.context,
                extractedFrom: data.text,
                confidence: behavior.confidence,
              });
            } catch (logError) {
              logger.warn('[BehaviorChat] Failed to create behavior log', {
                error: (logError as Error).message,
                behaviorType: behavior.type,
              });
            }
          }

          if (extractedBehaviors.length > 0) {
            logger.debug('[BehaviorChat] Extracted behaviors', {
              supabaseUserId,
              chatId: data.chatId,
              count: extractedBehaviors.length,
              types: extractedBehaviors.map(b => b.type),
            });
          }
        } catch (error) {
          logger.error('[BehaviorChat] Error extracting behaviors', { 
            error: (error as Error).message,
            stack: (error as Error).stack,
          });
        }
      });
    }

    // Auto-update title from first user message
    const chat = await behaviorChatRepository.findById(data.chatId);
    if (chat && data.speaker === 'user') {
      const userMessages = chat.messages.filter((m: { speaker: string }) => m.speaker === 'user');
      if (userMessages.length === 1) {
        const newTitle = data.text.slice(0, 30) + (data.text.length > 30 ? '…' : '');
        await behaviorChatRepository.updateTitle(data.chatId, newTitle);
      }
    }

    return message;
  }

  /** Delete a chat (with ownership check) */
  async deleteChat(supabaseUserId: string, chatId: string): Promise<void> {
    const belongs = await behaviorChatRepository.belongsToUser(chatId, supabaseUserId);
    if (!belongs) {
      throw new AppError('Chat not found', 404);
    }

    logger.info('[BehaviorChat] Deleting chat', { supabaseUserId, chatId });
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
