import { prisma } from '../lib/prisma.js';

export interface CreatePregnancyInsightData {
  pregnancySessionId: string;
  insightType: string;
  title: string;
  body: string;
  gestationWeek: number;
}

/**
 * Repository — PregnancyInsight
 * Sole Prisma-access layer for pregnancy_insights.
 */
class PregnancyInsightRepository {
  async createInsight(data: CreatePregnancyInsightData) {
    return prisma.pregnancyInsight.create({ data });
  }

  /** Unread insight cards for a session, newest-first. */
  async findUnread(sessionId: string) {
    return prisma.pregnancyInsight.findMany({
      where: { pregnancySessionId: sessionId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Idempotency probe — is there already an unread insight of this type
   * (optionally scoped to a specific gestation week) for this session?
   * Prevents the same pattern regenerating a fresh card on every log submit.
   */
  async existsUnread(sessionId: string, insightType: string, gestationWeek?: number): Promise<boolean> {
    const count = await prisma.pregnancyInsight.count({
      where: {
        pregnancySessionId: sessionId,
        insightType,
        isRead: false,
        ...(gestationWeek !== undefined ? { gestationWeek } : {}),
      },
    });
    return count > 0;
  }

  /**
   * Existence probe ignoring read state — used for one-shot insights (e.g.
   * week milestones) that must never regenerate for a session even after the
   * user has dismissed the card.
   */
  async existsByType(sessionId: string, insightType: string): Promise<boolean> {
    const count = await prisma.pregnancyInsight.count({
      where: { pregnancySessionId: sessionId, insightType },
    });
    return count > 0;
  }

  async findByIdWithOwner(id: string) {
    return prisma.pregnancyInsight.findUnique({
      where: { id },
      include: {
        pregnancySession: {
          select: {
            id: true,
            cat: { select: { id: true, profile: { select: { supabaseUserId: true } } } },
          },
        },
      },
    });
  }

  async markRead(insightId: string) {
    return prisma.pregnancyInsight.update({
      where: { id: insightId },
      data: { isRead: true },
    });
  }
}

export const pregnancyInsightRepository = new PregnancyInsightRepository();
