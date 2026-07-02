import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { extractTitle } from '../keyword-extractor.js';
import { STOPWORDS } from '../stopwords.js';

describe('keyword-extractor · extractTitle', () => {
  // Property 1 — output length ≤ maxChars for arbitrary input
  it('Property 1: output length never exceeds maxChars', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 4, max: 80 }), (text, cap) => {
        const title = extractTitle(text, { maxChars: cap });
        expect(title.length).toBeLessThanOrEqual(cap);
      }),
      { numRuns: 200 }
    );
  });

  // Property 2 — output is never empty for non-empty input
  it('Property 2: non-empty input yields non-empty title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (text) => {
          const title = extractTitle(text);
          expect(title.length).toBeGreaterThan(0);
          expect(title.trim()).not.toBe('');
        }
      ),
      { numRuns: 200 }
    );
  });

  // Property 3 — determinism
  it('Property 3: repeated calls with identical input return identical output', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(extractTitle(text)).toBe(extractTitle(text));
      }),
      { numRuns: 200 }
    );
  });

  // Property 4 — no stop-word appears in the title when non-stop content exists
  it('Property 4: title omits stop-words when non-stop tokens exist', () => {
    // Build a phrase composed of at least one guaranteed content word plus
    // some stop-words so RAKE has a clean choice to make.
    const contentWord = fc.constantFrom(
      'sofa',
      'window',
      'blanket',
      'toy',
      'garden',
      'purring',
      'scratching'
    );
    const filler = fc.constantFrom(...Array.from(STOPWORDS).slice(0, 20));

    fc.assert(
      fc.property(contentWord, fc.array(filler, { minLength: 1, maxLength: 6 }), (content, fillers) => {
        const sentence = [...fillers, content, ...fillers].join(' ');
        const title = extractTitle(sentence).toLowerCase();
        // The title must contain the content word.
        expect(title).toContain(content);
        // The title must not contain any of the filler stop-words as
        // whole-word tokens.
        const titleTokens = title.split(/\s+/).filter((t) => t.length > 0);
        for (const f of fillers) {
          expect(titleTokens).not.toContain(f);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property 5 — trivial whitespace variations are idempotent
  it('Property 5: leading/trailing whitespace does not change the title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        (text, leadingSpaces, trailingSpaces) => {
          const padded = ' '.repeat(leadingSpaces) + text + ' '.repeat(trailingSpaces);
          expect(extractTitle(padded)).toBe(extractTitle(text));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Concrete unit checks — pin the human-readable behaviour.
  it('example: pulls the salient noun phrase out of a first user message', () => {
    const title = extractTitle('My cat keeps scratching the sofa every morning');
    // Should surface "sofa" or "scratching" — not "cat", "the", "every".
    expect(title).toMatch(/Sofa|Scratching/);
    expect(title.toLowerCase()).not.toContain('the');
  });

  it('example: handles emoji and punctuation without crashing', () => {
    const title = extractTitle('🐈 She is purring loudly!!!  Very loud  ');
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toMatch(/[🐈]/);
    expect(title.toLowerCase()).not.toContain('very');
  });

  it('example: empty input falls back to "New Chat"', () => {
    expect(extractTitle('')).toBe('New Chat');
    expect(extractTitle('   ')).toBe('New Chat');
  });

  it('example: stop-words-only input still returns a stable non-empty title', () => {
    const title = extractTitle('is it the a');
    expect(title.length).toBeGreaterThan(0);
    expect(title.trim()).not.toBe('');
  });

  it('example: maxWords clamps the winning phrase length', () => {
    const title = extractTitle('shredding curtain drapes bedroom furniture repeatedly', {
      maxWords: 2,
    });
    const tokenCount = title.split(/\s+/).filter((t) => t.length > 0).length;
    expect(tokenCount).toBeLessThanOrEqual(2);
  });
});
