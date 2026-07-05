/**
 * Service Layer — Quick Log
 * One-tap behavior logging that bypasses the conversational chat flow.
 * Anchors entries to the user's reserved "Quick Logs" chat and delegates
 * persistence to the behavior-log repository, so quick logs flow into the
 * same analytics pipeline as chat-extracted behaviors.
 * Singleton Pattern — exported as a single instance.
 */

import { behaviorChatRepository } from '../repositories/behavior-chat.repository.js';
import {
  createBehaviorLog,
  findRecentByTypeForUser,
} from '../repositories/behavior-log.repository.js';
import type { BehaviorLog } from '@prisma/client';
import type { QuickLogBehaviorInput } from '../schemas/quick-log.schemas.js';
import { logger } from '../utils/winston.js';

/** Human-readable descriptions for each one-tap behavior. */
const BEHAVIOR_LABELS: Record<string, string> = {
  playful: 'Playful / energetic',
  affectionate: 'Affectionate / seeking attention',
  vocal: 'Vocalizing / meowing',
  anxious: 'Anxious / stressed',
  aggressive: 'Aggressive / defensive',
  lethargic: 'Lethargic / low energy',
};

/**
 * Dedup window (ms). Re-tapping the same behavior within this window is treated
 * as the same observation and collapsed onto the existing log rather than
 * creating a duplicate — this stops rapid/accidental taps from inflating the
 * event counts that drive the dashboard's concern flags.
 */
const DEDUP_WINDOW_MS = 60_000;

class QuickLogService {
  /**
   * Record a single, user-reported behavior with one tap.
   * Confidence is 1.0 — the observation comes directly from the owner, not
   * from AI/heuristic extraction.
   *
   * Idempotent within DEDUP_WINDOW_MS: if the same behavior type was just
   * logged, the existing entry is returned instead of writing a duplicate.
   */
  async logBehavior(
    supabaseUserId: string,
    input: QuickLogBehaviorInput
  ): Promise<BehaviorLog> {
    // Collapse rapid identical taps onto the most recent matching log.
    const recent = await findRecentByTypeForUser(
      supabaseUserId,
      input.behaviorType,
      new Date(Date.now() - DEDUP_WINDOW_MS),
      input.catId
    );
    if (recent) {
      logger.debug('[QuickLog] Deduped rapid repeat tap', {
        supabaseUserId,
        behaviorType: input.behaviorType,
      });
      return recent;
    }

    const chat = await behaviorChatRepository.findOrCreateQuickLogChat(supabaseUserId);

    const label = BEHAVIOR_LABELS[input.behaviorType] ?? input.behaviorType;

    const log = await createBehaviorLog({
      chatId: chat.id,
      supabaseUserId,
      catId: input.catId,
      behaviorType: input.behaviorType,
      intensity: input.intensity,
      description: `Quick log: ${label}`,
      context: input.context ?? 'quick log',
      extractedFrom: 'quick-log',
      confidence: 1,
    });

    logger.debug('[QuickLog] Behavior logged', {
      supabaseUserId,
      behaviorType: input.behaviorType,
      intensity: input.intensity,
    });

    return log;
  }
}

/** Singleton instance */
export const quickLogService = new QuickLogService();
