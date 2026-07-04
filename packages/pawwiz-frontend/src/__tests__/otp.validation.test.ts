import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateStep3Otp } from '../hooks/onboarding/useOnboardingValidation.js';

// ---------------------------------------------------------------------------
// validateStep3Otp — format-only validation (crypto happens on the backend)
// ---------------------------------------------------------------------------

describe('validateStep3Otp', () => {
  // --- Valid inputs ---

  it('accepts any exactly-6-digit numeric string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const result = validateStep3Otp(code);
          expect(result.isValid).toBe(true);
          expect(result.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('accepts leading-zero codes like "012345" (valid 6-digit numeric string)', () => {
    const result = validateStep3Otp('012345');
    expect(result.isValid).toBe(true);
  });

  it('returns a non-empty success message on valid input', () => {
    const result = validateStep3Otp('999999');
    expect(result.isValid).toBe(true);
    expect(result.message.trim().length).toBeGreaterThan(0);
  });

  // --- Empty / whitespace ---

  it('rejects empty string', () => {
    const result = validateStep3Otp('');
    expect(result.isValid).toBe(false);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('Property: rejects all-whitespace strings', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constant(' '), { minLength: 1, maxLength: 20 }),
        (spaces) => {
          expect(validateStep3Otp(spaces).isValid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  // --- Wrong length ---

  it('rejects codes shorter than 6 digits', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99999 }).map(String),
        (short) => {
          if (short.length < 6) {
            expect(validateStep3Otp(short).isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects codes longer than 6 digits', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 9999999 }).map(String),
        (long) => {
          expect(validateStep3Otp(long).isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary: 5-digit code "99999" is invalid', () => {
    expect(validateStep3Otp('99999').isValid).toBe(false);
  });

  it('boundary: 7-digit code "1000000" is invalid', () => {
    expect(validateStep3Otp('1000000').isValid).toBe(false);
  });

  // --- Non-numeric characters ---

  it('rejects codes containing letters', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.char().filter((c) => /[a-zA-Z]/.test(c)), { minLength: 1, maxLength: 6 }),
        (withLetters) => {
          expect(validateStep3Otp(withLetters).isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects codes containing special characters', () => {
    const specialCodes = ['12 345', '12-345', '12.345', '12/345', '12\t345', '1e3456'];
    for (const code of specialCodes) {
      expect(validateStep3Otp(code).isValid).toBe(false);
    }
  });

  it('rejects a code with an embedded null byte', () => {
    expect(validateStep3Otp('123\x0045').isValid).toBe(false);
  });

  it('rejects a code with unicode digits (e.g. Arabic-Indic numerals)', () => {
    // "٦" is U+0666, a non-ASCII digit that could fool naive checks
    expect(validateStep3Otp('١٢٣٤٥٦').isValid).toBe(false);
  });

  // --- Injection attempts ---

  it('Property: arbitrary strings that are not exactly /^\\d{6}$/ are always rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/^\d{6}$/.test(s)),
        (invalid) => {
          expect(validateStep3Otp(invalid).isValid).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('rejects SQL injection attempts', () => {
    expect(validateStep3Otp("1' OR '1'='1").isValid).toBe(false);
  });

  it('rejects script injection attempts', () => {
    expect(validateStep3Otp('<script>').isValid).toBe(false);
  });

  // --- Error message quality ---

  it('always returns a non-empty message regardless of input', () => {
    fc.assert(
      fc.property(fc.string(), (code) => {
        const result = validateStep3Otp(code);
        expect(result.message.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 200 }
    );
  });

  it('error message contains "meow" for invalid input (consistent with other validators)', () => {
    const result = validateStep3Otp('bad');
    expect(result.message.toLowerCase()).toContain('meow');
  });
});
