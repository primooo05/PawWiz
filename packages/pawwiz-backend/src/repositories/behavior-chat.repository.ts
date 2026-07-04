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
  title?: string;
}

export interface CreateMessageData {
  chatId: string;
  speaker: 'wiz' | 'user';
  text: string;
  analysis?: Record<string, unknown> | null;
}

export type ChatWithMessages = BehaviorChat & { messages: BehaviorMessage[] };

class BehaviorChatRepository {
  /** Get all chats for a user (ordered newest first, messages ordered by creation) */
  async findAllByUser(supabaseUserId: string): Promise<ChatWithMessages[]> {
    return prisma.behaviorChat.findMany({
      where: { supabaseUserId },
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
