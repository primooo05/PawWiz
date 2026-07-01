import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { onboardingService } from '../onboarding.service.js';
import { onboardingRepository } from '../../repositories/onboarding.repository.js';
import { mailerService } from '../mailer.service.js';
import { otpService } from '../otp.service.js';
import { AppError } from '../../utils/errors.js';
import type { OnboardingSession } from '@prisma/client';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../repositories/onboarding.repository.js', () => ({
  onboardingRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    isEmailConsumed: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock('../mailer.service.js', () => ({
  mailerService: {
    sendOtpEmail: vi.fn(),
  },
}));

vi.mock('../otp.service.js', () => ({
  otpService: {
    generateOtp: vi.fn(),
    hashOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/** Minimal valid session that has completed step 2 (email + name present). */
function makeSession(overrides: Partial<OnboardingSession> = {}): OnboardingSession {
  return {
    id: 'test-session-id',  
    step: 3,
    ownerName: 'Ayla',
    ownerEmail: 'ayla@example.com',
    catsCount: null,
    customCatsCount: null,
    catName: null,
    catBreed: null,
    catMarking: null,
    catSex: null,
    catLifeStage: null,
    otpHash: null,
    otpExpiresAt: null,
    otpVerified: false,
    otpLastSentAt: null,
    consumedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as OnboardingSession;
}

// ---------------------------------------------------------------------------
// sendOtp
// ---------------------------------------------------------------------------

describe('onboardingService.sendOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(otpService.generateOtp).mockReturnValue('123456');
    vi.mocked(otpService.hashOtp).mockReturnValue('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd');
    vi.mocked(mailerService.sendOtpEmail).mockResolvedValue(undefined);
  });

  it('throws 404 when session does not exist', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(null);

    await expect(onboardingService.sendOtp('nonexistent-id')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 400 when ownerEmail is missing (step 2 not completed)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ ownerEmail: null })
    );

    await expect(onboardingService.sendOtp('test-session-id')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 when ownerEmail is already associated with a completed registration', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ ownerEmail: 'ayla@example.com' })
    );
    vi.mocked(onboardingRepository.isEmailConsumed).mockResolvedValueOnce(true);

    await expect(onboardingService.sendOtp('test-session-id')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Email already exists, meow',
    });
  });

  it('throws 400 when called within 60s of the last send (rate limit)', async () => {
    const recentSend = new Date(Date.now() - 30_000); // 30s ago — inside window
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ otpLastSentAt: recentSend })
    );

    await expect(onboardingService.sendOtp('test-session-id')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('allows resend exactly after 60s cooldown has elapsed', async () => {
    const oldSend = new Date(Date.now() - 61_000); // 61s ago — outside window
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ otpLastSentAt: oldSend })
    );
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession());

    await expect(onboardingService.sendOtp('test-session-id')).resolves.toMatchObject({
      cooldownSeconds: 60,
    });
  });

  it('sends on first request (otpLastSentAt is null)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(makeSession());
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession());

    const result = await onboardingService.sendOtp('test-session-id');

    expect(mailerService.sendOtpEmail).toHaveBeenCalledOnce();
    expect(mailerService.sendOtpEmail).toHaveBeenCalledWith(
      'ayla@example.com',
      'Ayla',
      '123456'
    );
    expect(result).toMatchObject({ cooldownSeconds: 60 });
  });

  it('persists hashed OTP, expiresAt, and lastSentAt — never the raw code', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(makeSession());
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession());

    await onboardingService.sendOtp('test-session-id');

    const updateCall = vi.mocked(onboardingRepository.update).mock.calls[0][1] as Record<string, unknown>;
    expect(updateCall).toHaveProperty('otpHash', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd');
    expect(updateCall).toHaveProperty('otpExpiresAt');
    expect(updateCall).toHaveProperty('otpLastSentAt');
    // Raw code must not appear in the persisted payload
    expect(JSON.stringify(updateCall)).not.toContain('123456');
  });

  it('Property: cooldown boundary — blocks for any lastSentAt within 0–59999ms ago', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 59_999 }),
        async (msAgo) => {
          vi.mocked(onboardingRepository.findById).mockResolvedValue(
            makeSession({ otpLastSentAt: new Date(Date.now() - msAgo) })
          );
          await onboardingService.sendOtp('test-session-id').then(
            () => { throw new Error('should have thrown'); },
            (err: AppError) => {
              expect(err.statusCode).toBe(400);
            }
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it('does not call mailerService if repository.update throws', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(makeSession());
    vi.mocked(onboardingRepository.update).mockRejectedValue(new Error('DB error'));

    await expect(onboardingService.sendOtp('test-session-id')).rejects.toThrow('DB error');
    expect(mailerService.sendOtpEmail).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// verifyOtp
// ---------------------------------------------------------------------------

describe('onboardingService.verifyOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validSessionWithOtp = () =>
    makeSession({
      otpHash: 'hashed_999999',
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpVerified: false,
    });

  it('throws 404 when session does not exist', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(null);

    await expect(onboardingService.verifyOtp('nonexistent-id', '123456')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 400 when no OTP has been issued (otpHash is null)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ otpHash: null, otpExpiresAt: null })
    );

    await expect(onboardingService.verifyOtp('test-session-id', '123456')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 when OTP is already verified (replay prevention)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ otpHash: 'hashed_999999', otpVerified: true })
    );

    await expect(onboardingService.verifyOtp('test-session-id', '999999')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 when otpService.verifyOtp returns false (wrong code or expired)', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(validSessionWithOtp());
    vi.mocked(otpService.verifyOtp).mockReturnValue(false);

    await expect(onboardingService.verifyOtp('test-session-id', '000000')).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(onboardingRepository.update).not.toHaveBeenCalled();
  });

  it('persists otpVerified=true and advances step on success', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(validSessionWithOtp());
    vi.mocked(otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession({ step: 4, otpVerified: true }));

    await onboardingService.verifyOtp('test-session-id', '999999');

    const updateCall = vi.mocked(onboardingRepository.update).mock.calls[0][1] as Record<string, unknown>;
    expect(updateCall).toMatchObject({ otpVerified: true });
    expect(updateCall.step).toBeGreaterThanOrEqual(4);
  });

  it('does not update step below the current session step (idempotent advance)', async () => {
    // Session already at step 5 (resumed)
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ step: 5, otpHash: 'hashed_999999', otpVerified: false, otpExpiresAt: new Date(Date.now() + 60_000) })
    );
    vi.mocked(otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession({ step: 5, otpVerified: true }));

    await onboardingService.verifyOtp('test-session-id', '999999');

    const updateCall = vi.mocked(onboardingRepository.update).mock.calls[0][1] as Record<string, unknown>;
    // step should be Math.max(5, 4) = 5, not regressed to 4
    expect(updateCall.step).toBeGreaterThanOrEqual(5);
  });

  it('Property: any non-6-digit code string fails otpService.verifyOtp path', async () => {
    const session = validSessionWithOtp();
    vi.mocked(onboardingRepository.findById).mockResolvedValue(session);
    vi.mocked(otpService.verifyOtp).mockReturnValue(false);

    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => !/^\d{6}$/.test(s)),
        async (badCode) => {
          await expect(
            onboardingService.verifyOtp('test-session-id', badCode)
          ).rejects.toMatchObject({ statusCode: 400 });
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// assertPriorStepsValid — email must be verified before step 4+
// ---------------------------------------------------------------------------

describe('onboardingService.updateStep — OTP gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws 400 when targeting step >= 4 but otpVerified is false', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({
        step: 3,
        ownerName: 'Ayla',
        ownerEmail: 'ayla@example.com',
        otpVerified: false,
      })
    );

    await expect(
      onboardingService.updateStep('test-session-id', 4, { catsCount: 'One' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows step 4 update when otpVerified is true', async () => {
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({
        step: 4,
        ownerName: 'Ayla',
        ownerEmail: 'ayla@example.com',
        otpVerified: true,
        catsCount: null,
        customCatsCount: null,
      })
    );
    vi.mocked(onboardingRepository.update).mockResolvedValue(makeSession({ step: 5, otpVerified: true }));

    await expect(
      onboardingService.updateStep('test-session-id', 4, { catsCount: 'One' })
    ).resolves.toBeDefined();
  });
});
