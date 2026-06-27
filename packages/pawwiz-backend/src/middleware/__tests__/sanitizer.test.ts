import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { stripHtmlTags } from '../sanitizer.js';

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
});
