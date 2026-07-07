/**
 * Service Layer — Behavior Decoder
 * Interprets cat vocalizations and body language via AI.
 * 3-tier failover: Groq (Llama 3.3) → Gemini → Heuristic fallback.
 * Validates prompts for clarity and asks clarifying questions if needed.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { groqClient } from '../repositories/groq.repository.js';
import { geminiClient } from '../repositories/gemini.repository.js';
import { validatePrompt, checkInappropriate, checkOffTopic, isGreeting, generateFollowUp } from '../utils/prompt-validator.js';
import { logger } from '../utils/winston.js';
import type { BehaviorDecodeRequest, BehaviorDecodeResponse, ConversationalReply, EnrichedBehaviorCatContext } from '../types/shared.js';

/**
 * Patterns that indicate the current message is a conversational follow-up
 * referencing something already discussed. These should bypass the vague/follow-up
 * gate and go straight to the AI with prior context attached.
 *
 * Deliberately excludes "My cat is/does/was ..." openers — those are new
 * behavior descriptions, not follow-up references to a prior exchange.
 */
const CONVERSATIONAL_PATTERNS = [
  /^is\s+this\s+(normal|okay|ok|common|expected|dangerous|serious|bad|good)/i,
  /^(is|does|can|should|will|would)\s+.{0,60}\?$/i,
  /^(what|why|how|when|where)\s+(does|do|is|are|did|should|would|can|could)\s+.{0,60}/i,
  /^(what does (that|this) mean|what should i do|what can i do)/i,
  /^(so|then|but|and)\s+(what|why|how|is|does|she|he|it|my cat)\b/i,
  /^(thanks?|thank you|ok|okay|i see|got it|understood|makes sense|wow|oh|really)[,.]?\s*(but|so|what|why|how|is|can)?\b/i,
  /^(can you|could you|please)\s+(explain|tell me|help me|elaborate)/i,
  /^(tell me more|more info|more details|explain)/i,
  // Only match bare pronouns (she/he/it) as back-references — NOT "my cat is/does"
  // which is always a new behavior description, not a conversational follow-up.
  /^(she|he|it)\s+(does|did|is|was|seems?|looks?|sounds?|keeps?|keeps on|always|never|usually|sometimes)\b/i,
];

/** True when the current message is a conversational reference rather than a new behavior description. */
function isConversational(message: string): boolean {
  const trimmed = message.trim();
  return CONVERSATIONAL_PATTERNS.some((re) => re.test(trimmed));
}

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

export interface ClarifyingResponse {
  type: 'clarifying';
  question: string;
  suggestedPrompts: string[];
}

export interface FollowUpResponse {
  type: 'followup';
  question: string;
  suggestedPrompts: string[];
}

export interface BehaviorAnalysis {
  type: 'analysis';
  analysis: BehaviorDecodeResponse;
}

export type DecoderResponse = ClarifyingResponse | FollowUpResponse | BehaviorAnalysis | ConversationalReply;

