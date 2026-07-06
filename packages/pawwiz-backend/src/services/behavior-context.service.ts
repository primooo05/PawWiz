/**
 * Service Layer — Behavior Context Enrichment
 * Fetches diet profile and pregnancy data for a given cat, assembling an
 * EnrichedBehaviorCatContext that the behavior decoder can use to provide
 * more personalized and medically-aware behavior analysis.
 *
 * This runs server-side so the frontend doesn't need to pass bulky payloads.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/winston.js';
import type { BehaviorCatContext, EnrichedBehaviorCatContext } from '../types/shared.js';

class BehaviorContextService {
  /**
   * Enrich a basic BehaviorCatContext with diet + pregnancy data from the DB.
   * Non-blocking: if any lookup fails, we return the original context gracefully.
   */
  async enrich(basicContext: BehaviorCatContext): Promise<EnrichedBehaviorCatContext> {
    const catId = basicContext.catId;
    if (!catId) return basicContext;

    const enriched: EnrichedBehaviorCatContext = { ...basicContext };

    try {
      // Fetch diet + pregnancy data in parallel for speed
      const [dietData, pregnancyData] = await Promise.all([
        this.fetchDietContext(catId),
        this.fetchPregnancyContext(catId),
      ]);

      // Merge diet data
      if (dietData) {
        enriched.weight = dietData.weight;
        enriched.isKg = dietData.isKg;
        enriched.isSpayedNeutered = dietData.isSpayedNeutered;
        enriched.foodPreference = dietData.foodPreference;
        enriched.waterIntake = dietData.waterIntake;
        enriched.mealsLoggedToday = dietData.mealsLoggedToday;
        enriched.recentMealPattern = dietData.recentMealPattern;
      }

      // Merge pregnancy data
      if (pregnancyData) {
        enriched.isPregnant = pregnancyData.isPregnant;
        enriched.gestationWeek = pregnancyData.gestationWeek;
        enriched.daysPregnant = pregnancyData.daysPregnant;
        enriched.pregnancySymptoms = pregnancyData.symptoms;
        enriched.pregnancyMood = pregnancyData.mood;
        enriched.pregnancyAppetite = pregnancyData.appetiteLevel;
        enriched.pregnancyEnergy = pregnancyData.energyLevel;
      } else if (basicContext.sex === 'female' && !dietData?.isSpayedNeutered) {
        // Unspayed female without active pregnancy — might be in heat
        enriched.isInHeat = false; // placeholder: can be refined with heat-cycle tracking later
      }

      logger.debug('[BehaviorContext] Enriched cat context', {
        catId,
        hasWeight: !!enriched.weight,
        isPregnant: enriched.isPregnant ?? false,
        gestationWeek: enriched.gestationWeek ?? null,
        mealsLogged: enriched.mealsLoggedToday ?? 0,
      });
    } catch (error) {
      logger.warn('[BehaviorContext] Failed to enrich context — using basic context', {
        catId,
        error: (error as Error).message,
      });
    }

    return enriched;
  }

  /**
   * Fetch diet-related context for the cat.
   */
  private async fetchDietContext(catId: string) {
    const dietProfile = await prisma.dietProfile.findFirst({
      where: { catId },
      include: {
        mealLogs: {
          where: {
            createdAt: { gte: this.todayStart() },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!dietProfile) return null;

    const loggedMeals = dietProfile.mealLogs.filter(m => m.status === 'logged');
    const totalMeals = dietProfile.mealLogs.length;
    const foodTypes = loggedMeals
      .map(m => m.foodType)
      .filter(Boolean);

    // Build a human-readable meal pattern summary
    let recentMealPattern: string | null = null;
    if (totalMeals > 0) {
      const dominantFood = this.mostCommon(foodTypes as string[]) || dietProfile.foodPreference;
      recentMealPattern = `${loggedMeals.length}/${totalMeals} meals logged today, preference: ${dominantFood}`;
    }

    return {
      weight: dietProfile.weight,
      isKg: dietProfile.isKg,
      isSpayedNeutered: dietProfile.isSpayedNeutered,
      foodPreference: dietProfile.foodPreference,
      waterIntake: dietProfile.waterIntake,
      mealsLoggedToday: loggedMeals.length,
      recentMealPattern,
    };
  }

  /**
   * Fetch pregnancy-related context for the cat.
   * Only returns data if there's an active pregnancy session.
   */
  private async fetchPregnancyContext(catId: string) {
    const activeSession = await prisma.pregnancySession.findFirst({
      where: { catId, status: 'active' },
      include: {
        pregnancyLogs: {
          orderBy: { logDate: 'desc' },
          take: 3, // last 3 daily logs for recent symptom trends
        },
      },
    });

    if (!activeSession) return null;

    const now = new Date();
    const matingDate = new Date(activeSession.matingDate);
    const daysPregnant = Math.floor((now.getTime() - matingDate.getTime()) / (1000 * 60 * 60 * 24));
    const gestationWeek = Math.min(10, Math.max(1, Math.ceil(daysPregnant / 7)));

    // Aggregate recent symptoms and mood from last 3 logs
    const recentLogs = activeSession.pregnancyLogs;
    const symptoms = [...new Set(recentLogs.flatMap(l => l.symptoms))];
    const mood = [...new Set(recentLogs.flatMap(l => l.moodBehavior))];

    // Latest appetite and energy levels
    const latestLog = recentLogs[0];
    const appetiteLevel = latestLog?.appetiteLevel ?? null;
    const energyLevel = latestLog?.energyLevel ?? null;

    return {
      isPregnant: true,
      gestationWeek,
      daysPregnant,
      symptoms,
      mood,
      appetiteLevel,
      energyLevel,
    };
  }

  /** UTC midnight today */
  private todayStart(): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  /** Returns the most common string in an array */
  private mostCommon(arr: string[]): string | null {
    if (arr.length === 0) return null;
    const counts = new Map<string, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    let max = 0;
    let result: string | null = null;
    for (const [key, count] of counts) {
      if (count > max) {
        max = count;
        result = key;
      }
    }
    return result;
  }
}

/** Singleton instance */
export const behaviorContextService = new BehaviorContextService();
