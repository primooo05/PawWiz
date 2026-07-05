import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { onboardingService } from '../onboarding.service.js';
import { onboardingRepository } from '../../repositories/onboarding.repository.js';
import { AppError } from '../../utils/errors.js';

vi.mock('../../repositories/onboarding.repository.js', () => ({
  onboardingRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    isEmailConsumed: vi.fn().mockResolvedValue(false),
  },
}));

const makeSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-id',
  step: 1,
  ownerName: null,
  ownerEmail: null,
  otpHash: null,
  otpExpiresAt: null,
  otpVerified: false,
  otpLastSentAt: null,
  otpAttempts: 0,
  catsCount: null,
  customCatsCount: null,
  catName: null,
  catBreed: null,
  catMarking: null,
  catSex: null,
  catLifeStage: null,
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Onboarding Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully start a new session', async () => {
    const mockSession = makeSession({ id: 'mock-session-id', step: 1 });
    vi.mocked(onboardingRepository.create).mockResolvedValueOnce(mockSession);

    const session = await onboardingService.startSession();
    expect(session).toEqual(mockSession);
    expect(onboardingRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw AppError if session is not found', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(null);

    await expect(onboardingService.getSession('invalid-id')).rejects.toThrow(AppError);
    await expect(onboardingService.getSession('invalid-id')).rejects.toThrow('Onboarding session not found');
  });

  it('should validate and update step 2 (ownerName + ownerEmail)', async () => {
    const mockSession = makeSession();
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);
    vi.mocked(onboardingRepository.update).mockResolvedValueOnce(makeSession({
      ownerName: 'Ayla',
      ownerEmail: 'ayla@example.com',
      step: 3,
    }));

    const updated = await onboardingService.updateStep('session-id', 2, { ownerName: 'Ayla', ownerEmail: 'ayla@example.com' });
    expect(updated.ownerName).toBe('Ayla');
    expect(updated.ownerEmail).toBe('ayla@example.com');
    expect(updated.step).toBe(3);
    expect(onboardingRepository.update).toHaveBeenCalledWith('session-id', {
      ownerName: 'Ayla',
      ownerEmail: 'ayla@example.com',
      step: 3
    });
  });

  it('should reject step 2 update with empty ownerName', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(makeSession());

    await expect(onboardingService.updateStep('session-id', 2, { ownerName: '', ownerEmail: 'test@example.com' })).rejects.toThrow();
  });

  it('should reject step 2 update with ownerName shorter than 2 characters', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(makeSession());

    await expect(onboardingService.updateStep('session-id', 2, { ownerName: 'A', ownerEmail: 'test@example.com' })).rejects.toThrow();
  });

  it('should prevent jumping to step 3 if step 2 ownerName is missing', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(makeSession({ ownerName: null }));

    // When ownerName is missing, the prior-steps guard fires first
    await expect(
      onboardingService.updateStep('session-id', 3, { catsCount: 'One' })
    ).rejects.toThrow('Step 2 data is incomplete; cannot advance to step 3');
  });

  it('should reject step 3 via updateStep even with valid session (OTP uses dedicated endpoints)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(makeSession({
      ownerName: 'Ayla',
      ownerEmail: 'ayla@example.com',
    }));

    // Step 3 is now OTP — it uses dedicated endpoints, not updateStep
    await expect(
      onboardingService.updateStep('session-id', 3, { catsCount: 'One' })
    ).rejects.toThrow('Step 3 (OTP) uses dedicated send/verify endpoints');
  });

  it('should prevent jumping to step 4 if email is not verified (OTP gate)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(makeSession({
      step: 3,
      ownerName: 'Ayla',
      ownerEmail: 'ayla@example.com',
      otpVerified: false,
    }));

    await expect(
      onboardingService.updateStep('session-id', 4, { catsCount: 'One' })
    ).rejects.toThrow('Email must be verified before proceeding');
  });
});


