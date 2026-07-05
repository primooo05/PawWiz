/**
 * Service Layer — Diet Advisor
 * Conversational AI grounded in a cat's current diet profile (weight, life stage,
 * calorie targets, feeding progress, hydration). Answers owner questions about
 * their cat's diet recommendation — e.g. "why is my cat's calorie target so low?",
 * "can I switch her to wet food?", "is she drinking enough water?".
 * 3-tier failover: Groq (Llama 3.3) → Gemini → Heuristic fallback.
 * Singleton Pattern — exported as a single instance.
 */

import { groqClient } from '../repositories/groq.repository.js';
import { geminiClient } from '../repositories/gemini.repository.js';
import { checkInappropriate, isGreeting } from '../utils/prompt-validator.js';
import { logger } from '../utils/winston.js';
import type { DietAdviceRequest, ConversationalReply } from '../types/shared.js';

class DietAdvisorService {
  /**
   * Answer a diet-related question grounded in the cat's current diet profile.
   * Failover chain: Groq → Gemini → Heuristic
   */
  async advise(request: DietAdviceRequest): Promise<ConversationalReply> {
    const { catName } = request.catProfile;

    if (isGreeting(request.question)) {
      logger.info('[DietAdvisor] Greeting detected — returning friendly response');
      return {
        type: 'conversational',
        text: `Hey! 👋 I'm Wiz, and I've got ${catName}'s diet profile pulled up. Ask me anything — feeding amounts, calorie targets, food switches, hydration, you name it. 🐾`,
      };
    }

    const inappropriate = checkInappropriate(request.question);
    if (inappropriate.isInappropriate) {
      logger.warn('[DietAdvisor] Inappropriate prompt detected', { reason: inappropriate.reason });
      return {
        type: 'conversational',
        text: `I can't help with that. ${inappropriate.reason}. Feel free to ask me anything about ${catName}'s diet plan instead! 🐾`,
      };
    }

    const prompt = this.buildPrompt(request);

    logger.info('[DietAdvisor] Advice request received', {
      catName,
      question: request.question,
    });

    // Tier 1: Groq (Llama 3.3) — primary
    if (groqClient.isAvailable) {
      try {
        logger.info('[DietAdvisor] Attempting Groq (Tier 1)');
        const text = await groqClient.generateConversationalText(prompt);
        if (text?.trim()) {
          logger.info('[DietAdvisor] Groq response successful');
          return { type: 'conversational', text: text.trim() };
        }
        logger.warn('[DietAdvisor] Groq returned empty — advancing to Gemini');
      } catch (error) {
        logger.warn('[DietAdvisor] Groq failed (Tier 1) — falling back to Gemini', {
          error: (error as Error).message,
        });
      }
    } else {
      logger.info('[DietAdvisor] Groq unavailable — skipping Tier 1');
    }

    // Tier 2: Gemini — fallback (same prompt, no context loss)
    if (geminiClient.isAvailable) {
      try {
        logger.info('[DietAdvisor] Attempting Gemini (Tier 2)');
        const text = await geminiClient.generateConversationalText(prompt);
        if (text?.trim()) {
          logger.info('[DietAdvisor] Gemini response successful');
          return { type: 'conversational', text: text.trim() };
        }
      } catch (error) {
        logger.error('[DietAdvisor] Gemini failed (Tier 2) — falling back to heuristic', {
          error: (error as Error).message,
        });
      }
    } else {
      logger.info('[DietAdvisor] Gemini unavailable — skipping Tier 2');
    }

    // Tier 3: Deterministic heuristic fallback
    logger.warn('[DietAdvisor] All AI providers failed — using heuristic fallback (Tier 3)');
    return this.generateFallback(request);
  }

  /**
   * Build a grounded prompt combining the cat's diet profile snapshot,
   * recent conversation history, and the owner's current question.
   */
  private buildPrompt(request: DietAdviceRequest): string {
    const { catProfile, question, conversationHistory } = request;
    const weightUnit = catProfile.isKg ? 'kg' : 'lbs';

    const profileSection = `Cat's current diet profile:
- Name: ${catProfile.catName}
- Sex: ${catProfile.gender}
- Life stage: ${catProfile.lifeStage}
- Age: ${catProfile.age} ${catProfile.lifeStage === 'kitten' ? 'months' : 'years'}
- Weight: ${catProfile.weight} ${weightUnit}
- Food preference: ${catProfile.foodPreference}
- Spayed/Neutered: ${catProfile.isSpayedNeutered ? 'yes' : 'no'}
- Daily calorie target: ${catProfile.dailyCalories} kcal
- Calories logged today: ${catProfile.totalLoggedCalories} kcal
- Meals logged today: ${catProfile.mealsLoggedToday}
- Meals still pending today: ${catProfile.mealsPendingToday}
- Water intake today: ${catProfile.waterIntake} ml (target: ${catProfile.waterTarget} ml)`;

    const historySection =
      conversationHistory && conversationHistory.length > 0
        ? `\n\nConversation so far:\n${conversationHistory
            .map((t) => `${t.role === 'user' ? 'Owner' : 'Wiz'}: ${t.content}`)
            .join('\n')}`
        : '';

    return `${profileSection}${historySection}

Owner's question: ${question}

Answer the owner's question about their cat's diet recommendation using the profile data above as ground truth. Be specific — reference actual numbers (calories, weight, water) when relevant. Keep the tone warm and practical, like a knowledgeable friend, not a lecture.

Format your response as:
1. A short 1–2 sentence direct answer to the question.
2. A line reading exactly "**What to do:**" followed by 2–5 bullet points, each starting with "• ", giving concrete, actionable guidance the owner can follow (specific amounts, timing, or steps — not vague advice).

Only include the "**What to do:**" section when there is real actionable guidance to give (skip it for purely factual questions like "what breed is best for X"). If the question needs veterinary attention beyond general nutrition advice, add one bullet recommending a vet visit rather than a separate paragraph.`;
  }

  /**
   * Heuristic-based fallback when both AI providers are unavailable.
   * Answers from the profile data directly without free-form generation.
   */
  private generateFallback(request: DietAdviceRequest): ConversationalReply {
    const { catProfile } = request;
    const remaining = Math.max(0, catProfile.dailyCalories - catProfile.totalLoggedCalories);
    const waterRemaining = Math.max(0, catProfile.waterTarget - catProfile.waterIntake);

    const text = `I can't reach the AI assistant right now, but here's what I can tell you from ${catProfile.catName}'s profile:

**What to do:**
• Daily target is ${catProfile.dailyCalories} kcal — ${catProfile.totalLoggedCalories} kcal logged so far, ${remaining} kcal remaining.
• ${catProfile.mealsPendingToday} meal${catProfile.mealsPendingToday === 1 ? '' : 's'} still pending today — space them out to hit the remaining calories.
• Water intake is ${catProfile.waterIntake} ml of a ${catProfile.waterTarget} ml target — offer ${waterRemaining} ml more if ${catProfile.catName} hasn't hit it yet.
• Try asking again in a moment for a more detailed, AI-generated answer.`;

    return { type: 'conversational', text };
  }
}

/** Singleton instance */
export const dietAdvisorService = new DietAdvisorService();
