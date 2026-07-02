/**
 * Behavior Log Repository
 * Handles all database operations for behavior tracking
 */

import { prisma } from '../lib/prisma.js';
import type { BehaviorLog } from '@prisma/client';

export interface CreateBehaviorLogInput {
  chatId: string;
  supabaseUserId: string;
  catId?: string;
  behaviorType: string;
  intensity: 'mild' | 'moderate' | 'severe';
  description: string;
  context?: string;
  extractedFrom: string;
  confidence?: number;
}

/**
 * Create a new behavior log entry
 */
export async function createBehaviorLog(input: CreateBehaviorLogInput): Promise<BehaviorLog> {
  return prisma.behaviorLog.create({
    data: {
      chatId: input.chatId,
      supabaseUserId: input.supabaseUserId,
      catId: input.catId,
      behaviorType: input.behaviorType,
      intensity: input.intensity,
      description: input.description,
      context: input.context,
      extractedFrom: input.extractedFrom,
      confidence: input.confidence ?? 0.5,
    },
  });
}

/**
 * Get all behavior logs for a user's cat
 */
export async function getBehaviorLogsForUser(
  supabaseUserId: string,
  catId?: string,
  days: number = 7
): Promise<BehaviorLog[]> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const whereClause: any = {
    supabaseUserId,
    createdAt: { gte: cutoffDate },
  };

  if (catId) {
    whereClause.catId = catId;
  }

  return prisma.behaviorLog.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get behavior logs for a specific chat
 */
export async function getBehaviorLogsForChat(chatId: string): Promise<BehaviorLog[]> {
  return prisma.behaviorLog.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get behavior type frequency (for pattern analysis)
 */
export async function getBehaviorTypeFrequency(
  supabaseUserId: string,
  days: number = 7
): Promise<Array<{ type: string; count: number }>> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await prisma.behaviorLog.groupBy({
    by: ['behaviorType'],
    where: {
      supabaseUserId,
      createdAt: { gte: cutoffDate },
    },
    _count: true,
  });

  return result.map((item: any) => ({
    type: item.behaviorType,
    count: item._count,
  }));
}

/**
 * Get average intensity by behavior type
 */
export async function getAverageIntensityByType(
  supabaseUserId: string,
  behaviorType: string,
  days: number = 7
): Promise<{ mild: number; moderate: number; severe: number }> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await prisma.behaviorLog.findMany({
    where: {
      supabaseUserId,
      behaviorType,
      createdAt: { gte: cutoffDate },
    },
    select: { intensity: true },
  });

  const counts = { mild: 0, moderate: 0, severe: 0 };
  for (const log of logs) {
    counts[log.intensity as keyof typeof counts]++;
  }

  return counts;
}

/**
 * Delete behavior logs for a specific chat
 */
export async function deleteBehaviorLogsForChat(chatId: string): Promise<number> {
  const result = await prisma.behaviorLog.deleteMany({
    where: { chatId },
  });
  return result.count;
}

/**
 * Get all unique behavior types observed for a user
 */
export async function getUniqueBehaviorTypes(
  supabaseUserId: string,
  days: number = 7
): Promise<string[]> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await prisma.behaviorLog.findMany({
    where: {
      supabaseUserId,
      createdAt: { gte: cutoffDate },
    },
    distinct: ['behaviorType'],
    select: { behaviorType: true },
  });

  return result.map(r => r.behaviorType);
}