class BehaviorDecoderService {
  /**
   * Validate and decode cat behavior from vocal and body language descriptions.
   * First validates prompt clarity, then proceeds with analysis.
   * Failover chain: Groq → Gemini → Heuristic
   */
  async decode(request: BehaviorDecodeRequest): Promise<DecoderResponse> {
    // Handle greetings with a friendly Wiz reply — no behavior analysis needed.
    // When cat context is available, personalize the greeting with the cat's name and details.
    if (isGreeting(request.vocalDescription)) {
      logger.info('[BehaviorDecoder] Greeting detected — returning friendly response');
      const ctx = request.catContext as EnrichedBehaviorCatContext | undefined;

      let greeting: string;
      const defaultSuggestions = [
        'My cat is meowing loudly at night',
        'My cat keeps kneading and purring',
        'My cat is hiding and seems scared',
        'My cat is chirping at birds through the window',
      ];

      if (ctx?.name) {
        // Build a personalized greeting that shows we know the cat
        let details = `I can see you have ${ctx.name}`;
        if (ctx.breed) details += ` (${ctx.breed})`;
        details += ` — a${ctx.sex === 'female' ? ' female' : ' male'} ${ctx.lifeStage ?? 'adult'}`;
        if (ctx.age) details += `, ${ctx.age} ${ctx.lifeStage === 'kitten' ? 'months' : 'years'} old`;
        details += '.';

        // Add pregnancy awareness
        if (ctx.isPregnant && ctx.gestationWeek) {
          details += ` I also see ${ctx.name} is currently pregnant (week ${ctx.gestationWeek}) — I'll factor that into any behavior analysis!`;
        }

        greeting = `Hey! 👋 ${details} Tell me what ${ctx.name} is up to — describe any vocalizations, body language, or behavior you're curious about and I'll decode it for you.`;
      } else {
        greeting = "Hey! 👋 Great to meet you! I'm Wiz, your cat behavior specialist. Tell me what your cat is up to — describe their vocalizations, body language, or any behavior you're curious about and I'll decode it for you.";
      }

      return {
        type: 'clarifying',
        question: greeting,
        suggestedPrompts: ctx?.name
          ? [
              `${ctx.name} is meowing loudly at night`,
              `${ctx.name} keeps kneading and purring`,
              `${ctx.name} is hiding and seems scared`,
              `${ctx.name} is chirping at birds through the window`,
            ]
          : defaultSuggestions,
      };
    }

    // ── Follow-up gate (runs before conversational routing) ─────────────────
    // A message that matches a recognisable behavioral topic (eating, hiding,
    // meowing, etc.) and is short (≤ 10 words) should always receive targeted
    // follow-up chips — even when there is prior conversation history.
    // This must run *before* the isConversational check so that thin behavioral
    // openers ("My cat is not eating") are never swallowed by the conversational
    // route, which would silently drop the suggestion chips.
    const followUpEarly = generateFollowUp(request.vocalDescription);
    if (followUpEarly.needsFollowUp) {
      const wordCount = request.vocalDescription.trim().split(/\s+/).length;
      if (wordCount <= 10) {
        logger.info('[BehaviorDecoder] Follow-up triggered (early gate) for behavioral topic', {
          vocalDescription: request.vocalDescription,
          wordCount,
        });
        return {
          type: 'followup',
          question: followUpEarly.question,
          suggestedPrompts: followUpEarly.suggestedPrompts,
        };
      }
    }

    // Conversational follow-up — the message references a prior exchange.
    // Route through a plain-text prompt so the AI answers naturally instead of
    // re-running a structured behavior decode.
    const hasHistory = request.conversationHistory && request.conversationHistory.length > 0;
    if (hasHistory && isConversational(request.vocalDescription)) {
      logger.debug('[BehaviorDecoder] Conversational follow-up detected — routing to conversational AI', {
        historyLength: request.conversationHistory!.length,
      });
      const convPrompt = this.buildConversationalPrompt(request);

      // Tier 1: Groq plain-text
      if (groqClient.isAvailable) {
        try {
          const text = await groqClient.generateConversationalText(convPrompt);
          if (text?.trim()) {
            logger.info('[BehaviorDecoder] Conversational response from Groq');
            return { type: 'conversational', text: text.trim() };
          }
        } catch (err) {
          logger.warn('[BehaviorDecoder] Groq conversational failed — trying Gemini', {
            error: (err as Error).message,
          });
        }
      }

      // Tier 2: Gemini plain-text
      if (geminiClient.isAvailable) {
        try {
          const text = await geminiClient.generateConversationalText(convPrompt);
          if (text?.trim()) {
            logger.info('[BehaviorDecoder] Conversational response from Gemini');
            return { type: 'conversational', text: text.trim() };
          }
        } catch (err) {
          logger.error('[BehaviorDecoder] Gemini conversational failed — using heuristic', {
            error: (err as Error).message,
          });
        }
      }

      // Tier 3: contextual heuristic for conversational messages
      return this.generateConversationalFallback(request);
    }

    // Check for inappropriate content
    const inappropriate = checkInappropriate(request.vocalDescription);
    if (inappropriate.isInappropriate) {
      logger.warn('[BehaviorDecoder] Inappropriate prompt detected', { reason: inappropriate.reason });
      return {
        type: 'clarifying',
        question: inappropriate.reason,
        suggestedPrompts: [
          'My cat is meowing loudly',
          'My cat is playing with toys',
          'My cat seems restless today',
        ],
      };
    }

    // Check for off-topic messages (programming, math, general knowledge, etc.)
    const catName = (request.catContext as EnrichedBehaviorCatContext | undefined)?.name;
    const offTopic = checkOffTopic(request.vocalDescription, catName);
    if (offTopic.isOffTopic) {
      logger.info('[BehaviorDecoder] Off-topic message detected — returning playful redirect', {
        vocalDescription: request.vocalDescription,
      });
      return {
        type: 'clarifying',
        question: offTopic.response,
        suggestedPrompts: offTopic.suggestedPrompts,
      };
    }

    // Validate prompt clarity
    const validation = validatePrompt(request.vocalDescription);
    if (validation.isVague) {
      logger.info('[BehaviorDecoder] Vague prompt detected', {
        reason: validation.reason,
        question: validation.clarifyingQuestion,
      });

      return {
        type: 'clarifying',
        question: validation.clarifyingQuestion,
        suggestedPrompts: validation.suggestedPrompts,
      };
    }

    // Check for curiosity-driven follow-up — message has a recognizable topic
    // but not enough detail for a confident behavioral decode.
    // NOTE: the early gate above already handles the short-message case
    // (≤ 10 words). This block catches longer messages that are still
    // topic-matched but just barely over the threshold — kept for safety.
    const followUp = generateFollowUp(request.vocalDescription);
    if (followUp.needsFollowUp) {
      // Only re-trigger for messages that slipped through (> 10 words is
      // already handled by the AI decode path, so this is effectively a no-op
      // in normal flow — it guards against edge-cases only).
      const wordCount = request.vocalDescription.trim().split(/\s+/).length;
      if (wordCount <= 10) {
        logger.info('[BehaviorDecoder] Follow-up triggered (secondary gate)', {
          vocalDescription: request.vocalDescription,
          wordCount,
        });
        return {
          type: 'followup',
          question: followUp.question,
          suggestedPrompts: followUp.suggestedPrompts,
        };
      }
    }

    // Prompt is clear — proceed with analysis
    const prompt = this.buildPrompt(request);

    logger.debug('[BehaviorDecoder] Decode request received', {
      bodyLanguageSignCount: request.bodyLanguageSigns.length,
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
          return { type: 'analysis', analysis: result };
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
        return { type: 'analysis', analysis: result };
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
    return { type: 'analysis', analysis: this.generateFallbackResponse(request) };
  }

  /**
   * Build the behavior decode prompt from request data.
   * Includes cat profile context when provided for personalised decoding.
   * When an EnrichedBehaviorCatContext is available (diet + pregnancy data),
   * includes those details so the AI can factor in nutritional state, pregnancy
   * stage, and physical condition into its behavioral analysis.
   * Includes conversation history when present so the AI can answer follow-ups
   * in context. Shared across all AI providers.
   */
  private buildPrompt(request: BehaviorDecodeRequest): string {
    const ctx = request.catContext as EnrichedBehaviorCatContext | undefined;

    let catSection = '';
    if (ctx) {
      // Basic identity
      catSection = `\nCat profile: ${ctx.name}`;
      if (ctx.breed) catSection += ` (${ctx.breed})`;
      catSection += `, ${ctx.sex ?? 'unknown sex'}, ${ctx.lifeStage ?? 'adult'}`;
      if (ctx.age) catSection += `, ${ctx.age} ${ctx.lifeStage === 'kitten' ? 'months' : 'years'} old`;

      // Physical condition (from diet profile)
      if (ctx.weight) {
        catSection += `, weight: ${ctx.weight}${ctx.isKg ? 'kg' : 'lbs'}`;
      }
      if (ctx.isSpayedNeutered !== undefined) {
        catSection += `, ${ctx.isSpayedNeutered ? 'spayed/neutered' : 'intact (not spayed/neutered)'}`;
      }
      catSection += '.';

      // Diet context
      if (ctx.foodPreference || ctx.recentMealPattern || ctx.waterIntake !== undefined) {
        catSection += '\nDiet info:';
        if (ctx.foodPreference) catSection += ` food preference: ${ctx.foodPreference}.`;
        if (ctx.recentMealPattern) catSection += ` ${ctx.recentMealPattern}.`;
        if (ctx.waterIntake !== undefined && ctx.waterIntake !== null) {
          catSection += ` Water intake today: ${ctx.waterIntake}ml.`;
        }
      }

      // Pregnancy context (critical for behavior interpretation)
      if (ctx.isPregnant && ctx.gestationWeek) {
        catSection += `\n⚠️ PREGNANT — Week ${ctx.gestationWeek}/9-10 (day ${ctx.daysPregnant}).`;
        if (ctx.pregnancySymptoms && ctx.pregnancySymptoms.length > 0) {
          catSection += ` Recent symptoms: ${ctx.pregnancySymptoms.join(', ')}.`;
        }
        if (ctx.pregnancyMood && ctx.pregnancyMood.length > 0) {
          catSection += ` Recent mood/behavior from pregnancy log: ${ctx.pregnancyMood.join(', ')}.`;
        }
        if (ctx.pregnancyAppetite) catSection += ` Appetite: ${ctx.pregnancyAppetite}.`;
        if (ctx.pregnancyEnergy) catSection += ` Energy: ${ctx.pregnancyEnergy}.`;
      } else if (ctx.isInHeat) {
        catSection += '\nNote: This is an intact female who may be in or near a heat cycle.';
      }

      catSection += '\n';
    }

    const historySection =
      request.conversationHistory && request.conversationHistory.length > 0
        ? `\nConversation so far:\n${request.conversationHistory
            .map((t) => `${t.role === 'user' ? 'Owner' : 'Wiz'}: ${t.content}`)
            .join('\n')}\n`
        : '';

    return `Decode the following feline behavioral state.${catSection}${historySection}
<user_input>
Current message: ${request.vocalDescription}
Body Language Signs: ${request.bodyLanguageSigns.join(', ')}
Context: ${request.context}
</user_input>

${historySection ? 'Use the conversation history above to answer follow-up questions in context. ' : ''}${catSection ? `Use the cat profile above to personalise your analysis. Factor in the cat's physical condition, diet status, and reproductive state (pregnancy/heat) when interpreting behavior — these significantly affect feline mood, energy, and vocalization patterns. ` : ''}Analyze vocal signals, tail position, eye dilation, and ear positions. Return a detailed behavior decode response as JSON with these fields:
- vocalAnalysis (string): Analysis of the vocal signals
- bodyLanguageAnalysis (string): Analysis of the body language
- decodedMeaning (string): Overall interpretation of the behavior
- catState (string, one of: "Happy/Relaxed", "Anxious/Stressed", "Playful", "Aggressive/Defensive", "Overstimulated", "Sick/In Pain", "Unknown")
- confidenceScore (number between 0 and 1)
- actionPlan (array of strings): Recommended actions for the owner`;
  }

  /**
   * Build a plain-text conversational prompt for follow-up questions.
   * Strips markdown formatting from Wiz history so the AI reasons against
   * clean text rather than its own rendering syntax.
   * Includes enriched cat context when provided for personalised answers.
   */
  private buildConversationalPrompt(request: BehaviorDecodeRequest): string {
    const ctx = request.catContext as EnrichedBehaviorCatContext | undefined;

    let catLine = '';
    if (ctx) {
      catLine = `\nCat: ${ctx.name}`;
      if (ctx.breed) catLine += ` (${ctx.breed})`;
      catLine += `, ${ctx.sex ?? 'unknown sex'}, ${ctx.lifeStage ?? 'adult'}`;
      if (ctx.age) catLine += `, ${ctx.age} ${ctx.lifeStage === 'kitten' ? 'months' : 'years'} old`;
      if (ctx.weight) catLine += `, ${ctx.weight}${ctx.isKg ? 'kg' : 'lbs'}`;
      if (ctx.isSpayedNeutered !== undefined) {
        catLine += ctx.isSpayedNeutered ? ', spayed/neutered' : ', intact';
      }
      catLine += '.';

      if (ctx.isPregnant && ctx.gestationWeek) {
        catLine += ` Currently pregnant (week ${ctx.gestationWeek}).`;
        if (ctx.pregnancyMood && ctx.pregnancyMood.length > 0) {
          catLine += ` Recent mood: ${ctx.pregnancyMood.join(', ')}.`;
        }
      }
      if (ctx.recentMealPattern) {
        catLine += ` Diet: ${ctx.recentMealPattern}.`;
      }
      catLine += '\n';
    }

    const history = (request.conversationHistory ?? [])
      .map((t) => {
        const role = t.role === 'user' ? 'Owner' : 'Wiz';
        const clean = this.stripMarkdown(t.content);
        return `${role}: ${clean}`;
      })
      .join('\n');

    return `${catLine}Previous conversation:
${history}

<user_input>
Owner's new message: ${request.vocalDescription}
</user_input>

Answer the owner's question directly based on the conversation above. Factor in the cat's health profile (diet, weight, reproductive state) when relevant. Be warm, concise, and practical.`;
  }

  /**
   * Remove markdown formatting from a string so AI history context is clean.
   * Strips **bold**, bullet "•", and confidence badges like "(60% confidence)".
   */
  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')           // **bold** → plain
      .replace(/^[•\-]\s+/gm, '- ')              // normalise bullets
      .replace(/\(\d+%\s*confidence\)/gi, '')     // remove confidence badges
      .replace(/[😺😿🎾🙀⚡🩺❓🐱🐾👋]/gu, '')    // strip emoji from Wiz responses
      .replace(/\n{3,}/g, '\n\n')                 // collapse excess blank lines
      .trim();
  }

  /**
   * Contextual heuristic fallback for conversational follow-ups when both
   * AI providers are unavailable. Returns a plain-text ConversationalReply.
   */
  private generateConversationalFallback(request: BehaviorDecodeRequest): ConversationalReply {
    const lastWizMessage = request.conversationHistory
      ?.filter((t) => t.role === 'wiz')
      .at(-1)?.content ?? '';

    const text = lastWizMessage
      ? `Based on what we discussed earlier — ${this.stripMarkdown(lastWizMessage).slice(0, 200)} — I'd say your concern is valid. If you're still unsure, a quick vet check is always the safest call. 🐾`
      : "I'm unable to give you a more detailed answer right now — the AI service is temporarily unavailable. Please try again in a moment, and I'll be here to help! 🐾";

    return { type: 'conversational', text };
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

  /**
   * Extract structured BehaviorLog entries from a completed AI decode.
   *
   * When the behavior decoder has already produced a `BehaviorAnalysis` result,
   * we derive the log entries directly from the AI's own `catState` and confidence
   * — no second AI call needed. For conversational replies (no structured analysis)
   * we fall back to a lightweight deterministic mapping.
   *
   * Returns an array of `ExtractedBehavior`-shaped objects ready to persist.
   */
  extractFromDecodeResult(
    userMessage: string,
    decodeResult: DecoderResponse,
  ): Array<{
    behaviorType: string;
    intensity: 'mild' | 'moderate' | 'severe';
    description: string;
    context?: string;
    confidence: number;
  }> {
    if (decodeResult.type === 'analysis') {
      const { catState, decodedMeaning, confidenceScore, actionPlan } = decodeResult.analysis;

      // Map the AI's catState enum → our stored behavior type vocabulary
      const stateToType: Record<string, string> = {
        'Happy/Relaxed': 'affectionate',
        'Anxious/Stressed': 'anxious',
        'Playful': 'playful',
        'Aggressive/Defensive': 'aggressive',
        'Overstimulated': 'aggressive',
        'Sick/In Pain': 'lethargic',
        'Unknown': 'vocalization',
      };

      const behaviorType = stateToType[catState] ?? 'vocalization';

      // Derive intensity from confidence score + state severity
      const severeStates = new Set(['Aggressive/Defensive', 'Overstimulated', 'Sick/In Pain']);
      const moderateStates = new Set(['Anxious/Stressed']);
      let intensity: 'mild' | 'moderate' | 'severe' = 'mild';
      if (severeStates.has(catState)) {
        intensity = confidenceScore >= 0.5 ? 'severe' : 'moderate';
      } else if (moderateStates.has(catState)) {
        intensity = confidenceScore >= 0.6 ? 'moderate' : 'mild';
      }

      // Build context string from action plan keywords
      const contextParts: string[] = [];
      const lowerMsg = userMessage.toLowerCase();
      if (/morn|dawn|early|wak/i.test(lowerMsg)) contextParts.push('morning');
      if (/afternoon|midday|day/i.test(lowerMsg)) contextParts.push('afternoon');
      if (/evening|dusk|sunset/i.test(lowerMsg)) contextParts.push('evening');
      if (/night|midnight|\d+am/i.test(lowerMsg)) contextParts.push('night');
      if (/food|eat|meal|fed|feed/i.test(lowerMsg)) contextParts.push('feeding');
      if (/play|toy|game/i.test(lowerMsg)) contextParts.push('playing');
      if (/noise|vacuum|thunder|firework|stranger|visitor/i.test(lowerMsg)) contextParts.push('stress');
      // Also pick up context clues from the action plan
      for (const step of (actionPlan ?? [])) {
        if (/vet|veterinarian/i.test(step)) contextParts.push('health concern');
        if (/stress|anxiety/i.test(step)) contextParts.push('anxiety trigger');
      }

      return [{
        behaviorType,
        intensity,
        description: decodedMeaning ?? userMessage,
        context: contextParts.length > 0 ? [...new Set(contextParts)].join(', ') : undefined,
        confidence: confidenceScore ?? 0.5,
      }];
    }

    // For conversational/clarifying replies — nothing substantive to log
    return [];
  }
}

/** Singleton instance */
export const behaviorDecoderService = new BehaviorDecoderService();
