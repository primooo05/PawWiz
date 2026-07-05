/**
 * Repository Layer — Behavior Chat
 * Encapsulates all Prisma queries for BehaviorChat and BehaviorMessage models.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import type { BehaviorChat, BehaviorMessage } from '@prisma/client';

export interface CreateChatData {
  supabaseUserId: string;
  catId?: string | null;
  title?: string;
}

export interface CreateMessageData {
  chatId: string;
  speaker: 'wiz' | 'user';
  text: string;
  analysis?: Record<string, unknown> | null;
}

export type ChatWithMessages = BehaviorChat & { messages: BehaviorMessage[] };

/** Title used for the hidden, per-user chat that anchors one-tap Quick Log entries. */
export const QUICK_LOG_CHAT_TITLE = 'Quick Logs';

class BehaviorChatRepository {
  /**
   * Find (or lazily create) the dedicated "Quick Logs" chat for a user.
   * Quick-logged behaviors need a parent BehaviorChat (BehaviorLog.chatId is
   * required + cascades), so we anchor them all to a single reserved chat per
   * user instead of polluting the user's real conversation list.
   */
  async findOrCreateQuickLogChat(supabaseUserId: string): Promise<BehaviorChat> {
    const existing = await prisma.behaviorChat.findFirst({
      where: { supabaseUserId, title: QUICK_LOG_CHAT_TITLE },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) return existing;

    return prisma.behaviorChat.create({
      data: { supabaseUserId, title: QUICK_LOG_CHAT_TITLE },
    });
  }

  /** Get all chats for a user (ordered newest first, messages ordered by creation).
   *  When catId is provided, returns only chats for that cat.
   *  Excludes the reserved "Quick Logs" anchor chat — it holds one-tap behavior
   *  entries, not a real conversation, so it never surfaces in the chat list. */
  async findAllByUser(supabaseUserId: string, catId?: string | null): Promise<ChatWithMessages[]> {
    return prisma.behaviorChat.findMany({
      where: {
        supabaseUserId,
        title: { not: QUICK_LOG_CHAT_TITLE },
        // When catId is supplied, scope to that cat.
        // When omitted (legacy callers), return all chats regardless of catId.
        ...(catId != null ? { catId } : {}),
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** Get a single chat with messages */
  async findById(id: string): Promise<ChatWithMessages | null> {
    return prisma.behaviorChat.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  /** Create a new chat session */
  async createChat(data: CreateChatData): Promise<BehaviorChat> {
    return prisma.behaviorChat.create({
      data: {
        supabaseUserId: data.supabaseUserId,
        catId: data.catId ?? null,
        title: data.title || 'New Chat',
      },
    });
  }

  /** Update chat title */
  async updateTitle(id: string, title: string): Promise<BehaviorChat> {
    return prisma.behaviorChat.update({
      where: { id },
      data: { title },
    });
  }

  /** Add a message to a chat (atomic: chat touch + message insert commit together) */
  async addMessage(data: CreateMessageData): Promise<BehaviorMessage> {
    return prisma.$transaction(async (tx) => {
      // Touch the chat's updatedAt so ordering stays consistent with the insert.
      await tx.behaviorChat.update({
        where: { id: data.chatId },
        data: { updatedAt: new Date() },
      });

      return tx.behaviorMessage.create({
        data: {
          chatId: data.chatId,
          speaker: data.speaker,
          text: data.text,
          analysis: data.analysis ? (data.analysis as any) : undefined,
        },
      });
    });
  }

  /** Delete a chat and all its messages (cascade) */
  async deleteChat(id: string): Promise<void> {
    await prisma.behaviorChat.delete({ where: { id } });
  }

  /** Verify a chat belongs to a user */
  async belongsToUser(chatId: string, supabaseUserId: string): Promise<boolean> {
    const count = await prisma.behaviorChat.count({
      where: { id: chatId, supabaseUserId },
    });
    return count > 0;
  }
}

/** Singleton instance */
export const behaviorChatRepository = new BehaviorChatRepository();
