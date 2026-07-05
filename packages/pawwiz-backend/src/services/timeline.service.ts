/**
 * Service Layer — Unified Health Timeline
 * Aggregates HealthEvent records from all four EventSources:
 *   behavior, diet (meal logs + profile updates + water), pregnancy, heat
 *
 * Pregnancy and heat models do not yet exist in the Prisma schema —
 * those sources are silently skipped (no error entry is added).
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import type { HealthEvent, EventSource, EventType } from '../types/shared.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AggregateOptions {
  startDate?: Date;
  endDate?: Date;
  sources?: EventSource[];
  /** 1–100, default 50 */
  limit?: number;
  /** Keyset pagination anchor — only events with occurredAt < cursor are returned */
  cursor?: Date;
}

export interface AggregateResult {
  events: HealthEvent[];
  pagination: { nextCursor: string | null; hasMore: boolean };
  errors: Array<{ source: EventSource; message: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Capitalise the first letter of a string, leave the rest unchanged. */
function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Truncate a string to maxLen chars. */
function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen);
}

/** Convert a Date to ISO 8601 UTC with ms precision: YYYY-MM-DDTHH:mm:ss.sssZ */
function toIso(date: Date): string {
  return date.toISOString();
}

/**
 * Sort HealthEvents descending by occurredAt, ties broken by id descending.
 * Exported so property tests can import it directly.
 */
export function sortHealthEvents(events: HealthEvent[]): HealthEvent[] {
  return [...events].sort((a, b) => {
    const tDiff = b.occurredAt.localeCompare(a.occurredAt);
    if (tDiff !== 0) return tDiff;
    return b.id.localeCompare(a.id);
  });
}

/**
 * Apply an inclusive [start, end] date range filter against the occurredAt field.
 * Exported so property tests can import it directly.
 */
export function applyDateFilter(
  events: HealthEvent[],
  start: Date,
  end: Date,
): HealthEvent[] {
  const startIso = toIso(start);
  const endIso = toIso(end);
  return events.filter(e => e.occurredAt >= startIso && e.occurredAt <= endIso);
}

// ─── Service class ────────────────────────────────────────────────────────────

class TimelineService {
  /**
   * Verify that the cat exists and is owned by the given Supabase user.
   *
   * Throws AppError.notFound if the cat does not exist.
   * Throws AppError.forbidden if the user does not own the cat.
   */
  async verifyOwnership(catId: string, supabaseUserId: string): Promise<void> {
    const cat = await prisma.cat.findUnique({
      where: { id: catId },
      select: {
        id: true,
        profile: { select: { supabaseUserId: true } },
      },
    });

    if (!cat) {
      throw AppError.notFound(`Cat not found: ${catId}`);
    }

    if (cat.profile?.supabaseUserId !== supabaseUserId) {
      throw AppError.forbidden('You do not have permission to access this cat\'s timeline.');
    }
  }

