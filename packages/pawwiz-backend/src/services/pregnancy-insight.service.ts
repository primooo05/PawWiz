/**
 * Service Layer — Pregnancy Insight (Flo-style "insight cards")
 *
 * Runs AFTER every daily-log upsert, fire-and-forget. Two guarantees:
 *   1. Async — a failure here never blocks or errors the log-submit response.
 *   2. Idempotent — the same detected pattern does not spawn a fresh card on
 *      every subsequent log; existing (unread) cards of the same kind are
 *      reused, and one-shot milestones are created at most once per session.
 */

import { pregnancySessionRepository } from '../repositories/pregnancy-session.repository.js';
import { pregnancyLogRepository } from '../repositories/pregnancy-log.repository.js';
import { pregnancyInsightRepository } from '../repositories/pregnancy-insight.repository.js';
import { AppError } from '../utils/errors.js';
import { computeGestationWeek } from '../utils/gestation.js';
import { logger } from '../utils/winston.js';
import type { PregnancyInsightCard, PregnancyInsightType } from '../types/shared.js';
import type { PregnancyInsight, PregnancyLog } from '@prisma/client';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const LABOR_TEMP_THRESHOLD_C = 37.8; // temp drop below this often precedes labor <24h
const APPETITE_DROP_STREAK = 3;
const NESTING_STREAK = 2;
const LOGGING_GAP_DAYS = 3;

/** Internal insight-kind key stored in the DB → public card category. */
const CATEGORY_BY_KEY: Record<string, PregnancyInsightType> = {
  appetite_drop: 'pattern_detected',
  nesting_streak: 'milestone_reached',
  labor_temp_warning: 'warning',
  logging_gap: 'vet_reminder',
  milestone_week_5: 'milestone_reached',
  milestone_week_7: 'milestone_reached',
  milestone_week_9: 'milestone_reached',
};

function utcDayNumber(d: Date): number {
  return Math.floor(new Date(d).getTime() / MS_PER_DAY);
}

/**
 * Length of the run of consecutive calendar days (ending at the most recent
 * log) for which `predicate` holds. Assumes at most one log per day.
 */
function consecutiveStreak(logsDesc: PregnancyLog[], predicate: (log: PregnancyLog) => boolean): number {
  let streak = 0;
  let prevDay: number | null = null;
  for (const log of logsDesc) {
    const day = utcDayNumber(log.logDate);
    const matches = predicate(log);
    if (prevDay === null) {
      if (!matches) break;
      streak = 1;
      prevDay = day;
    } else if (day === prevDay - 1 && matches) {
      streak += 1;
      prevDay = day;
    } else {
      break;
    }
  }
  return streak;
}

export function mapInsightToCard(insight: PregnancyInsight): PregnancyInsightCard {
  return {
    id: insight.id,
    insightType: CATEGORY_BY_KEY[insight.insightType] ?? 'pattern_detected',
    title: insight.title,
    body: insight.body,
    gestationWeek: insight.gestationWeek,
    isRead: insight.isRead,
    createdAt: insight.createdAt.toISOString(),
  };
}

