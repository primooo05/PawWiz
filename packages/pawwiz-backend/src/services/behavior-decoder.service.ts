/**
 * Service Layer — Behavior Decoder
 * Interprets cat vocalizations and body language via AI.
 * 3-tier failover: Groq (Llama 3.3) → Gemini → Heuristic fallback.
 * Same prompt + schema sent to both AI providers — no context lost on failover.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { groqClient } from '../repositories/groq.repository.js';
import { geminiClient } from '../repositories/gemini.repository.js';
import { logger } from '../utils/winston.js';
import type { BehaviorDecodeRequest, BehaviorDecodeResponse } from '../types/shared.js';

/** Response schema for Gemini behavior decode (structured output) */
const BEHAVIOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    vocalAnalysis: { type: Type.STRING },
    bodyLanguageAnalysis: { type: Type.STRING },
    decodedMeaning: { type: Type.STRING },
    catState: {
      type: Type.STRING,
      enum: [
        'Happy/Relaxed',
        'Anxious/Stressed',
        'Playful',
        'Aggressive/Defensive',
        'Overstimulated',
        'Sick/In Pain',
        'Unknown',
      ],
    },
    confidenceScore: { type: Type.NUMBER },
    actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'vocalAnalysis',
    'bodyLanguageAnalysis',
    'decodedMeaning',
    'catState',
    'confidenceScore',
    'actionPlan',
  ],
};

/** JSON schema description for Groq (plain JSON Schema, not Google's Type format) */
const BEHAVIOR_JSON_SCHEMA = {
  type: 'object',
  properties: {
    vocalAnalysis: { type: 'string' },
    bodyLanguageAnalysis: { type: 'string' },
    decodedMeaning: { type: 'string' },
    catState: {
      type: 'string',
      enum: [
        'Happy/Relaxed',
        'Anxious/Stressed',
        'Playful',
        'Aggressive/Defensive',
        'Overstimulated',
        'Sick/In Pain',
        'Unknown',
      ],
    },
    confidenceScore: { type: 'number' },
    actionPlan: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'vocalAnalysis',
    'bodyLanguageAnalysis',
    'decodedMeaning',
    'catState',
    'confidenceScore',
    'actionPlan',
  ],
};

