import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export interface UpsertPregnancyLogData {
  symptoms: string[];
  moodBehavior: string[];
  appetiteLevel?: string | null;
  energyLevel?: string | null;
  nestingObserved: boolean;
  weight?: number | null;
  temp?: number | null;
  notes?: string | null;
  gestationWeek: number;
  logDate: Date;
}

/** UTC day bounds for a given instant. */
function utcDayBounds(at: Date): { start: Date; end: Date } {
  const start = new Date(at);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(at);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Repository — PregnancyLog
 * Sole Prisma-access layer for pregnancy_logs.
 */
class PregnancyLogRepository {
  /** The (at most one) log recorded for the same UTC day as `date`. */
  async findTodayLog(sessionId: string, date: Date) {
    const { start, end } = utcDayBounds(date);
    return prisma.pregnancyLog.findFirst({
      where: { pregnancySessionId: sessionId, logDate: { gte: start, lte: end } },
    });
  }

  async findByWeek(sessionId: string, week: number) {
    return prisma.pregnancyLog.findMany({
      where: { pregnancySessionId: sessionId, gestationWeek: week },
      orderBy: { logDate: 'desc' },
    });
  }

  /** All logs on/after `since`, newest-first. Used for the recent-days summary. */
  async findRecentDays(sessionId: string, since: Date) {
    return prisma.pregnancyLog.findMany({
      where: { pregnancySessionId: sessionId, logDate: { gte: since } },
      orderBy: { logDate: 'desc' },
    });
  }

  /** Full log history, newest-first — grouped by week in the service. */
  async findAll(sessionId: string) {
    return prisma.pregnancyLog.findMany({
      where: { pregnancySessionId: sessionId },
      orderBy: { logDate: 'desc' },
    });
  }

  /**
   * Flo's "one log per day, editable not duplicated" invariant, enforced at the
   * data layer: create a log for today, or update the existing one in place.
   * Wrapped in a transaction so the find-then-write can't race a concurrent
   * double-submit into two rows for the same day.
   */
  async upsertTodayLog(sessionId: string, data: UpsertPregnancyLogData) {
    const { start, end } = utcDayBounds(data.logDate);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.pregnancyLog.findFirst({
        where: { pregnancySessionId: sessionId, logDate: { gte: start, lte: end } },
        select: { id: true },
      });

      const payload: Prisma.PregnancyLogUncheckedCreateInput = {
        pregnancySessionId: sessionId,
        symptoms: data.symptoms,
        moodBehavior: data.moodBehavior,
        appetiteLevel: data.appetiteLevel ?? null,
        energyLevel: data.energyLevel ?? null,
        nestingObserved: data.nestingObserved,
        weight: data.weight ?? null,
        temp: data.temp ?? null,
        notes: data.notes ?? null,
        gestationWeek: data.gestationWeek,
        logDate: data.logDate,
      };

      if (existing) {
        const { pregnancySessionId: _ignored, logDate: _logDate, ...updatable } = payload;
        return tx.pregnancyLog.update({ where: { id: existing.id }, data: updatable });
      }

      return tx.pregnancyLog.create({ data: payload });
    });
  }

  async deleteLog(sessionId: string, date: Date) {
    const { start, end } = utcDayBounds(date);
    return prisma.pregnancyLog.deleteMany({
      where: { pregnancySessionId: sessionId, logDate: { gte: start, lte: end } }
    });
  }
}

export const pregnancyLogRepository = new PregnancyLogRepository();
