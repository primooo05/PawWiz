import { prisma } from '../lib/prisma.js';

export interface CreatePregnancySessionData {
  catId: string;
  matingDate: Date;
  expectedDeliveryDate: Date;
}

/**
 * Repository — PregnancySession
 * Sole Prisma-access layer for pregnancy_sessions.
 */
class PregnancySessionRepository {
  /** The single active session for a cat (there can only be one at a time). */
  async findActiveByCatId(catId: string) {
    return prisma.pregnancySession.findFirst({
      where: { catId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.pregnancySession.findUnique({ where: { id } });
  }

  /**
   * Session joined to its owning cat/profile — used for ownership checks on
   * log/insight endpoints without a second round-trip.
   */
  async findByIdWithOwner(id: string) {
    return prisma.pregnancySession.findUnique({
      where: { id },
      include: {
        cat: { select: { id: true, profile: { select: { supabaseUserId: true } } } },
      },
    });
  }

  async create(data: CreatePregnancySessionData) {
    return prisma.pregnancySession.create({
      data: {
        catId: data.catId,
        matingDate: data.matingDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        status: 'active',
      },
    });
  }

  async complete(id: string) {
    return prisma.pregnancySession.update({
      where: { id },
      data: { status: 'completed' },
    });
  }
}

export const pregnancySessionRepository = new PregnancySessionRepository();