  /**
   * Aggregate all HealthEvents for a cat from all available sources.
   */
  async aggregateForCat(
    catId: string,
    supabaseUserId: string,
    opts: AggregateOptions = {},
  ): Promise<AggregateResult> {
    await this.verifyOwnership(catId, supabaseUserId);

    const limit = Math.min(opts.limit ?? 50, 100);
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = opts.startDate ?? defaultStart;
    const endDate = opts.endDate ?? now;

    const allowedSources: EventSource[] | undefined = opts.sources;
    const cursor: Date | undefined = opts.cursor;

    const allEvents: HealthEvent[] = [];
    const errors: Array<{ source: EventSource; message: string }> = [];

    // ── 1. Behavior source ──────────────────────────────────────────────────
    if (!allowedSources || allowedSources.includes('behavior')) {
      try {
        const behaviorLogs = await prisma.behaviorLog.findMany({
          where: {
            catId,
            createdAt: { gte: startDate, lte: endDate },
          },
          orderBy: { createdAt: 'desc' },
        });

        for (const log of behaviorLogs) {
          const occurredAt = toIso(log.createdAt);

          // Apply keyset cursor filter (strict less-than for desc-sorted pagination)
          if (cursor && occurredAt >= toIso(cursor)) continue;

          const rawDesc = log.description ?? log.context ?? '';
          const event: HealthEvent = {
            id: log.id,
            catId: catId,
            source: 'behavior',
            eventType: 'behavior_log',
            occurredAt,
            title: truncate(
              `${capitalizeFirst(log.behaviorType)} — ${capitalizeFirst(log.intensity)}`,
              80,
            ),
            description: truncate(rawDesc, 200),
            metadata: {
              behaviorType: log.behaviorType,
              intensity: log.intensity,
              confidence: log.confidence,
              mood: null, // BehaviorLog has no separate mood field
            },
          };
          allEvents.push(event);
        }
      } catch (err) {
        errors.push({
          source: 'behavior',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // ── 2. Diet source (meal logs + profile updates + water) ─────────────────
    if (!allowedSources || allowedSources.includes('diet')) {
      // 2a. Meal logs
      try {
        // DietProfile links to Cat via catId. We join through dietProfile to
        // find all meal logs that belong to this cat.
        const mealLogs = await prisma.dietMealLog.findMany({
          where: {
            dietProfile: { catId },
            createdAt: { gte: startDate, lte: endDate },
          },
          include: { dietProfile: { select: { catId: true } } },
          orderBy: { createdAt: 'desc' },
        });

        for (const log of mealLogs) {
          const occurredAt = toIso(log.createdAt);
          if (cursor && occurredAt >= toIso(cursor)) continue;

          const event: HealthEvent = {
            id: log.id,
            catId,
            source: 'diet',
            eventType: 'meal_logged',
            occurredAt,
            title: truncate(`${capitalizeFirst(log.mealName)} meal logged`, 80),
            description: truncate('', 200), // DietMealLog has no notes field
            metadata: {
              mealType: log.mealName,
              portionGrams: log.amount,
              foodName: log.foodType,
            },
          };
          allEvents.push(event);
        }
      } catch (err) {
        errors.push({
          source: 'diet',
          message: err instanceof Error ? err.message : String(err),
        });
      }

      // 2b. Diet profile updates (emit only when updatedAt differs from createdAt)
      try {
        const dietProfiles = await prisma.dietProfile.findMany({
          where: {
            catId,
            updatedAt: { gte: startDate, lte: endDate },
          },
          orderBy: { updatedAt: 'desc' },
        });

        for (const profile of dietProfiles) {
          // Only emit if updatedAt differs from createdAt (i.e., it was actually changed)
          const createdMs = profile.createdAt.getTime();
          const updatedMs = profile.updatedAt.getTime();
          if (Math.abs(updatedMs - createdMs) < 1000) continue; // within 1 s → creation, not an update

          const occurredAt = toIso(profile.updatedAt);
          if (cursor && occurredAt >= toIso(cursor)) continue;

          const event: HealthEvent = {
            id: `diet-profile-${profile.id}`,
            catId,
            source: 'diet',
            eventType: 'diet_profile_updated',
            occurredAt,
            title: 'Diet profile updated',
            description: 'Diet profile changed for cat',
            metadata: { profileId: profile.id },
          };
          allEvents.push(event);
        }
      } catch (err) {
        // Don't double-append if meal logs already added a diet error; append as a
        // distinct message since these are independent sub-queries.
        errors.push({
          source: 'diet',
          message: `diet_profile_updated: ${err instanceof Error ? err.message : String(err)}`,
        });
      }

      // 2c. Water intake
      // The DietMealLog model has no per-log water field; water is tracked as a
      // daily total on DietProfile.waterIntake. We emit one water_updated event
      // per DietProfile row whose updatedAt falls in range AND has waterIntake > 0.
      try {
        const waterProfiles = await prisma.dietProfile.findMany({
          where: {
            catId,
            waterIntake: { gt: 0 },
            updatedAt: { gte: startDate, lte: endDate },
          },
          orderBy: { updatedAt: 'desc' },
        });

        for (const profile of waterProfiles) {
          const occurredAt = toIso(profile.updatedAt);
          if (cursor && occurredAt >= toIso(cursor)) continue;

          const event: HealthEvent = {
            id: `water-${profile.id}-${profile.updatedAt.getTime()}`,
            catId,
            source: 'diet',
            eventType: 'water_updated',
            occurredAt,
            title: 'Water intake logged',
            description: `${profile.waterIntake} ml water recorded`,
            metadata: { waterMl: profile.waterIntake },
          };
          allEvents.push(event);
        }
      } catch (err) {
        errors.push({
          source: 'diet',
          message: `water_updated: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // ── 3. Pregnancy source ─────────────────────────────────────────────────
    // No PregnancyLog model exists in the current Prisma schema.
    // This source is intentionally skipped until the model is added.
    // When it is added, implement normalization here using eventType
    // 'pregnancy_daily_log' / 'pregnancy_started'.

    // ── 4. Heat source ──────────────────────────────────────────────────────
    // No HeatCycle model exists in the current Prisma schema.
    // This source is intentionally skipped until the model is added.
    // When it is added, implement normalization here using eventType
    // 'heat_cycle_started'.

    // ── Merge, sort, paginate ───────────────────────────────────────────────
    const sorted = sortHealthEvents(allEvents);

    // Determine hasMore before slicing
    const hasMore = sorted.length > limit;
    const sliced = sorted.slice(0, limit);

    const nextCursor =
      hasMore && sliced.length > 0
        ? sliced[sliced.length - 1].occurredAt
        : null;

    return {
      events: sliced,
      pagination: { nextCursor, hasMore },
      errors,
    };
  }
}

export const timelineService = new TimelineService();
