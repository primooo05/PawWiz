// Feature: onboarding-email-field, Property 1: Step 2 schema email validation correctness
// Feature: onboarding-security-and-redirect, Property 3: Text field schemas reject values outside their length bounds
// Feature: onboarding-security-and-redirect, Property 4: Enum schemas reject all values not in the declared set
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  onboardingStep2Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
} from '../onboarding.schemas.js';

/**
 * Custom email arbitrary that generates emails Zod's validator will accept.
 * fc.emailAddress() generates RFC 5322-compliant emails, but Zod 4 uses a stricter
 * validator that rejects some valid RFC emails (special chars, consecutive dots, etc.).
 * This generator builds structurally valid emails: lowercase alphanumeric local part,
 * lowercase alphanumeric domain, and a 2-4 char TLD — guaranteed to pass Zod's check.
 */
const zodCompatibleEmail = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{1,8}$/),
    fc.stringMatching(/^[a-z]{2,4}$/)
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/**
 * **Validates: Requirements 2.1, 3.1, 3.2, 3.3**
 *
 * Property 1: Step 2 schema email validation correctness
 *
 * For any string value provided as `ownerEmail` (paired with a valid `ownerName`
 * of 2+ characters), the onboardingStep2Schema SHALL accept the input if and only
 * if the string is a valid email format.
 */
describe('onboardingStep2Schema - Property 1: Step 2 schema email validation correctness', () => {
  it('accepts valid name (2+ chars) paired with valid email', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2 }),
        zodCompatibleEmail,
        (ownerName, ownerEmail) => {
          const result = onboardingStep2Schema.safeParse({ ownerName, ownerEmail });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects invalid email strings paired with valid name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2 }),
        fc.string().filter((s) => !s.includes('@') || s.length < 3),
        (ownerName, ownerEmail) => {
          const result = onboardingStep2Schema.safeParse({ ownerName, ownerEmail });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: onboarding-security-and-redirect
// Property 3: Text field schemas reject values outside their length bounds
// Validates: Requirements 3.1, 3.3, 3.4, 3.5
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 3.1, 3.3, 3.4, 3.5**
 *
 * Property 3: Text field schemas reject values outside their length bounds
 *
 * For any string value generated up to 200 chars, the schema SHALL accept the
 * field when its length is within the declared maximum and reject it when the
 * length exceeds it.
 */
describe('Property 3: Text field length boundaries', () => {
  // ── ownerName (max 100) ────────────────────────────────────────────────

  it('ownerName: accepts strings of length 2–100', () => {
    const validEmail = 'test@example.com';
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 100 }),
        (ownerName) => {
          const result = onboardingStep2Schema.safeParse({ ownerName, ownerEmail: validEmail });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('ownerName: rejects strings longer than 100 characters', () => {
    const validEmail = 'test@example.com';
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 200 }),
        (ownerName) => {
          const result = onboardingStep2Schema.safeParse({ ownerName, ownerEmail: validEmail });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── catName (max 60) ──────────────────────────────────────────────────

  it('catName: accepts strings of length 1–60', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 60 }),
        (catName) => {
          const result = onboardingStep4Schema.safeParse({
            catName,
            catSex: 'Female',
          });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catName: rejects strings longer than 60 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 61, maxLength: 200 }),
        (catName) => {
          const result = onboardingStep4Schema.safeParse({
            catName,
            catSex: 'Female',
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── catBreed (max 80, optional) ────────────────────────────────────────

  it('catBreed: accepts strings of length 0–80 when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 80 }),
        (catBreed) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Whiskers',
            catSex: 'Female',
            catBreed,
          });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catBreed: rejects strings longer than 80 characters when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 81, maxLength: 200 }),
        (catBreed) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Whiskers',
            catSex: 'Female',
            catBreed,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catBreed: schema succeeds when catBreed is omitted entirely', () => {
    const result = onboardingStep4Schema.safeParse({
      catName: 'Whiskers',
      catSex: 'Female',
    });
    expect(result.success).toBe(true);
  });

  // ── catMarking (max 80, optional) ─────────────────────────────────────

  it('catMarking: accepts strings of length 0–80 when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 80 }),
        (catMarking) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Whiskers',
            catSex: 'Male',
            catMarking,
          });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catMarking: rejects strings longer than 80 characters when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 81, maxLength: 200 }),
        (catMarking) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Whiskers',
            catSex: 'Male',
            catMarking,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catMarking: schema succeeds when catMarking is omitted entirely', () => {
    const result = onboardingStep4Schema.safeParse({
      catName: 'Whiskers',
      catSex: 'Male',
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Feature: onboarding-security-and-redirect
// Property 4: Enum schemas reject all values not in the declared set
// Validates: Requirements 3.6, 3.7
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 3.6, 3.7**
 *
 * Property 4: Enum schemas reject all values not in the declared set
 *
 * For any arbitrary string, the schema SHALL accept the field ONLY when the
 * value is an exact member of the declared enum. All other strings SHALL be
 * rejected.
 */
describe('Property 4: Enum schema rejection', () => {
  const validCatSexValues = ['Female', 'Male'] as const;
  const validCatLifeStageValues = ['Kitten', 'Adult', 'Senior'] as const;

  // ── catSex (enum: 'Female' | 'Male') ──────────────────────────────────

  it('catSex: accepts only exact enum members "Female" and "Male"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validCatSexValues),
        (catSex) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Mittens',
            catSex,
          });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catSex: rejects arbitrary strings not in ["Female", "Male"]', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !validCatSexValues.includes(s as typeof validCatSexValues[number])),
        (catSex) => {
          const result = onboardingStep4Schema.safeParse({
            catName: 'Mittens',
            catSex,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── catLifeStage (enum: 'Kitten' | 'Adult' | 'Senior') ─────────────────

  it('catLifeStage: accepts only exact enum members "Kitten", "Adult", "Senior"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validCatLifeStageValues),
        (catLifeStage) => {
          const result = onboardingStep5Schema.safeParse({ catLifeStage });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('catLifeStage: rejects arbitrary strings not in ["Kitten", "Adult", "Senior"]', () => {
    fc.assert(
      fc.property(
        fc.string().filter(
          (s) => !validCatLifeStageValues.includes(s as typeof validCatLifeStageValues[number])
        ),
        (catLifeStage) => {
          const result = onboardingStep5Schema.safeParse({ catLifeStage });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
