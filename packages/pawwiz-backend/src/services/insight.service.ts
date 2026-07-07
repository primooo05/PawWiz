/**
 * Service Layer — AI Insight Engine
 * Orchestrates correlation detection, AI prompt construction, result caching,
 * background refresh jobs, and in-flight deduplication for health timeline insights.
 *
 * 3-tier failover: Groq (10s timeout) → Gemini (10s timeout) → Heuristic fallback.
 * Correlation types:
 *   - diet-to-behavior-shift
 *   - heat-or-pregnancy-to-behavior-shift
 *   - water-drop-to-lethargy
 *
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import { timelineRepository } from '../repositories/timeline.repository.js';
import { timelineService } from './timeline.service.js';
import { groqClient } from '../repositories/groq.repository.js';
import { geminiClient } from '../repositories/gemini.repository.js';
import { logger } from '../utils/winston.js';
import type { HealthEvent } from '../types/shared.js';
import type { HealthTimelineInsight } from '@prisma/client';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Proximity window for correlation detection: 72 hours in ms */
const PROXIMITY_WINDOW_MS = 72 * 60 * 60 * 1000;

/** 30 days in ms — look-back window for event fetching */
const LOOK_BACK_MS = 30 * 24 * 60 * 60 * 1000;

/** 24 hours in ms — cache validity window for insights */
const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000;

/** AI call timeout in ms */
const AI_TIMEOUT_MS = 10_000;

// ─── Heuristic responses ──────────────────────────────────────────────────────

const HEURISTIC_INSIGHTS: Record<string, { summary: string; detail: string; severity: 'info' | 'warning' | 'concern' }> = {
  'diet-to-behavior-shift': {
    summary: 'Diet change may be affecting behavior',
    detail: 'A diet change was followed by a behavior shift within 72 hours. Monitor closely.',
    severity: 'warning',
  },
  'heat-or-pregnancy-to-behavior-shift': {
    summary: 'Reproductive event correlates with behavior change',
    detail: 'A heat or pregnancy event coincides with a behavior shift. This is common but worth monitoring.',
    severity: 'info',
  },
  'water-drop-to-lethargy': {
    summary: 'Low water intake followed by lethargy',
    detail: 'Water intake dropped significantly before increased lethargic behavior. Consider veterinary follow-up.',
    severity: 'concern',
  },
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AiInsightResponse {
  type: string;
  summary: string;
  detail: string;
  severity: 'info' | 'warning' | 'concern';
}

interface CorrelationPair {
  correlationType: string;
  eventA: HealthEvent;
  eventB: HealthEvent;
  deltaHours: number;
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Sanitize user-supplied input before including it in AI prompts.
 * Replaces role-hijack patterns with [REDACTED] and truncates to 200 chars.
 * Exported for unit testing.
 */
export function sanitizeInsightInput(text: string): string {
  const sanitized = text.replace(
    /you are now|ignore (previous|all) instructions|act as|system:/gi,
    '[REDACTED]',
  );
  return sanitized.slice(0, 200);
}

/**
 * Check whether two HealthEvents fall within a given time window of each other.
 * Exported for unit testing.
 */
export function isWithinProximityWindow(
  eventA: HealthEvent,
  eventB: HealthEvent,
  windowMs: number,
): boolean {
  const delta = Math.abs(
    new Date(eventA.occurredAt).getTime() - new Date(eventB.occurredAt).getTime(),
  );
  return delta <= windowMs;
}

// ─── Timeout helper ───────────────────────────────────────────────────────────

function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms),
  );
}

// ─── Service class ────────────────────────────────────────────────────────────

class InsightService {
  /** Tracks in-flight refresh jobs: catId → true */
  private readonly inFlightMap = new Map<string, boolean>();

  /**
   * Return cached insights for a cat. If the cache is empty, kick off a
   * background refresh (fire-and-forget) and return [].
   */
  async getInsightsForCat(
    catId: string,
    opts?: { severity?: string },
  ): Promise<HealthTimelineInsight[]> {
    const severity = opts?.severity as 'info' | 'warning' | 'concern' | undefined;
    const results = await timelineRepository.findInsightsByCatId(catId, {
      severity,
      limit: 100,
    });

    if (results.length === 0) {
      this.triggerBackgroundRefresh(catId);
      return [];
    }

    return results;
  }

  /**
   * Fire-and-forget background refresh.
   * No-op if a refresh is already in progress for this cat.
   */
  triggerBackgroundRefresh(catId: string): void {
    if (this.inFlightMap.has(catId)) {
      logger.debug(`[InsightService] Background refresh skipped — already in-flight for cat ${catId}`);
      return;
    }

    // Fire and forget — intentionally not awaited
    void this._runRefresh(catId);
  }

