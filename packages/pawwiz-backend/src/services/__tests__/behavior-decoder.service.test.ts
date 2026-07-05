// Feature: behavior-companion-chat — Wiz decoder service
//
// Covers the decode() router: greeting → inappropriate → vague → follow-up →
// conversational → AI analysis → heuristic fallback. Every branch is exercised
// by driving inputs through the decision tree and confirming the correct response
// discriminant is returned. The AI failover chain is tested with intentional
// dependency breakage (same pattern as diet-optimization).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import type { BehaviorDecodeRequest } from '../../types/shared.js';

vi.mock('../../repositories/groq.repository.js', () => ({
  groqClient: { isAvailable: true, generateText: vi.fn(), generateConversationalText: vi.fn() },
}));
vi.mock('../../repositories/gemini.repository.js', () => ({
  geminiClient: { isAvailable: true, generateText: vi.fn(), generateConversationalText: vi.fn() },
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { behaviorDecoderService } from '../behavior-decoder.service.js';
import { groqClient } from '../../repositories/groq.repository.js';
import { geminiClient } from '../../repositories/gemini.repository.js';

const groq = groqClient as unknown as {
  isAvailable: boolean;
  generateText: ReturnType<typeof vi.fn>;
  generateConversationalText: ReturnType<typeof vi.fn>;
};
const gemini = geminiClient as unknown as {
  isAvailable: boolean;
  generateText: ReturnType<typeof vi.fn>;
  generateConversationalText: ReturnType<typeof vi.fn>;
};

const baseReq = (over: Partial<BehaviorDecodeRequest> = {}): BehaviorDecodeRequest => ({
  vocalDescription: 'my cat is hissing loudly near the door at night',
  bodyLanguageSigns: ['ears back', 'tail puffed'],
  context: 'after a loud noise',
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  groq.isAvailable = false;
  gemini.isAvailable = false;
});

// ─────────────────────────────────────────────────────────────────────────────
// Routing decisions (pre-AI gates)
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDecoderService — routing gates', () => {
  it('returns clarifying response for a bare greeting', async () => {
    const r = await behaviorDecoderService.decode(baseReq({ vocalDescription: 'hello' }));
    expect(r.type).toBe('clarifying');
  });

  it('returns clarifying response for inappropriate content', async () => {
    const r = await behaviorDecoderService.decode(baseReq({ vocalDescription: 'how to hurt my cat' }));
    expect(r.type).toBe('clarifying');
    if (r.type === 'clarifying') {
      expect(r.question).toMatch(/harm/i);
    }
  });

  it('returns clarifying response for a vague message', async () => {
    const r = await behaviorDecoderService.decode(baseReq({ vocalDescription: 'she is being weird' }));
    expect(r.type).toBe('clarifying');
    if (r.type === 'clarifying') {
      expect(r.suggestedPrompts.length).toBeGreaterThan(0);
    }
  });

  it('returns follow-up for a thin topical prompt (≤10 words)', async () => {
    const r = await behaviorDecoderService.decode(baseReq({ vocalDescription: 'my cat keeps meowing' }));
    expect(r.type).toBe('followup');
    if (r.type === 'followup') {
      expect(r.question.length).toBeGreaterThan(0);
    }
  });

  it('skips follow-up for messages with enough words (>10) even if topic matches', async () => {
    // 12 words, contains "meow" topic but specific context suppresses follow-up via ALREADY_SPECIFIC
    const r = await behaviorDecoderService.decode(
      baseReq({ vocalDescription: 'my cat meows constantly at night near the bedroom door since we moved' })
    );
    // Should route to analysis (not follow-up) since the message has context markers
    expect(r.type).toBe('analysis');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Conversational follow-up path
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDecoderService — conversational path', () => {
  it('routes conversational follow-ups to plain-text AI (Groq)', async () => {
    groq.isAvailable = true;
    groq.generateConversationalText.mockResolvedValueOnce('Yes, that is normal behavior.');
    const r = await behaviorDecoderService.decode(
      baseReq({
        vocalDescription: 'Is this normal?',
        conversationHistory: [
          { role: 'user', content: 'my cat meows at night' },
          { role: 'wiz', content: 'Night vocalizations can mean several things...' },
        ],
      })
    );
    expect(r.type).toBe('conversational');
    if (r.type === 'conversational') {
      expect(r.text).toContain('normal');
    }
  });

  it('falls back to Gemini conversational when Groq fails', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateConversationalText.mockRejectedValueOnce(new Error('timeout'));
    gemini.generateConversationalText.mockResolvedValueOnce('That sounds fine to me.');
    const r = await behaviorDecoderService.decode(
      baseReq({
        vocalDescription: 'Should I be worried?',
        conversationHistory: [{ role: 'user', content: 'she hisses at guests' }, { role: 'wiz', content: 'Hissing at strangers is defensive.' }],
      })
    );
    expect(r.type).toBe('conversational');
  });

  it('falls back to heuristic when both AI providers fail for conversational', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateConversationalText.mockResolvedValueOnce('');
    gemini.generateConversationalText.mockRejectedValueOnce(new Error('down'));
    const r = await behaviorDecoderService.decode(
      baseReq({
        vocalDescription: 'What should I do?',
        conversationHistory: [{ role: 'user', content: 'cat hiding' }, { role: 'wiz', content: 'Hiding often signals stress.' }],
      })
    );
    expect(r.type).toBe('conversational');
    if (r.type === 'conversational') {
      expect(r.text.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Analysis path — AI failover chain
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDecoderService — analysis failover (Groq→Gemini→heuristic)', () => {
  const goodAnalysis = {
    vocalAnalysis: 'Hissing indicates distress.',
    bodyLanguageAnalysis: 'Ears back + tail puffed: defensive posture.',
    decodedMeaning: 'Cat feels threatened.',
    catState: 'Aggressive/Defensive',
    confidenceScore: 0.85,
    actionPlan: ['Give space', 'Remove stressor'],
  };

  it('Tier 1: returns Groq analysis when available', async () => {
    groq.isAvailable = true;
    groq.generateText.mockResolvedValueOnce(JSON.stringify(goodAnalysis));
    const r = await behaviorDecoderService.decode(baseReq());
    expect(r.type).toBe('analysis');
    if (r.type === 'analysis') {
      expect(r.analysis.catState).toBe('Aggressive/Defensive');
    }
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it('Tier 2: falls to Gemini when Groq returns null', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockResolvedValueOnce(null);
    gemini.generateText.mockResolvedValueOnce(JSON.stringify(goodAnalysis));
    const r = await behaviorDecoderService.decode(baseReq());
    expect(r.type).toBe('analysis');
    expect(gemini.generateText).toHaveBeenCalledTimes(1);
  });

  it('Tier 2: falls to Gemini when Groq returns malformed JSON', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockResolvedValueOnce('not-json!!');
    gemini.generateText.mockResolvedValueOnce(JSON.stringify(goodAnalysis));
    const r = await behaviorDecoderService.decode(baseReq());
    expect(r.type).toBe('analysis');
  });

  it('Tier 3: returns heuristic fallback when both AI providers fail', async () => {
    groq.isAvailable = true;
    gemini.isAvailable = true;
    groq.generateText.mockRejectedValueOnce(new Error('groq down'));
    gemini.generateText.mockRejectedValueOnce(new Error('gemini down'));
    const r = await behaviorDecoderService.decode(baseReq());
    expect(r.type).toBe('analysis');
    if (r.type === 'analysis') {
      expect(r.analysis.confidenceScore).toBe(0.75);
    }
  });

  it('heuristic detects stress signs and returns Overstimulated state', async () => {
    const r = await behaviorDecoderService.decode(
      baseReq({ bodyLanguageSigns: ['ears back', 'pupils dilated'] })
    );
    expect(r.type).toBe('analysis');
    if (r.type === 'analysis') {
      expect(r.analysis.catState).toBe('Overstimulated');
    }
  });

  it('heuristic returns Playful when no stress signs present', async () => {
    const r = await behaviorDecoderService.decode(
      baseReq({ bodyLanguageSigns: ['tail up', 'relaxed posture'] })
    );
    expect(r.type).toBe('analysis');
    if (r.type === 'analysis') {
      expect(r.analysis.catState).toBe('Playful');
    }
  });

  it('Property: analysis always has all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('ears back', 'tail up', 'pupils dilated', 'hissing', 'kneading'), { minLength: 1, maxLength: 3 }),
        async (signs) => {
          const r = await behaviorDecoderService.decode(baseReq({ bodyLanguageSigns: signs }));
          if (r.type === 'analysis') {
            expect(r.analysis.vocalAnalysis).toBeDefined();
            expect(r.analysis.bodyLanguageAnalysis).toBeDefined();
            expect(r.analysis.decodedMeaning).toBeDefined();
            expect(r.analysis.actionPlan.length).toBeGreaterThan(0);
            expect(r.analysis.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(r.analysis.confidenceScore).toBeLessThanOrEqual(1);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
