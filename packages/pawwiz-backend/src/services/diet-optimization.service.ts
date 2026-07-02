/**
 * Service Layer — Diet Optimization
 * Calculates feline nutritional plans using veterinary RER formulas,
 * enriched with AI-generated recommendations.
 * 3-tier failover: Groq (Llama 3.3) → Gemini → RER heuristic fallback.
 * Same prompt + schema sent to both AI providers — no context lost on failover.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { groqClient } from '../repositories/groq.repository.js';
import { geminiClient } from '../repositories/gemini.repository.js';
import { logger } from '../utils/winston.js';
import type { DietOptimizeRequest, DietPlan } from '../types/shared.js';

/** Response schema for Gemini diet optimization (structured output) */
const DIET_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    dailyCalories: { type: Type.INTEGER },
    macronutrientSplit: {
      type: Type.OBJECT,
      properties: {
        proteinPercent: { type: Type.INTEGER },
        fatPercent: { type: Type.INTEGER },
        carbsPercent: { type: Type.INTEGER },
      },
      required: ['proteinPercent', 'fatPercent', 'carbsPercent'],
    },
    recommendedFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
    avoidFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
    feedingSchedule: { type: Type.STRING },
    dietRationale: { type: Type.STRING },
  },
  required: [
    'dailyCalories',
    'macronutrientSplit',
    'recommendedFoods',
    'avoidFoods',
    'feedingSchedule',
    'dietRationale',
  ],
};

/** JSON schema description for Groq (plain JSON Schema format) */
const DIET_JSON_SCHEMA = {
  type: 'object',
  properties: {
    dailyCalories: { type: 'integer' },
    macronutrientSplit: {
      type: 'object',
      properties: {
        proteinPercent: { type: 'integer' },
        fatPercent: { type: 'integer' },
        carbsPercent: { type: 'integer' },
      },
      required: ['proteinPercent', 'fatPercent', 'carbsPercent'],
    },
    recommendedFoods: { type: 'array', items: { type: 'string' } },
    avoidFoods: { type: 'array', items: { type: 'string' } },
    feedingSchedule: { type: 'string' },
    dietRationale: { type: 'string' },
  },
  required: [
    'dailyCalories',
    'macronutrientSplit',
    'recommendedFoods',
    'avoidFoods',
    'feedingSchedule',
    'dietRationale',
  ],
};

