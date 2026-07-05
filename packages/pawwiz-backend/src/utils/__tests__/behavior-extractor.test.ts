// Feature: behavior-decoder / behavior-dashboard — keyword behavior extraction
//
// The extractor is the deterministic backbone behind behavior logging and the
// dashboard analytics. These tests pin its structural invariants (confidence
// bounds, intensity enum closure, keyword provenance), branch-cover the
// intensity/context/summary logic, and probe the timeframe-window filtering.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  extractBehaviors,
  generateBehaviorSummary,
  generateBehaviorPatterns,
  type ExtractedBehavior,
} from '../behavior-extractor.js';

const VALID_INTENSITIES = ['mild', 'moderate', 'severe'];

// ───────────────────────────────────────────────────────────────────────────
// extractBehaviors — structural invariants
// ───────────────────────────────────────────────────────────────────────────
describe('extractBehaviors', () => {
  it('returns an empty array when no behavior keyword is present', () => {
    expect(extractBehaviors('the weather is quite pleasant today')).toEqual([]);
  });

  it('extracts the playful behavior from a clear message', () => {
    const out = extractBehaviors('my cat keeps pouncing and chasing toys');
    const playful = out.find((b) => b.type === 'playful');
    expect(playful).toBeDefined();
    expect(playful!.keywords.length).toBeGreaterThan(0);
    // every reported keyword must genuinely occur in the (lowercased) message
    for (const kw of playful!.keywords) {
      expect('my cat keeps pouncing and chasing toys').toContain(kw);
    }
  });

  it('can extract multiple distinct behavior types from one message', () => {
    const out = extractBehaviors('she is hissing and attacking but later purring and cuddly');
    const types = out.map((b) => b.type);
    expect(types).toContain('aggressive');
    expect(types).toContain('affectionate');
  });

  it('escalates intensity to severe on explicit modifiers ("constantly")', () => {
    const out = extractBehaviors('my cat is meowing constantly all night');
    const vocal = out.find((b) => b.type === 'vocalization');
    expect(vocal).toBeDefined();
    expect(vocal!.intensity).toBe('severe');
  });

  it('marks moderate intensity on frequency modifiers ("frequently")', () => {
    const out = extractBehaviors('my cat is meowing frequently');
    const vocal = out.find((b) => b.type === 'vocalization');
    expect(vocal!.intensity).toBe('moderate');
  });

  it('attaches contextual tags (time + trigger) when present', () => {
    const out = extractBehaviors('my cat meows at night after eating');
    const vocal = out.find((b) => b.type === 'vocalization');
    expect(vocal!.context).toBeDefined();
    expect(vocal!.context).toContain('night');
    expect(vocal!.context).toContain('feeding');
  });

  it('Property: confidence is always within [0,1] and intensity is a valid enum', () => {
    const keywords = ['playing', 'hissing', 'hiding', 'purring', 'meowing', 'grooming', 'litter box', 'lethargic'];
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...keywords), { minLength: 1, maxLength: 6 }),
        (words) => {
          const out = extractBehaviors(`my cat is ${words.join(' and ')}`);
          for (const b of out) {
            expect(b.confidence).toBeGreaterThanOrEqual(0);
            expect(b.confidence).toBeLessThanOrEqual(1);
            expect(VALID_INTENSITIES).toContain(b.intensity);
            expect(b.description.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: extraction never invents keywords absent from the message', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('playing', 'hissing', 'hiding', 'purring', 'meowing'), {
          minLength: 1,
          maxLength: 5,
        }),
        (words) => {
          const msg = `cat ${words.join(' ')}`;
          const lower = msg.toLowerCase();
          for (const b of extractBehaviors(msg)) {
            for (const kw of b.keywords) {
              expect(lower).toContain(kw);
            }
          }
        }
      ),
      { numRuns: 150 }
    );
  });

  it('Property: confidence rises (never falls) as more keywords of a type appear', () => {
    const single = extractBehaviors('cat playing').find((b) => b.type === 'playful');
    const many = extractBehaviors('cat playing pouncing chasing jumping').find((b) => b.type === 'playful');
    expect(single).toBeDefined();
    expect(many).toBeDefined();
    expect(many!.confidence).toBeGreaterThanOrEqual(single!.confidence);
  });

  it('is case-insensitive', () => {
    expect(extractBehaviors('MY CAT IS HISSING').some((b) => b.type === 'aggressive')).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// generateBehaviorSummary
// ───────────────────────────────────────────────────────────────────────────
describe('generateBehaviorSummary', () => {
  it('returns the no-behavior sentinel for an empty list', () => {
    expect(generateBehaviorSummary([])).toBe('No specific behaviors detected');
  });

  it('labels the most frequent behavior type', () => {
    const behaviors: ExtractedBehavior[] = [
      { type: 'aggressive', intensity: 'mild', description: '', confidence: 0.3, keywords: ['hiss'] },
      { type: 'aggressive', intensity: 'mild', description: '', confidence: 0.3, keywords: ['swat'] },
      { type: 'playful', intensity: 'mild', description: '', confidence: 0.3, keywords: ['play'] },
    ];
    expect(generateBehaviorSummary(behaviors)).toBe('Aggressive');
  });

  it('falls back to the raw type when no friendly label exists', () => {
    const behaviors: ExtractedBehavior[] = [
      { type: 'mystery', intensity: 'mild', description: '', confidence: 0.3, keywords: [] },
    ];
    expect(generateBehaviorSummary(behaviors)).toBe('mystery');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// generateBehaviorPatterns — timeframe window + aggregation
// ───────────────────────────────────────────────────────────────────────────
describe('generateBehaviorPatterns', () => {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  it('returns [] for no logs', () => {
    expect(generateBehaviorPatterns([])).toEqual([]);
  });

  it('excludes logs older than the timeframe window', () => {
    const logs = [
      { type: 'playful', intensity: 'mild', createdAt: hoursAgo(1) },
      { type: 'playful', intensity: 'mild', createdAt: hoursAgo(1000) }, // stale
    ];
    const patterns = generateBehaviorPatterns(logs, 168); // 1 week
    expect(patterns).toHaveLength(1);
    expect(patterns[0].frequency).toBe(1);
  });

  it('returns [] when every log is outside the window', () => {
    const logs = [{ type: 'playful', intensity: 'mild', createdAt: hoursAgo(10_000) }];
    expect(generateBehaviorPatterns(logs, 24)).toEqual([]);
  });

  it('aggregates frequency per type and sorts descending', () => {
    const logs = [
      { type: 'anxious', intensity: 'mild', createdAt: hoursAgo(1) },
      { type: 'playful', intensity: 'mild', createdAt: hoursAgo(2) },
      { type: 'playful', intensity: 'mild', createdAt: hoursAgo(3) },
      { type: 'playful', intensity: 'mild', createdAt: hoursAgo(4) },
    ];
    const patterns = generateBehaviorPatterns(logs, 168);
    expect(patterns[0].type).toBe('playful');
    expect(patterns[0].frequency).toBe(3);
    // sorted descending by frequency
    for (let i = 1; i < patterns.length; i++) {
      expect(patterns[i - 1].frequency).toBeGreaterThanOrEqual(patterns[i].frequency);
    }
  });

  it('collects distinct contexts without duplication', () => {
    const logs = [
      { type: 'vocalization', intensity: 'mild', context: 'night, feeding', createdAt: hoursAgo(1) },
      { type: 'vocalization', intensity: 'mild', context: 'night', createdAt: hoursAgo(2) },
    ];
    const [pattern] = generateBehaviorPatterns(logs, 168);
    expect(pattern.commonContexts.sort()).toEqual(['feeding', 'night']);
  });

  it('Property: total pattern frequency equals count of in-window logs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            type: fc.constantFrom('playful', 'anxious', 'aggressive'),
            ageHours: fc.integer({ min: 0, max: 400 }),
          }),
          { maxLength: 40 }
        ),
        (raw) => {
          const window = 168;
          const logs = raw.map((r) => ({
            type: r.type,
            intensity: 'mild',
            createdAt: hoursAgo(r.ageHours),
          }));
          const inWindow = raw.filter((r) => r.ageHours * 60 * 60 * 1000 < window * 60 * 60 * 1000).length;
          const patterns = generateBehaviorPatterns(logs, window);
          const totalFreq = patterns.reduce((s, p) => s + p.frequency, 0);
          expect(totalFreq).toBe(inWindow);
        }
      ),
      { numRuns: 150 }
    );
  });
});
