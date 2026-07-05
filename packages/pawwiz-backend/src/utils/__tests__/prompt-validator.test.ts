// Feature: behavior-companion-chat — prompt guardrails
//
// Covers the safety/UX gatekeeping layer that decides whether a user message is
// a greeting, an inappropriate (animal-harm) request, a vague prompt needing
// clarification, or a structured-but-thin prompt needing a curiosity follow-up.
//
// Emphasis: strong assertions on the *classification decision* (not just "some
// string returned"), branch coverage of every reason path, and property-based
// invariants over the mutually-exclusive routing rules.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isGreeting,
  generateFollowUp,
  validatePrompt,
  checkInappropriate,
} from '../prompt-validator.js';

// ───────────────────────────────────────────────────────────────────────────
// isGreeting
// ───────────────────────────────────────────────────────────────────────────
describe('isGreeting', () => {
  it('recognizes bare greetings (with trailing punctuation / repeated letters)', () => {
    for (const g of ['hi', 'Hello', 'HEY!', 'yo', 'sup', 'heyyy', 'hellooo', '  hola  ', 'bonjour']) {
      expect(isGreeting(g)).toBe(true);
    }
  });

  it('does NOT treat greeting+context as a bare greeting', () => {
    for (const g of ['hi my cat is meowing', 'hello there she is hiding', 'hey why does she hiss']) {
      expect(isGreeting(g)).toBe(false);
    }
  });

  it('Property: any greeting followed by real words is never a bare greeting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('hi', 'hey', 'hello', 'yo', 'sup'),
        fc.stringMatching(/^[a-z]{3,10}( [a-z]{3,10}){1,4}$/),
        (greet, tail) => {
          expect(isGreeting(`${greet} ${tail}`)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// checkInappropriate — animal-safety guardrail
// ───────────────────────────────────────────────────────────────────────────
describe('checkInappropriate', () => {
  it('flags messages requesting harm to the animal', () => {
    for (const msg of [
      'how do I hurt my cat',
      'ways to harm the cat',
      'I want to kill it',
      'is it ok to abuse my pet',
    ]) {
      const r = checkInappropriate(msg);
      expect(r.isInappropriate).toBe(true);
      expect(r.reason).toMatch(/harm animals/i);
    }
  });

  it('is case-insensitive on the harm keywords', () => {
    expect(checkInappropriate('HURT the cat').isInappropriate).toBe(true);
    expect(checkInappropriate('KILL').isInappropriate).toBe(true);
  });

  it('does not flag benign behavioral descriptions', () => {
    for (const msg of ['my cat is purring on my lap', 'she meows at night', 'he plays with toys']) {
      expect(checkInappropriate(msg).isInappropriate).toBe(false);
    }
  });

  it('Property: any message containing a harm keyword is always flagged', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('hurt', 'harm', 'kill', 'abuse'),
        fc.string({ maxLength: 40 }),
        fc.string({ maxLength: 40 }),
        (kw, pre, post) => {
          expect(checkInappropriate(`${pre} ${kw} ${post}`).isInappropriate).toBe(true);
        }
      ),
      { numRuns: 150 }
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// generateFollowUp — curiosity questions for structured-but-thin prompts
// ───────────────────────────────────────────────────────────────────────────
describe('generateFollowUp', () => {
  it('fires a follow-up for a thin topical prompt with no specific context', () => {
    const r = generateFollowUp('my cat keeps meowing');
    expect(r.needsFollowUp).toBe(true);
    expect(r.question.length).toBeGreaterThan(0);
    expect(r.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('suppresses follow-up once the message already carries specific context', () => {
    // "at night" + "door" are ALREADY_SPECIFIC_MARKERS → route straight to decode
    const r = generateFollowUp('my cat meows at night by the door');
    expect(r.needsFollowUp).toBe(false);
    expect(r.suggestedPrompts).toEqual([]);
  });

  it('returns no follow-up when no topic keyword matches', () => {
    const r = generateFollowUp('the room is calm and bright');
    expect(r.needsFollowUp).toBe(false);
  });

  // Characterization test — documents a KNOWN weakness of the naive `includes()`
  // substring matching: "weather" contains the "eat" food-topic keyword, so an
  // unrelated sentence is misclassified as a feeding follow-up. Pinned so any
  // future fix (word-boundary matching) is a deliberate, visible change.
  it('KNOWN false-positive: substring match treats "weather" as the "eat" topic', () => {
    const r = generateFollowUp('the weather is nice today');
    expect(r.needsFollowUp).toBe(true);
  });

  it('matches distinct topics to distinct questions (aggression vs affection)', () => {
    const aggressive = generateFollowUp('she keeps hissing');
    const affection = generateFollowUp('she keeps purring');
    expect(aggressive.needsFollowUp).toBe(true);
    expect(affection.needsFollowUp).toBe(true);
    expect(aggressive.question).not.toEqual(affection.question);
  });

  it('Property: presence of any specificity marker forces needsFollowUp=false', () => {
    const markers = ['at night', 'door', 'litter', 'since we', 'because', 'belly', 'vet'];
    fc.assert(
      fc.property(
        fc.constantFrom('meowing', 'hiding', 'hissing', 'purring', 'licking'),
        fc.constantFrom(...markers),
        (topic, marker) => {
          // topic keyword present AND specificity marker present → suppressed
          const r = generateFollowUp(`my cat is ${topic} ${marker} lately`);
          expect(r.needsFollowUp).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: a follow-up always carries a question + non-empty chips when it fires', () => {
    fc.assert(
      fc.property(fc.constantFrom('meowing', 'hiding', 'hissing', 'purring', 'zoomies'), (topic) => {
        const r = generateFollowUp(`cat ${topic}`);
        if (r.needsFollowUp) {
          expect(r.question.trim().length).toBeGreaterThan(0);
          expect(r.suggestedPrompts.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 50 }
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// validatePrompt — vague-message routing
// ───────────────────────────────────────────────────────────────────────────
describe('validatePrompt', () => {
  it('never marks a bare greeting as vague', () => {
    for (const g of ['hi', 'hello', 'hey!']) {
      expect(validatePrompt(g).isVague).toBe(false);
    }
  });

  it('routes structured/specific prompts to the AI (not vague)', () => {
    expect(validatePrompt('my cat meows at night near the door').isVague).toBe(false);
  });

  it('flags "weird"/"strange" with the general-details reason + suggestions', () => {
    const r = validatePrompt('my cat is being weird');
    expect(r.isVague).toBe(true);
    expect(r.reason).toMatch(/weird/i);
    expect(r.clarifyingQuestion.length).toBeGreaterThan(0);
    expect(r.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('flags "acting up" / "acting funny" with the behavior-detail reason', () => {
    const r = validatePrompt('she is acting up');
    expect(r.isVague).toBe(true);
    expect(r.reason).toMatch(/unclear behavior/i);
  });

  it('flags "not normal" with the baseline-comparison reason', () => {
    const r = validatePrompt('he is not normal');
    expect(r.isVague).toBe(true);
    expect(r.reason).toMatch(/vague assessment/i);
  });

  it('flags very short messages (< 5 words) as insufficient detail', () => {
    const r = validatePrompt('cat sick help');
    expect(r.isVague).toBe(true);
    expect(r.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('Property: when isVague is true, it always supplies a question and >=1 suggestion', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('weird', 'strange', 'acting up', 'not normal', 'idk', 'help me'),
        (phrase) => {
          const r = validatePrompt(phrase);
          if (r.isVague) {
            expect(r.clarifyingQuestion.trim().length).toBeGreaterThan(0);
            expect(r.suggestedPrompts.length).toBeGreaterThan(0);
            expect(r.reason.trim().length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: not-vague results carry empty reason/question/suggestions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'my cat meows at night near the door',
          'she hides under the bed since we moved',
          'he licks his belly obsessively'
        ),
        (msg) => {
          const r = validatePrompt(msg);
          expect(r.isVague).toBe(false);
          expect(r.reason).toBe('');
          expect(r.clarifyingQuestion).toBe('');
          expect(r.suggestedPrompts).toEqual([]);
        }
      ),
      { numRuns: 50 }
    );
  });
});
