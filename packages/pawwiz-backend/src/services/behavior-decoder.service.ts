/**
 * Service Layer — Behavior Decoder
 * Interprets cat vocalizations and body language via Gemini AI.
 * Determines emotional state and provides actionable guidance.
 * Graceful fallback when API key is absent.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { geminiClient } from '../repositories/gemini.repository.js';
import { logger } from '../utils/winston.js';
import type { BehaviorDecodeRequest, BehaviorDecodeResponse } from '../types/shared.js';

/** Response schema for Gemini behavior decode */
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

class BehaviorDecoderService {
  /**
   * Decode cat behavior from vocal and body language descriptions.
   */
  async decode(request: BehaviorDecodeRequest): Promise<BehaviorDecodeResponse> {
    if (!geminiClient.isAvailable) {
      return this.generateFallbackResponse(request);
    }

    try {
      return await this.generateAiDecode(request);
    } catch (error) {
      logger.error('Gemini Behavior API error — falling back to heuristic response', { error });
      return this.generateFallbackResponse(request);
    }
  }

  /**
   * AI-powered behavior analysis via Gemini.
   */
  private async generateAiDecode(request: BehaviorDecodeRequest): Promise<BehaviorDecodeResponse> {
    const prompt = `Decode the following feline behavioral state.
Vocal Description: ${request.vocalDescription}
Body Language Signs: ${request.bodyLanguageSigns.join(', ')}
Context: ${request.context}

Analyze vocal signals, tail position, eye dilation, and ear positions. Return a detailed behavior decode response matching the JSON schema.`;

    const text = await geminiClient.generateText(prompt, BEHAVIOR_RESPONSE_SCHEMA);

    if (!text) throw new Error('Empty response from Gemini behavior model.');
    return JSON.parse(text);
  }

  /**
   * Heuristic-based fallback when Gemini is unavailable.
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
