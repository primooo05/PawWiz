/**
 * Service Layer — Pregnancy Session
 *
 * Owns session lifecycle (start / active-state assembly / complete) and builds
 * the full Flo-style ActiveSessionResponse: computed gestation fields, today's
 * log, the last-7-days summary, unread insight cards, and the week-grouped
 * history for the scroll view.
 */

import { pregnancySessionRepository } from '../repositories/pregnancy-session.repository.js';
import { pregnancyLogRepository } from '../repositories/pregnancy-log.repository.js';
import { verifyCatOwnership, verifySessionOwnership } from './pregnancy-access.js';
import { mapLogToEntry, groupByWeek } from './pregnancy-log.service.js';
import { pregnancyInsightService } from './pregnancy-insight.service.js';
import { AppError } from '../utils/errors.js';
import {
  computeGestationWeek,
  computeExpectedDelivery,
  daysBetween,
  daysRemaining,
} from '../utils/gestation.js';
import type { ActiveSessionResponse } from '../types/shared.js';

const RECENT_WINDOW_DAYS = 7;

class PregnancySessionService {
  /**
   * Start a new pregnancy session for a cat. Rejects if the cat already has an
   * active session (one active pregnancy at a time).
   */
  async startSession(
    supabaseUserId: string,
    catId: string,
    matingDate: Date,
  ): Promise<ActiveSessionResponse> {
    await verifyCatOwnership(catId, supabaseUserId);

    const existing = await pregnancySessionRepository.findActiveByCatId(catId);
    if (existing) {
      throw AppError.conflict('This cat already has an active pregnancy session.');
    }

    await pregnancySessionRepository.create({
      catId,
      matingDate,
      expectedDeliveryDate: computeExpectedDelivery(matingDate),
    });

    const response = await this.getActiveSession(supabaseUserId, catId);
    // Just created — response is guaranteed non-null.
    return response!;
  }

  /**
   * Assemble the full active-session state for a cat, or null when the cat has
   * no active session (frontend shows the "Start Pregnancy Tracker" CTA).
   */
  async getActiveSession(
    supabaseUserId: string,
    catId: string,
  ): Promise<ActiveSessionResponse | null> {
    await verifyCatOwnership(catId, supabaseUserId);

    const session = await pregnancySessionRepository.findActiveByCatId(catId);
    if (!session) return null;

    const now = new Date();
    const recentSince = new Date(now.getTime() - (RECENT_WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000);
    recentSince.setUTCHours(0, 0, 0, 0);

    const [todayLog, recentLogs, allLogs, insights] = await Promise.all([
      pregnancyLogRepository.findTodayLog(session.id, now),
      pregnancyLogRepository.findRecentDays(session.id, recentSince),
      pregnancyLogRepository.findAll(session.id),
      pregnancyInsightService.getUnread(session.id),
    ]);

    return {
      sessionId: session.id,
      catId: session.catId,
      matingDate: session.matingDate.toISOString(),
      expectedDeliveryDate: session.expectedDeliveryDate.toISOString(),
      daysPregnant: daysBetween(session.matingDate, now),
      gestationWeek: computeGestationWeek(session.matingDate, now),
      daysRemaining: daysRemaining(session.expectedDeliveryDate, now),
      status: session.status === 'completed' ? 'completed' : 'active',
      todayLog: todayLog ? mapLogToEntry(todayLog) : null,
      recentLogs: recentLogs.map(mapLogToEntry),
      insights,
      weeklyHistory: groupByWeek(allLogs),
    };
  }

  /** Mark a session completed (post-kittening). */
  async completeSession(supabaseUserId: string, sessionId: string): Promise<{ success: true }> {
    await verifySessionOwnership(sessionId, supabaseUserId);
    await pregnancySessionRepository.complete(sessionId);
    return { success: true };
  }
}

export const pregnancySessionService = new PregnancySessionService();
