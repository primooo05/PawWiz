/**
 * Service Layer — Diet Optimization
 * Calculates feline nutritional plans using veterinary RER formulas,
 * enriched with AI-generated recommendations via Gemini.
 * Graceful fallback when API key is absent.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { geminiClient } from '../repositories/gemini.repository.js';
import { logger } from '../utils/winston.js';
import type { DietOptimizeRequest, DietPlan } from '../types/shared.js';

/** Response schema for Gemini diet optimization */
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

class DietOptimizationService {
  /**
   * Generate a personalized diet plan for a cat.
   * Uses RER formula as baseline, enriched by Gemini when available.
   */
  async optimize(request: DietOptimizeRequest): Promise<DietPlan> {
    if (!geminiClient.isAvailable) {
      return this.calculateFallbackPlan(request);
    }

    try {
      return await this.generateAiPlan(request);
    } catch (error) {
      logger.error('Gemini Diet API error — falling back to RER calculation', { error });
      return this.calculateFallbackPlan(request);
    }
  }

  /**
   * AI-enriched diet plan generation via Gemini.
   */
  private async generateAiPlan(request: DietOptimizeRequest): Promise<DietPlan> {
    const prompt = `Generate a high-precision feline diet optimization plan.
Cat weight: ${request.weightKg} kg
Cat age: ${request.ageYears} years
Activity level: ${request.activityLevel}
Health conditions: ${request.healthConditions.join(', ') || 'none'}

Return a strict JSON output matching the required schema. Ensure dailyCalories is an integer.`;

    const text = await geminiClient.generateText(prompt, DIET_RESPONSE_SCHEMA);

    if (!text) throw new Error('Empty response from Gemini diet model.');
    return JSON.parse(text);
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
