/**
 * Repository Layer — Groq AI Client (Llama 3.3)
 * Factory wrapper around the Groq SDK.
 * Encapsulates SDK initialization, model selection, and availability checks.
 * No business logic. Only AI client access.
 * Singleton Pattern — exported as a single instance.
 *
 * Failover: When Groq times out (503) or errors, callers fall back to Gemini,
 * then to heuristic fallback. The same prompt + response schema is sent to both
 * models — no conversation context is lost because these are single-shot requests.
 */

import Groq from 'groq-sdk';
import { logger } from '../utils/winston.js';

/** Model identifier — Llama 3.3 70B on Groq infrastructure */
const TEXT_MODEL = 'llama-3.3-70b-versatile';

/** Request timeout in milliseconds (15s — Groq is fast but we cap it) */
const REQUEST_TIMEOUT_MS = 15_000;

class GroqClient {
  private client: Groq | null;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('GROQ_API_KEY not set — Groq features will fall back to Gemini or heuristic responses.');
      this.client = null;
    } else {
      this.client = new Groq({
        apiKey: this.apiKey,
        timeout: REQUEST_TIMEOUT_MS,
      });
    }
  }

  /** Whether the Groq API is available (key configured). */
  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Generate structured JSON content using Llama 3.3 via Groq.
   * Returns parsed text or null if unavailable.
   * Throws on timeout/503 so callers can fall back to Gemini.
   */
  async generateText(prompt: string, jsonSchema: Record<string, unknown>): Promise<string | null> {
    if (!this.client) {
      logger.debug('[GroqClient] Client unavailable (no API key) — skipping');
      return null;
    }

    const startTime = Date.now();
    logger.info('[GroqClient] Sending request to Groq', {
      model: TEXT_MODEL,
      promptLength: prompt.length,
    });

    const response = await this.client.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a veterinary AI assistant specializing in feline health. Always respond with valid JSON matching the requested schema. Do not include markdown formatting or code fences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_object',
      },
      temperature: 0.3,
      max_tokens: 2048,
    });

    const elapsed = Date.now() - startTime;
    const text = response.choices[0]?.message?.content;
    const usage = response.usage;

    logger.info('[GroqClient] Response received', {
      model: response.model,
      elapsedMs: elapsed,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      hasContent: !!text,
      finishReason: response.choices[0]?.finish_reason,
    });

    if (!text) {
      logger.warn('[GroqClient] Empty content in response', {
        finishReason: response.choices[0]?.finish_reason,
      });
    }

    return text ?? null;
  }
}

/** Singleton instance */
export const groqClient = new GroqClient();
