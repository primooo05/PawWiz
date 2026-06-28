import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { stripHtmlTags, sanitizeObject } from '../sanitizer.js';

// Feature: onboarding-security-and-redirect, Property 1: Sanitizer strips HTML tags from any string
describe('Sanitizer Middleware', () => {
  it('should strip HTML tags from input string while preserving text', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const htmlPayload = `<div><p>${text}</p><script>alert(1)</script></div>`;
        const sanitized = stripHtmlTags(htmlPayload);
        expect(sanitized).not.toMatch(/<\/?[^>]+(>|$)/);
      })
    );
  });

  // Property 1 (strip): arbitrary strings are free of HTML tags after sanitization
  // Validates: Requirements 1.1, 1.2, 1.4, 1.5
  it('Property 1 (strip): stripHtmlTags removes all HTML tags from any string', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = stripHtmlTags(s);
        expect(result).not.toMatch(/<\/?[^>]+(>|$)/);
      }),
      { numRuns: 100 }
    );
  });

  // Property 1 (preserve): strings without "<" are returned unchanged
  // Validates: Requirements 1.1, 1.2, 1.4, 1.5
  it('Property 1 (preserve): stripHtmlTags returns plain-text strings unchanged', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/</.test(s)),
        (s) => {
          const result = stripHtmlTags(s);
          expect(result).toBe(s);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: onboarding-security-and-redirect, Property 2: Sanitizer processes nested objects recursively without mutating non-string values
describe('sanitizeObject', () => {
  /**
   * Recursively walk original and result in parallel, asserting:
   * - String leaves in result have no HTML tags
   * - Non-string primitive leaves (number, boolean, null) are deep-equal to original
   * - Array and object containers preserve their structural shape
   */
  function assertSanitized(original: unknown, result: unknown): void {
    if (typeof original === 'string') {
      expect(typeof result).toBe('string');
      expect(result as string).not.toMatch(/<\/?[^>]+(>|$)/);
    } else if (Array.isArray(original)) {
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        assertSanitized(original[i], (result as unknown[])[i]);
      }
    } else if (original !== null && typeof original === 'object') {
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      expect(Object.keys(result as object)).toEqual(Object.keys(original as object));
      for (const key of Object.keys(original as object)) {
        assertSanitized(
          (original as Record<string, unknown>)[key],
          (result as Record<string, unknown>)[key]
        );
      }
    } else {
      // number, boolean, null — must be unchanged
      expect(result).toStrictEqual(original);
    }
  }

  // Property 2: structure shape unchanged, string leaves stripped, non-string leaves deep-equal
  // Validates: Requirements 1.3
  it('Property 2: sanitizeObject preserves structure shape and passes non-string leaves through unchanged', () => {
    fc.assert(
      fc.property(
        fc.object({
          values: [
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
          ],
        }),
        (obj) => {
          const result = sanitizeObject(obj);
          assertSanitized(obj, result);
        }
      ),
      { numRuns: 100 }
    );
  });
});
