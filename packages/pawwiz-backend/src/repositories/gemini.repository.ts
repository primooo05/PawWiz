/**
 * Repository Layer — Gemini AI Client
 * Factory wrapper around the Google Generative AI SDK.
 * Encapsulates SDK initialization, model selection, and availability checks.
 * No business logic. Only AI client access.
 * Singleton Pattern — exported as a single instance.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { logger } from '../utils/winston.js';

/** Model identifiers */
const TEXT_MODEL = 'gemini-3.5-flash';
const VISION_MODEL = 'gemini-3.1-pro';

class GeminiClient {
  private ai: GoogleGenAI | null;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY not set — AI features will use mock fallback responses.');
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /** Whether the Gemini API is available (key configured). */
  get isAvailable(): boolean {
    return this.ai !== null;
  }

  /**
   * Generate content using the vision model (image analysis).
   */
  async generateVision(
    prompt: string,
    imageBase64: string,
    responseSchema: Record<string, unknown>
  ): Promise<string | null> {
    if (!this.ai) return null;

    const response = await this.ai.models.generateContent({
      model: VISION_MODEL,
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: 'image/jpeg',
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: responseSchema,
      },
    });

    return response.text ?? null;
  }

  /**
   * Generate content using the text model (diet, behavior, general).
   */
  async generateText(
    prompt: string,
    responseSchema: Record<string, unknown>
  ): Promise<string | null> {
    if (!this.ai) return null;

    const response = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: responseSchema,
      },
    });

    return response.text ?? null;
  }
}

/** Singleton instance */
export const geminiClient = new GeminiClient();