class DietOptimizationService {
  /**
   * Generate a personalized diet plan for a cat.
   * Failover chain: Groq → Gemini → RER heuristic
   */
  async optimize(request: DietOptimizeRequest): Promise<DietPlan> {
    const prompt = this.buildPrompt(request);

    logger.info('[DietOptimizer] Optimize request received', {
      weightKg: request.weightKg,
      ageYears: request.ageYears,
      activityLevel: request.activityLevel,
      healthConditions: request.healthConditions,
    });

    // Tier 1: Groq (Llama 3.3) — primary
    if (groqClient.isAvailable) {
      try {
        logger.info('[DietOptimizer] Attempting Groq (Tier 1)');
        const result = await this.generateGroqPlan(prompt);
        if (result) {
          logger.info('[DietOptimizer] Groq response successful', {
            dailyCalories: result.dailyCalories,
            recommendedFoodsCount: result.recommendedFoods.length,
          });
          return result;
        }
        logger.warn('[DietOptimizer] Groq returned null — advancing to Gemini');
      } catch (error) {
        logger.warn('[DietOptimizer] Groq failed (Tier 1) — falling back to Gemini', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    } else {
      logger.info('[DietOptimizer] Groq unavailable — skipping Tier 1');
    }

    // Tier 2: Gemini — fallback (same prompt, no context loss)
    if (geminiClient.isAvailable) {
      try {
        logger.info('[DietOptimizer] Attempting Gemini (Tier 2)');
        const result = await this.generateGeminiPlan(prompt);
        logger.info('[DietOptimizer] Gemini response successful', {
          dailyCalories: result.dailyCalories,
          recommendedFoodsCount: result.recommendedFoods.length,
        });
        return result;
      } catch (error) {
        logger.error('[DietOptimizer] Gemini failed (Tier 2) — falling back to RER heuristic', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    } else {
      logger.info('[DietOptimizer] Gemini unavailable — skipping Tier 2');
    }

    // Tier 3: Deterministic RER-based fallback
    logger.warn('[DietOptimizer] All AI providers failed — using RER heuristic fallback (Tier 3)');
    return this.calculateFallbackPlan(request);
  }

  /**
   * Build the diet optimization prompt from request data.
   * Shared across all AI providers — ensures identical context on failover.
   */
  private buildPrompt(request: DietOptimizeRequest): string {
    return `Generate a high-precision feline diet optimization plan.
Cat weight: ${request.weightKg} kg
Cat age: ${request.ageYears} years
Activity level: ${request.activityLevel}
Health conditions: ${request.healthConditions.join(', ') || 'none'}

Return a strict JSON output with these fields:
- dailyCalories (integer): Total daily caloric requirement
- macronutrientSplit (object with proteinPercent, fatPercent, carbsPercent as integers)
- recommendedFoods (array of strings): Specific food recommendations
- avoidFoods (array of strings): Foods to avoid
- feedingSchedule (string): Recommended feeding schedule
- dietRationale (string): Explanation of the nutritional plan

Ensure dailyCalories is an integer. Base calculations on the veterinary RER formula: 70 × (weight in kg)^0.75, adjusted for activity level and health conditions.`;
  }

  /**
   * AI-enriched diet plan generation via Groq (Llama 3.3).
   */
  private async generateGroqPlan(prompt: string): Promise<DietPlan | null> {
    const text = await groqClient.generateText(prompt, DIET_JSON_SCHEMA);
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('[DietOptimizer] Groq returned invalid JSON', {
        error: (parseError as Error).message,
        rawResponse: text.substring(0, 500),
      });
      throw new Error('Groq returned malformed JSON');
    }
  }

  /**
   * AI-enriched diet plan generation via Gemini (fallback).
   */
  private async generateGeminiPlan(prompt: string): Promise<DietPlan> {
    const text = await geminiClient.generateText(prompt, DIET_RESPONSE_SCHEMA);
    if (!text) throw new Error('Empty response from Gemini diet model.');

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('[DietOptimizer] Gemini returned invalid JSON', {
        error: (parseError as Error).message,
        rawResponse: text.substring(0, 500),
      });
      throw new Error('Gemini returned malformed JSON');
    }
  }

  /**
   * Deterministic fallback using veterinary RER formula.
   * RER (Resting Energy Requirement) = 70 × (weight in kg)^0.75
   */
  private calculateFallbackPlan(request: DietOptimizeRequest): DietPlan {
    const rer = 70 * Math.pow(request.weightKg, 0.75);

    let factor = 1.2;
    if (request.activityLevel === 'sedentary') factor = 1.0;
    if (request.activityLevel === 'active') factor = 1.4;

    const dailyCalories = Math.round(rer * factor);
    let rationale = `Calculated RER for ${request.weightKg}kg cat is ${Math.round(rer)} kcal. Activity multiplier: ${factor}x.`;

    const avoidFoods = ['Chocolate', 'Onions/Garlic', 'Grapes/Raisins', 'Dairy (high lactose sensitivity)'];

    if (request.healthConditions.some((c) => c.toLowerCase().includes('renal'))) {
      rationale +=
        ' Adjusted for renal health: restricted phosphorus, moderate high-quality protein, increased hydration support.';
      avoidFoods.push('High phosphorus foods', 'Dry kibble without supplemental water');
    }

    return {
      dailyCalories,
      macronutrientSplit: {
        proteinPercent: 45,
        fatPercent: 35,
        carbsPercent: 20,
      },
      recommendedFoods: [
        'Premium wet canned food (high moisture, low phosphorus if renal)',
        'Fresh cooked boneless chicken breast (unseasoned, small treats)',
        'Water fountain for hydration encouragement',
      ],
      avoidFoods,
      feedingSchedule:
        'Split daily allotment into 3 small meals (morning, mid-day, evening) to prevent glucose spikes.',
      dietRationale: rationale,
    };
  }
}

/** Singleton instance */
export const dietOptimizationService = new DietOptimizationService();
