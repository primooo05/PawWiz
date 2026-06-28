// Feature: onboarding-email-field, Property 1: Step 2 schema email validation correctness
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { onboardingStep2Schema } from '../onboarding.schemas.js';

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
