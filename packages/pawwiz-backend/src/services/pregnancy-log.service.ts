/**
 * Service Layer — Pregnancy Log (Flo-style daily logging core)
 *
 * Enforces the three Flo invariants:
 *   1. One log per day, editable not duplicated (repo upsertTodayLog).
 *   2. Chips are the primary input; measurements/notes are optional.
 *   3. Insight generation is async + idempotent (fire-and-forget after save).
 *
 * gestationWeek is ALWAYS computed server-side from the session's matingDate —
 * never trusted from the client — so manipulated week values can't skew the
 * insight pattern detection.
 */

import { pregnancyLogRepository } from '../repositories/pregnancy-log.repository.js';
import { verifySessionOwnership } from './pregnancy-access.js';
import { pregnancyInsightService } from './pregnancy-insight.service.js';
import { AppError } from '../utils/errors.js';
import { stripHtmlTags } from '../middleware/sanitizer.js';
import { computeGestationWeek, phaseForWeek } from '../utils/gestation.js';
import { logger } from '../utils/winston.js';
import { prisma } from '../lib/prisma.js';
import type { CreateLogInput } from '../schemas/pregnancy.schemas.js';
import type {
  PregnancyLogEntry,
  WeeklyLogGroup,
  SymptomChip,
  MoodChip,
  AppetiteLevel,
  EnergyLevel,
} from '../types/shared.js';
import type { PregnancyLog } from '@prisma/client';

/** Map a Prisma PregnancyLog row to the API-facing entry (dates → ISO). */
export function mapLogToEntry(log: PregnancyLog): PregnancyLogEntry {
  return {
    id: log.id,
    pregnancySessionId: log.pregnancySessionId,
    symptoms: log.symptoms as SymptomChip[],
    moodBehavior: log.moodBehavior as MoodChip[],
    appetiteLevel: (log.appetiteLevel as AppetiteLevel | null) ?? null,
    energyLevel: (log.energyLevel as EnergyLevel | null) ?? null,
    nestingObserved: log.nestingObserved,
    weight: log.weight ?? null,
    temp: log.temp ?? null,
    notes: log.notes ?? null,
    gestationWeek: log.gestationWeek,
    logDate: log.logDate.toISOString(),
    createdAt: log.createdAt.toISOString(),
  };
}

/** Group logs (any order) into week buckets, weeks descending, logs newest-first. */
export function groupByWeek(logs: PregnancyLog[]): WeeklyLogGroup[] {
  const byWeek = new Map<number, PregnancyLog[]>();
  for (const log of logs) {
    const bucket = byWeek.get(log.gestationWeek);
    if (bucket) bucket.push(log);
    else byWeek.set(log.gestationWeek, [log]);
  }

  return Array.from(byWeek.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([week, weekLogs]) => ({
      week,
      phase: phaseForWeek(week),
      logs: weekLogs
        .sort((a, b) => b.logDate.getTime() - a.logDate.getTime())
        .map(mapLogToEntry),
    }));
}

class PregnancyLogService {
  /**
   * Upsert today's log. Ownership-checked, week computed server-side, notes
   * sanitized, then insight evaluation is triggered fire-and-forget.
   */
  async upsertDailyLog(
    supabaseUserId: string,
    payload: CreateLogInput,
  ): Promise<PregnancyLogEntry> {
    const session = await verifySessionOwnership(payload.sessionId, supabaseUserId);
    if (session.status !== 'active') {
      throw AppError.badRequest('Cannot log against a completed pregnancy session.');
    }

    const now = payload.logDate ? new Date(payload.logDate) : new Date();
    const gestationWeek = computeGestationWeek(session.matingDate, now);

    // Notes are already HTML-stripped by the global sanitizer middleware; strip
    // again defensively (belt and braces) and normalise empty → null.
    const cleanedNotes =
      payload.notes != null ? stripHtmlTags(payload.notes).trim() : '';

    const saved = await pregnancyLogRepository.upsertTodayLog(payload.sessionId, {
      symptoms: payload.symptoms,
      moodBehavior: payload.moodBehavior,
      appetiteLevel: payload.appetiteLevel ?? null,
      energyLevel: payload.energyLevel ?? null,
      nestingObserved: payload.nestingObserved,
      weight: payload.weight ?? null,
      temp: payload.temp ?? null,
      notes: cleanedNotes.length > 0 ? cleanedNotes : null,
      gestationWeek,
      logDate: now,
    });

    // Sync weight back to DietProfile if logged in pregnancy tracker
    if (payload.weight != null) {
      await prisma.dietProfile.updateMany({
        where: { catId: session.catId },
        data: { weight: payload.weight },
      });
    }

    // Fire-and-forget: insight generation runs in the background so it never
    // blocks or fails the log-submit response.
    void pregnancyInsightService.evaluatePatterns(payload.sessionId).catch((error) => {
      logger.error('[PregnancyLog] async insight evaluation failed', {
        sessionId: payload.sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    return mapLogToEntry(saved);
  }

  /** Weekly-grouped history for the scrollable log view; optional week filter. */
  async getHistory(
    supabaseUserId: string,
    sessionId: string,
    week?: number,
  ): Promise<WeeklyLogGroup[]> {
    await verifySessionOwnership(sessionId, supabaseUserId);
    const logs =
      week !== undefined
        ? await pregnancyLogRepository.findByWeek(sessionId, week)
        : await pregnancyLogRepository.findAll(sessionId);
    return groupByWeek(logs);
  }

  async deleteDailyLog(
    supabaseUserId: string,
    sessionId: string,
    dateStr: string,
  ): Promise<void> {
    await verifySessionOwnership(sessionId, supabaseUserId);
    const date = new Date(dateStr);
    await pregnancyLogRepository.deleteLog(sessionId, date);
  }
}

export const pregnancyLogService = new PregnancyLogService();