  /**
   * Awaitable on-demand refresh.
   * Verifies that the caller owns the cat before running the refresh — prevents
   * any authenticated user from triggering AI processing of another tenant's
   * cat health data by supplying an arbitrary catId.
   * Sets the in-flight flag then runs the refresh.
   */
  async triggerOnDemandRefresh(catId: string, callerUserId: string): Promise<void> {
    // Ownership check using the caller's identity — NOT the cat's stored owner id.
    // This replaces the tautological check that previously supplied cat.profile.supabaseUserId
    // into a comparison against itself, which always succeeded for any existing cat.
    await timelineService.verifyOwnership(catId, callerUserId);

    this.inFlightMap.set(catId, true);
    await this._runRefresh(catId);
  }

  /**
   * Returns true if a refresh job is currently running for the given cat.
   */
  isRefreshInProgress(catId: string): boolean {
    return this.inFlightMap.has(catId);
  }

  // ─── Private implementation ────────────────────────────────────────────────

  /**
   * Core refresh pipeline: fetch events, detect correlations, call AI, persist.
   * Always cleans up the in-flight map on completion (success or error).
   */
  private async _runRefresh(catId: string): Promise<void> {
    this.inFlightMap.set(catId, true);

    try {
      // 1. Load the cat directly (bypass ownership check for internal system calls)
      const cat = await prisma.cat.findUnique({
        where: { id: catId },
        select: {
          id: true,
          name: true,
          sex: true,
          age: true,
          lifeStage: true,
          breed: true,
          profile: { select: { supabaseUserId: true } },
        },
      });

      if (!cat) {
        logger.warn(`[InsightService] Cat not found for refresh: ${catId}`);
        return;
      }

      const supabaseUserId = cat.profile?.supabaseUserId;
      if (!supabaseUserId) {
        logger.warn(`[InsightService] Cat ${catId} has no associated supabase user — skipping refresh`);
        return;
      }

      // 2. Fetch last 30 days of events using the real user identity
      const now = new Date();
      const startDate = new Date(now.getTime() - LOOK_BACK_MS);

      const aggregateResult = await timelineService.aggregateForCat(catId, supabaseUserId, {
        startDate,
        endDate: now,
        limit: 100,
      });

      const events = aggregateResult.events;

      if (events.length === 0) {
        logger.debug(`[InsightService] No events found for cat ${catId} in the last 30 days`);
        return;
      }

      // 3. Detect correlation pairs
      const correlationPairs = this._detectCorrelations(events);

      if (correlationPairs.length === 0) {
        logger.debug(`[InsightService] No correlations detected for cat ${catId}`);
        return;
      }

      // 4. For each pair: check cache, call AI, persist
      for (const pair of correlationPairs) {
        await this._processCorrelation(pair, cat);
      }
    } catch (err) {
      logger.error(`[InsightService] Refresh failed for cat ${catId}`, {
        error: (err as Error).message,
        stack: (err as Error).stack,
      });
    } finally {
      this.inFlightMap.delete(catId);
    }
  }