class PregnancyInsightService {
  /**
   * Evaluate logged data for notable patterns and persist new insight cards.
   * Never throws — all failures are swallowed and logged.
   */
  async evaluatePatterns(sessionId: string): Promise<void> {
    try {
      const session = await pregnancySessionRepository.findById(sessionId);
      if (!session || session.status !== 'active') return;

      const now = new Date();
      const currentWeek = computeGestationWeek(session.matingDate, now);
      const logsDesc = await pregnancyLogRepository.findAll(sessionId); // newest-first

      // 1. Appetite drop 3+ consecutive days → pattern card.
      const appetiteStreak = consecutiveStreak(
        logsDesc,
        (l) => l.appetiteLevel === 'reduced' || l.appetiteLevel === 'none',
      );
      if (appetiteStreak >= APPETITE_DROP_STREAK) {
        await this.createIfAbsent(sessionId, 'appetite_drop', currentWeek, {
          title: `Appetite has dropped ${appetiteStreak} days in a row`,
          body: 'A sustained appetite drop is common as pregnancy progresses, especially near nesting. Offer smaller, more frequent meals and monitor water intake. Flag it to your vet if it persists.',
        });
      }

      // 2. Nesting observed 2+ consecutive days during weeks 7–9 → milestone.
      if (currentWeek >= 7 && currentWeek <= 9) {
        const nestingStreak = consecutiveStreak(
          logsDesc,
          (l) => l.nestingObserved || l.symptoms.includes('nesting'),
        );
        if (nestingStreak >= NESTING_STREAK) {
          await this.createIfAbsent(sessionId, 'nesting_streak', currentWeek, {
            title: 'Nesting behavior is ramping up',
            body: 'Consistent nesting in weeks 7–9 signals labor is approaching. Set up a quiet, warm birthing box in her chosen spot and keep it stocked with clean bedding.',
          });
        }
      }

      // 3. Temperature below ~37.8 °C → high-priority labor warning.
      const latest = logsDesc[0];
      if (latest?.temp != null && latest.temp < LABOR_TEMP_THRESHOLD_C) {
        await this.createIfAbsent(sessionId, 'labor_temp_warning', currentWeek, {
          title: 'Temperature drop detected — labor may be near',
          body: `A recorded temperature of ${latest.temp.toFixed(1)}°C is below the ~37.8°C threshold that often precedes labor within 24 hours. Keep her calm, monitor closely, and have your vet's number ready.`,
        });
      }

      // 4. No log for 3+ days → gentle logging-gap reminder.
      if (latest) {
        const gapDays = Math.floor((now.getTime() - new Date(latest.logDate).getTime()) / MS_PER_DAY);
        if (gapDays >= LOGGING_GAP_DAYS) {
          await this.createIfAbsent(sessionId, 'logging_gap', currentWeek, {
            title: `It's been ${gapDays} days since your last log`,
            body: 'Regular daily logging helps surface patterns early. A quick chip tap keeps her timeline complete.',
          });
        }
      }

      // 5. Milestone transitions — entering week 5, 7, or 9 (one-shot per session).
      if (currentWeek === 5 || currentWeek === 7 || currentWeek === 9) {
        const key = `milestone_week_${currentWeek}`;
        const bodies: Record<number, string> = {
          5: 'Week 5 — fetal swell. Her abdomen will start to visibly round out. Keep meals nutrient-dense and let her rest as much as she wants.',
          7: 'Week 7 — nesting search. She may start hunting for quiet, safe spots. Offer a birthing box now so she can settle in before labor.',
          9: 'Week 9 — labor prep. Kittens are fully developed and delivery is imminent. Watch for temperature drops, restlessness, and contractions.',
        };
        await this.createOnce(sessionId, key, currentWeek, {
          title: `Entering Week ${currentWeek}`,
          body: bodies[currentWeek],
        });
      }
    } catch (error) {
      logger.error('[PregnancyInsight] evaluatePatterns failed', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Create a recurring insight only if no UNREAD card of this kind exists.
   * Once the user reads/dismisses it, a fresh occurrence of the pattern can
   * surface a new card.
   */
  private async createIfAbsent(
    sessionId: string,
    key: string,
    gestationWeek: number,
    content: { title: string; body: string },
  ): Promise<void> {
    if (await pregnancyInsightRepository.existsUnread(sessionId, key)) return;
    await pregnancyInsightRepository.createInsight({
      pregnancySessionId: sessionId,
      insightType: key,
      title: content.title,
      body: content.body,
      gestationWeek,
    });
  }

  /** Create a one-shot insight at most once per session (any read state). */
  private async createOnce(
    sessionId: string,
    key: string,
    gestationWeek: number,
    content: { title: string; body: string },
  ): Promise<void> {
    if (await pregnancyInsightRepository.existsByType(sessionId, key)) return;
    await pregnancyInsightRepository.createInsight({
      pregnancySessionId: sessionId,
      insightType: key,
      title: content.title,
      body: content.body,
      gestationWeek,
    });
  }

  /** Unread insight cards for a session, ownership pre-verified by the caller. */
  async getUnread(sessionId: string): Promise<PregnancyInsightCard[]> {
    const rows = await pregnancyInsightRepository.findUnread(sessionId);
    return rows.map(mapInsightToCard);
  }

  /**
   * Mark a single insight read after verifying the authenticated user owns the
   * cat behind its session.
   */
  async markRead(insightId: string, supabaseUserId: string): Promise<PregnancyInsightCard> {
    const insight = await pregnancyInsightRepository.findByIdWithOwner(insightId);
    if (!insight) throw AppError.notFound('Insight not found');
    if (insight.pregnancySession.cat.profile?.supabaseUserId !== supabaseUserId) {
      throw AppError.forbidden('You do not have permission to modify this insight.');
    }
    const updated = await pregnancyInsightRepository.markRead(insightId);
    return mapInsightToCard(updated);
  }
}

export const pregnancyInsightService = new PregnancyInsightService();