class BehaviorDecoderService {
  /**
   * Decode cat behavior from vocal and body language descriptions.
   * Failover chain: Groq → Gemini → Heuristic
   */
  async decode(request: BehaviorDecodeRequest): Promise<BehaviorDecodeResponse> {
    const prompt = this.buildPrompt(request);

    logger.info('[BehaviorDecoder] Decode request received', {
      vocalDescription: request.vocalDescription,
      bodyLanguageSigns: request.bodyLanguageSigns,
      context: request.context,
    });

    // Tier 1: Groq (Llama 3.3) — primary
    if (groqClient.isAvailable) {
      try {
        logger.info('[BehaviorDecoder] Attempting Groq (Tier 1)');
        const result = await this.generateGroqDecode(prompt);
        if (result) {
          logger.info('[BehaviorDecoder] Groq response successful', {
            catState: result.catState,
            confidenceScore: result.confidenceScore,
          });
          return result;
        }
        logger.warn('[BehaviorDecoder] Groq returned null — advancing to Gemini');
      } catch (error) {
        logger.warn('[BehaviorDecoder] Groq failed (Tier 1) — falling back to Gemini', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    } else {
      logger.info('[BehaviorDecoder] Groq unavailable — skipping Tier 1');
    }

    // Tier 2: Gemini — fallback (same prompt, no context loss)
    if (geminiClient.isAvailable) {
      try {
        logger.info('[BehaviorDecoder] Attempting Gemini (Tier 2)');
        const result = await this.generateGeminiDecode(prompt);
        logger.info('[BehaviorDecoder] Gemini response successful', {
          catState: result.catState,
          confidenceScore: result.confidenceScore,
        });
        return result;
      } catch (error) {
        logger.error('[BehaviorDecoder] Gemini failed (Tier 2) — falling back to heuristic', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    } else {
      logger.info('[BehaviorDecoder] Gemini unavailable — skipping Tier 2');
    }

    // Tier 3: Deterministic heuristic fallback
    logger.warn('[BehaviorDecoder] All AI providers failed — using heuristic fallback (Tier 3)');
    return this.generateFallbackResponse(request);
  }

  /**
   * Build the behavior decode prompt from request data.
   * Shared across all AI providers — ensures identical context on failover.
   */
  private buildPrompt(request: BehaviorDecodeRequest): string {
    return `Decode the following feline behavioral state.
Vocal Description: ${request.vocalDescription}
Body Language Signs: ${request.bodyLanguageSigns.join(', ')}
Context: ${request.context}

Analyze vocal signals, tail position, eye dilation, and ear positions. Return a detailed behavior decode response as JSON with these fields:
- vocalAnalysis (string): Analysis of the vocal signals
- bodyLanguageAnalysis (string): Analysis of the body language
- decodedMeaning (string): Overall interpretation of the behavior
- catState (string, one of: "Happy/Relaxed", "Anxious/Stressed", "Playful", "Aggressive/Defensive", "Overstimulated", "Sick/In Pain", "Unknown")
- confidenceScore (number between 0 and 1)
- actionPlan (array of strings): Recommended actions for the owner`;
  }

  /**
   * AI-powered behavior analysis via Groq (Llama 3.3).
   */
  private async generateGroqDecode(prompt: string): Promise<BehaviorDecodeResponse | null> {
    const text = await groqClient.generateText(prompt, BEHAVIOR_JSON_SCHEMA);
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('[BehaviorDecoder] Groq returned invalid JSON', {
        error: (parseError as Error).message,
        rawResponse: text.substring(0, 500),
      });
      throw new Error('Groq returned malformed JSON');
    }
  }

  /**
   * AI-powered behavior analysis via Gemini (fallback).
   */
  private async generateGeminiDecode(prompt: string): Promise<BehaviorDecodeResponse> {
    const text = await geminiClient.generateText(prompt, BEHAVIOR_RESPONSE_SCHEMA);
    if (!text) throw new Error('Empty response from Gemini behavior model.');

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('[BehaviorDecoder] Gemini returned invalid JSON', {
        error: (parseError as Error).message,
        rawResponse: text.substring(0, 500),
      });
      throw new Error('Gemini returned malformed JSON');
    }
  }

  /**
   * Heuristic-based fallback when both AI providers are unavailable.
   */
  private generateFallbackResponse(request: BehaviorDecodeRequest): BehaviorDecodeResponse {
    const hasStressSigns = request.bodyLanguageSigns.some((sign) =>
      ['ears back', 'pupils dilated', 'hissing', 'arched back', 'tail puffed'].includes(
        sign.toLowerCase()
      )
    );

    const catState = hasStressSigns ? 'Overstimulated' : 'Playful';

    return {
      vocalAnalysis: `The vocalization "${request.vocalDescription}" indicates ${hasStressSigns ? 'distress or overstimulation' : 'attention-seeking or mild demand'}.`,
      bodyLanguageAnalysis: `Body language signs observed: ${request.bodyLanguageSigns.join(', ')}.`,
      decodedMeaning: hasStressSigns
        ? 'The cat is showing signs of stress or overstimulation. Reduce stimuli and give space.'
        : 'The cat is signaling curiosity mixed with playful energy, likely seeking interaction or resource verification.',
      catState,
      confidenceScore: 0.75,
      actionPlan: hasStressSigns
        ? [
            'Give the cat space immediately — do not attempt to pick up or restrain.',
            'Remove or reduce the source of stimulation.',
            'Provide a quiet hiding spot (box, covered bed).',
            'Wait 10–15 minutes before re-engaging with slow blinks.',
          ]
        : [
            'Introduce a wand toy or feather to redirect playful energy.',
            'Avoid forced touching of sensitive areas (belly, tail base).',
            'Observe if pupils normalize before resuming gentle chin scratches.',
          ],
    };
  }
}

/** Singleton instance */
export const behaviorDecoderService = new BehaviorDecoderService();