// Feature: onboarding-security-and-redirect, Property 7: Step progression enforcement rejects out-of-order updates
// Validates: Requirements 9.1, 9.2, 9.4
describe('Property 7: Step progression enforcement rejects out-of-order updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper: generate arbitrary nullable/empty string values for a session field.
   * Represents "missing or empty" — null, undefined-coerced-to-null, or blank string.
   */
  const missingFieldArb = fc.oneof(
    fc.constant(null),
    fc.constant(''),
    fc.constant('   '),
  );

  /**
   * Helper: a non-empty string that would satisfy the field requirement.
   */
  const presentFieldArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

  /**
   * Step 3 is now OTP — uses dedicated endpoints, not updateStep.
   * When ownerName IS present, calling updateStep with step=3 must throw the OTP error.
   * When ownerName is missing, the prior-step guard fires first (tested separately above).
   */
  it('should reject step 3 via updateStep (OTP uses dedicated endpoints)', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,
        async (ownerName) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com' }),
          );

          await expect(
            onboardingService.updateStep('session-id', 3, { catsCount: 'one' }),
          ).rejects.toMatchObject({
            message: 'Step 3 (OTP) uses dedicated send/verify endpoints',
          });
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Step 4 requires: otpVerified === true.
   * When otpVerified is false, advancing to step 4 must throw.
   */
  it('should reject step 4 when otpVerified is false (OTP gate)', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,  // ownerName — satisfies step 2
        async (ownerName) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: false }),
          );

          await expect(
            onboardingService.updateStep('session-id', 4, {
              catsCount: 'One',
            }),
          ).rejects.toMatchObject({
            message: 'Email must be verified before proceeding',
          });
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Step 5 requires: at least one of catsCount or customCatsCount non-null/non-empty.
   * When both are missing/empty (with steps 2 and OTP satisfied),
   * advancing to step 5 must throw the formatted error.
   */
  it('should reject step 5 when catsCount and customCatsCount (step 4 requirements) are both missing or empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,  // ownerName — satisfies step 2
        missingFieldArb,  // catsCount — missing
        missingFieldArb,  // customCatsCount — missing
        async (ownerName, catsCount, customCatsCount) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: true, catsCount, customCatsCount }),
          );

          await expect(
            onboardingService.updateStep('session-id', 5, {
              catName: 'Luna',
              catSex: 'Female',
            }),
          ).rejects.toMatchObject({
            message: expect.stringMatching(/Step \d data is incomplete; cannot advance to step \d/),
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Step 6 requires: catName and catSex non-null/non-empty.
   * When catName is missing/empty (with steps 2–4 satisfied + OTP verified),
   * advancing to step 6 must throw.
   */
  it('should reject step 6 when catName (step 5 requirement) is missing or empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,  // ownerName — satisfies step 2
        presentFieldArb,  // catsCount — satisfies step 4
        missingFieldArb,  // catName — missing (step 5 incomplete)
        async (ownerName, catsCount, catName) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: true, catsCount, catName, catSex: 'Female' }),
          );

          await expect(
            onboardingService.updateStep('session-id', 6, { catLifeStage: 'Adult' }),
          ).rejects.toMatchObject({
            message: expect.stringMatching(/Step \d data is incomplete; cannot advance to step \d/),
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should reject step 6 when catSex (step 5 requirement) is missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,  // ownerName — satisfies step 2
        presentFieldArb,  // catsCount — satisfies step 4
        presentFieldArb,  // catName — present
        async (ownerName, catsCount, catName) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: true, catsCount, catName, catSex: null }),
          );

          await expect(
            onboardingService.updateStep('session-id', 6, { catLifeStage: 'Adult' }),
          ).rejects.toMatchObject({
            message: expect.stringMatching(/Step \d data is incomplete; cannot advance to step \d/),
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Step 6 update succeeds when all prior requirements are met (boundary validation).
   */
  it('should confirm step 6 update succeeds when all prior requirements are met (boundary validation)', async () => {
    await fc.assert(
      fc.asyncProperty(
        presentFieldArb,  // ownerName — satisfies step 2
        presentFieldArb,  // catsCount — satisfies step 4
        presentFieldArb.filter((s) => s.trim().length <= 60),  // catName — satisfies step 5
        fc.constantFrom('Female', 'Male') as fc.Arbitrary<string>,   // catSex — satisfies step 5
        async (ownerName, catsCount, catName, catSex) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: true, catsCount, catName, catSex }),
          );
          vi.mocked(onboardingRepository.update).mockResolvedValueOnce(
            makeSession({ ownerName, ownerEmail: 'test@example.com', otpVerified: true, catsCount, catName, catSex, catLifeStage: 'Adult', step: 7 }),
          );

          // Should NOT throw — all prior step requirements are satisfied
          const result = await onboardingService.updateStep('session-id', 6, {
            catLifeStage: 'Adult',
          });
          expect(result.step).toBe(7);
        },
      ),
      { numRuns: 100 },
    );
  });
});