  /**
   * Detect all qualifying correlation pairs in the event stream.
   */
  private _detectCorrelations(events: HealthEvent[]): CorrelationPair[] {
    const pairs: CorrelationPair[] = [];

    // Partition events by type
    const dietEvents = events.filter(
      (e) => e.eventType === 'diet_profile_updated' || e.eventType === 'meal_logged',
    );
    const reproductiveEvents = events.filter(
      (e) => e.eventType === 'heat_cycle_started' || e.eventType === 'pregnancy_started',
    );
    const waterEvents = events.filter((e) => e.eventType === 'water_updated');
    const behaviorEvents = events.filter((e) => e.eventType === 'behavior_log');

    // ── a. diet-to-behavior-shift ──────────────────────────────────────────
    for (const dietEvent of dietEvents) {
      for (const behaviorEvent of behaviorEvents) {
        if (!isWithinProximityWindow(dietEvent, behaviorEvent, PROXIMITY_WINDOW_MS)) continue;

        const intensityLevels = ['mild', 'low', 'moderate', 'medium', 'high', 'severe', 'extreme'];
        const intensity = (behaviorEvent.metadata?.intensity as string | undefined)?.toLowerCase() ?? '';
        const intensityIndex = intensityLevels.indexOf(intensity);

        // Check for ≥2 frequency increase or ≥2 intensity level increase
        const meetsThreshold =
          intensityIndex >= 2 || // at least "moderate" level (index 2+)
          (behaviorEvent.metadata?.frequency as number | undefined) != null
            ? true
            : intensityIndex >= 2;

        if (meetsThreshold) {
          const deltaHours =
            Math.abs(
              new Date(dietEvent.occurredAt).getTime() -
                new Date(behaviorEvent.occurredAt).getTime(),
            ) /
            (1000 * 60 * 60);

          pairs.push({
            correlationType: 'diet-to-behavior-shift',
            eventA: dietEvent,
            eventB: behaviorEvent,
            deltaHours: Math.round(deltaHours * 10) / 10,
          });
          break; // One representative pair per diet event
        }
      }
    }

    // ── b. heat-or-pregnancy-to-behavior-shift ─────────────────────────────
    for (const reproEvent of reproductiveEvents) {
      for (const behaviorEvent of behaviorEvents) {
        if (!isWithinProximityWindow(reproEvent, behaviorEvent, PROXIMITY_WINDOW_MS)) continue;

        const deltaHours =
          Math.abs(
            new Date(reproEvent.occurredAt).getTime() -
              new Date(behaviorEvent.occurredAt).getTime(),
          ) /
          (1000 * 60 * 60);

        pairs.push({
          correlationType: 'heat-or-pregnancy-to-behavior-shift',
          eventA: reproEvent,
          eventB: behaviorEvent,
          deltaHours: Math.round(deltaHours * 10) / 10,
        });
        break; // One representative pair per reproductive event
      }
    }

    // ── c. water-drop-to-lethargy ──────────────────────────────────────────
    if (waterEvents.length >= 2) {
      // Sort water events oldest-first for rolling average calculation
      const sortedWater = [...waterEvents].sort(
        (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
      );

      // Group by 3-day windows and look for ≥25% drops
      for (let i = 1; i < sortedWater.length; i++) {
        const prevWater = sortedWater[i - 1];
        const currWater = sortedWater[i];

        const prevMl = (prevWater.metadata?.waterMl as number | undefined) ?? 0;
        const currMl = (currWater.metadata?.waterMl as number | undefined) ?? 0;

        if (prevMl <= 0) continue;

        const dropPercent = (prevMl - currMl) / prevMl;
        if (dropPercent < 0.25) continue; // Less than 25% drop — skip

        // Look for increased lethargic behavior within 72h of the water drop
        const lethargyEvents = behaviorEvents.filter((be) => {
          const behaviorType = (be.metadata?.behaviorType as string | undefined)?.toLowerCase() ?? '';
          return (
            behaviorType.includes('letharg') &&
            isWithinProximityWindow(currWater, be, PROXIMITY_WINDOW_MS)
          );
        });

        if (lethargyEvents.length > 0) {
          const deltaHours =
            Math.abs(
              new Date(currWater.occurredAt).getTime() -
                new Date(lethargyEvents[0].occurredAt).getTime(),
            ) /
            (1000 * 60 * 60);

          pairs.push({
            correlationType: 'water-drop-to-lethargy',
            eventA: currWater,
            eventB: lethargyEvents[0],
            deltaHours: Math.round(deltaHours * 10) / 10,
          });
          break; // One representative pair
        }
      }
    }

    return pairs;
  }

  /**
   * Process a single correlation pair: check cache → call AI → persist.
   */
  private async _processCorrelation(
    pair: CorrelationPair,
    cat: {
      id: string;
      name: string;
      sex: string | null;
      age: number | null;
      lifeStage: string | null;
      breed: string | null;
    },
  ): Promise<void> {
    const { correlationType, eventA, eventB, deltaHours } = pair;
    const catId = cat.id;

    // 4a. Check 24h cache
    const existingInsights = await timelineRepository.findInsightsByCatId(catId, { limit: 100 });
    const now = Date.now();
    const cached = existingInsights.find(
      (ins) =>
        ins.type === correlationType &&
        now - new Date(ins.generatedAt).getTime() < CACHE_VALIDITY_MS,
    );

    if (cached) {
      logger.debug(`[InsightService] Cache hit for ${correlationType} on cat ${catId} — skipping`);
      return;
    }

    // 4b. Build sanitized AI prompt
    const prompt = this._buildPrompt(cat, correlationType, eventA, eventB, deltaHours);

    // 4c. Call AI with fallback chain
    let insight: (AiInsightResponse & { source?: string }) | null = null;

    // Groq (10s timeout)
    if (groqClient.isAvailable) {
      try {
        logger.info(`[InsightService] Calling Groq for ${correlationType}`);
        const raw = await Promise.race([
          groqClient.generateText(prompt, INSIGHT_JSON_SCHEMA),
          timeoutPromise(AI_TIMEOUT_MS),
        ]);

        if (raw) {
          const parsed = JSON.parse(raw) as AiInsightResponse;
          if (this._validateInsightResponse(parsed)) {
            insight = { ...parsed, source: 'ai' };
            logger.info(`[InsightService] Groq response valid for ${correlationType}`);
          } else {
            logger.warn(`[InsightService] Groq response failed schema validation for ${correlationType}`);
          }
        }
      } catch (err) {
        logger.warn(`[InsightService] Groq call failed for ${correlationType}`, {
          error: (err as Error).message,
        });
      }
    }

    // Gemini fallback (10s timeout)
    if (!insight && geminiClient.isAvailable) {
      try {
        logger.info(`[InsightService] Calling Gemini for ${correlationType}`);
        const raw = await Promise.race([
          geminiClient.generateText(prompt, INSIGHT_GEMINI_SCHEMA),
          timeoutPromise(AI_TIMEOUT_MS),
        ]);

        if (raw) {
          const parsed = JSON.parse(raw) as AiInsightResponse;
          if (this._validateInsightResponse(parsed)) {
            insight = { ...parsed, source: 'ai' };
            logger.info(`[InsightService] Gemini response valid for ${correlationType}`);
          } else {
            logger.warn(`[InsightService] Gemini response failed schema validation for ${correlationType}`);
          }
        }
      } catch (err) {
        logger.warn(`[InsightService] Gemini call failed for ${correlationType}`, {
          error: (err as Error).message,
        });
      }
    }

    // Heuristic fallback
    if (!insight) {
      logger.warn(`[InsightService] Both AI providers failed — using heuristic for ${correlationType}`);
      const heuristic = HEURISTIC_INSIGHTS[correlationType];
      if (!heuristic) return;
      insight = { ...heuristic, type: correlationType, source: 'heuristic' };
    }

    // 4e. Persist via repository
    await timelineRepository.upsertInsight({
      catId,
      type: correlationType,
      summary: insight.summary.slice(0, 160),
      detail: insight.detail.slice(0, 500),
      severity: insight.severity,
      eventIds: [eventA.id, eventB.id],
      source: insight.source ?? 'ai',
      generatedAt: new Date(),
    });

    logger.info(`[InsightService] Insight persisted for ${correlationType} on cat ${catId}`, {
      source: insight.source,
      severity: insight.severity,
    });
  }

  /**
   * Build the structured AI prompt for a correlation pair.
   * Sanitizes all user-supplied text before inclusion.
   */
  private _buildPrompt(
    cat: {
      name: string;
      sex: string | null;
      age: number | null;
      lifeStage: string | null;
      breed: string | null;
    },
    correlationType: string,
    eventA: HealthEvent,
    eventB: HealthEvent,
    deltaHours: number,
  ): string {
    const catName = sanitizeInsightInput(cat.name ?? 'Unknown');
    const sex = sanitizeInsightInput(cat.sex ?? 'unknown');
    const age = cat.age ?? 0;
    const lifeStage = sanitizeInsightInput(cat.lifeStage ?? 'unknown');
    const breed = sanitizeInsightInput(cat.breed ?? 'unknown');

    const sourceADesc = sanitizeInsightInput(eventA.description);
    const sourceBDesc = sanitizeInsightInput(eventB.description);
    const sourcATitle = sanitizeInsightInput(eventA.title);
    const sourcBTitle = sanitizeInsightInput(eventB.title);

    const systemPrompt = `You are a veterinary health-pattern analyst for domestic cats. Return ONLY a JSON object matching this exact schema (no markdown, no commentary): { "type": string, "summary": string (≤160 chars), "detail": string (≤500 chars), "severity": "info"|"warning"|"concern" }`;

    const userPrompt = `Cat: ${catName}, ${sex}, ${age} years, ${lifeStage}, ${breed}
Correlation type: ${correlationType}
Events from ${eventA.source} (newest first): ${sourcATitle} — ${sourceADesc} (${eventA.occurredAt})
Events from ${eventB.source} (newest first): ${sourcBTitle} — ${sourceBDesc} (${eventB.occurredAt})
Delta: ${deltaHours} hours. Analyze the temporal relationship.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * Validate that the AI response matches the expected schema.
   */
  private _validateInsightResponse(parsed: unknown): parsed is AiInsightResponse {
    if (typeof parsed !== 'object' || parsed === null) return false;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.type !== 'string') return false;
    if (typeof obj.summary !== 'string') return false;
    if (typeof obj.detail !== 'string') return false;
    if (!['info', 'warning', 'concern'].includes(obj.severity as string)) return false;
    return true;
  }
}

// ─── JSON schemas for AI providers ───────────────────────────────────────────

/** JSON Schema for Groq (plain JSON Schema format) */
const INSIGHT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    summary: { type: 'string' },
    detail: { type: 'string' },
    severity: { type: 'string', enum: ['info', 'warning', 'concern'] },
  },
  required: ['type', 'summary', 'detail', 'severity'],
};

/** Schema for Gemini (uses Google's Type format via plain object) */
const INSIGHT_GEMINI_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    summary: { type: 'string' },
    detail: { type: 'string' },
    severity: { type: 'string', enum: ['info', 'warning', 'concern'] },
  },
  required: ['type', 'summary', 'detail', 'severity'],
};

// ─── Singleton export ─────────────────────────────────────────────────────────

export const insightService = new InsightService();
