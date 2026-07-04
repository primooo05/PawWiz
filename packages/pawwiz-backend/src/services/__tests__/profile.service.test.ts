import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { profileService } from '../profile.service.js';
import { profileRepository } from '../../repositories/profile.repository.js';
import { onboardingRepository } from '../../repositories/onboarding.repository.js';

vi.mock('../../repositories/profile.repository.js', () => ({
  profileRepository: {
    findBySupabaseUserId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../repositories/onboarding.repository.js', () => ({
  onboardingRepository: {
    findById: vi.fn(),
    markConsumed: vi.fn(),
  },
}));

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    cat: {
      create: vi.fn().mockResolvedValue({ id: 'cat-id' }),
    },
    dietProfile: {
      create: vi.fn().mockResolvedValue({ id: 'diet-profile-id' }),
    },
  },
}));

const makeSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-id',
  step: 6,
  ownerName: 'Alice',
  ownerEmail: 'alice@example.com',
  otpHash: null,
  otpExpiresAt: null,
  otpVerified: true,
  otpLastSentAt: null,
  otpAttempts: 0,
  catsCount: '1',
  customCatsCount: null,
  catName: 'Whiskers',
  catBreed: 'Tabby',
  catMarking: null,
  catSex: 'Female',
  catLifeStage: 'Adult',
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeProfile = (supabaseUserId: string, displayName: string) => ({
  id: 'profile-id',
  supabaseUserId,
  displayName,
  catName: 'Whiskers',
  catBreed: 'Tabby',
  catMarking: null,
  catSex: 'Female',
  catLifeStage: 'Adult',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject profile creation when supabaseUserId already exists (409 conflict)', async () => {
    const userIds = fc.uuid();
    const displayNames = fc.string({ minLength: 2 }).filter((s) => s.trim().length >= 2);

    await fc.assert(
      fc.asyncProperty(userIds, displayNames, async (supabaseUserId, displayName) => {
        const mockFind = vi.mocked(profileRepository.findBySupabaseUserId);
        const mockMarkConsumed = vi.mocked(onboardingRepository.markConsumed);

        // Profile already exists
        mockFind.mockResolvedValueOnce(makeProfile(supabaseUserId, displayName));
        mockMarkConsumed.mockResolvedValueOnce(undefined);

        await expect(
          profileService.createProfile(supabaseUserId, displayName, 'session-id'),
        ).rejects.toThrow(/Profile already exists/);

        // markConsumed must be called even on duplicate path
        expect(mockMarkConsumed).toHaveBeenCalledWith('session-id');
      }),
    );
  });

  it('should reject when onboarding session is missing or already consumed', async () => {
    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValue(null);
    vi.mocked(onboardingRepository.findById).mockResolvedValue(null);

    await expect(
      profileService.createProfile('user-id', 'Alice', 'bad-session-id'),
    ).rejects.toThrow(/Invalid or missing onboardingSessionId/);
  });

  it('should reject when session is already consumed', async () => {
    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValue(null);
    vi.mocked(onboardingRepository.findById).mockResolvedValue(
      makeSession({ consumedAt: new Date() }),
    );

    await expect(
      profileService.createProfile('user-id', 'Alice', 'session-id'),
    ).rejects.toThrow(/Invalid or missing onboardingSessionId/);
  });

  it('should reject when onboarding step is less than 6', async () => {
    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValue(null);
    vi.mocked(onboardingRepository.findById).mockResolvedValue(makeSession({ step: 5 }));

    await expect(
      profileService.createProfile('user-id', 'Alice', 'session-id'),
    ).rejects.toThrow(/Onboarding not yet complete/);
  });

  it('should create profile successfully and mark session consumed', async () => {
    const supabaseUserId = 'user-123';
    const displayName = 'Alice';

    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValue(null);
    vi.mocked(onboardingRepository.findById).mockResolvedValue(makeSession());
    vi.mocked(profileRepository.create).mockResolvedValue(makeProfile(supabaseUserId, displayName));
    vi.mocked(onboardingRepository.markConsumed).mockResolvedValue(undefined);

    const result = await profileService.createProfile(supabaseUserId, displayName, 'session-id');

    expect(result.supabaseUserId).toBe(supabaseUserId);
    expect(result.displayName).toBe(displayName);
    expect(vi.mocked(onboardingRepository.markConsumed)).toHaveBeenCalledWith('session-id');
  });

  it('should reject when any of the three required arguments are empty', async () => {
    await expect(
      profileService.createProfile('', 'Alice', 'session-id'),
    ).rejects.toThrow(/supabaseUserId/);

    await expect(
      profileService.createProfile('user-id', '', 'session-id'),
    ).rejects.toThrow(/displayName/);

    await expect(
      profileService.createProfile('user-id', 'Alice', ''),
    ).rejects.toThrow(/onboardingSessionId/);
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// Feature: onboarding-security-and-redirect, Property 5: End-to-end profile
// round-trip preserves all field values
// Validates: Requirements 5.1, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 5: End-to-end profile round-trip preserves all field values', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * For any set of plain-text cat field values and a displayName, when
   * profileService.createProfile is called the resulting profile must contain
   * exactly the trimmed versions of those values (or null for absent optional
   * fields). This validates that the service correctly copies and trims every
   * cat field from the session onto the Profile record without loss or mutation.
   */
  it('should store trimmed cat-field values from the session onto the created profile', async () => {
    // Arbitraries: plain-text strings (no HTML) of reasonable lengths
    const plainText = fc.string({ minLength: 1, maxLength: 60 }).filter(
      (s) => s.trim().length > 0 && !/</.test(s),
    );
    const plainTextOptional = fc.option(
      fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0 && !/</.test(s)),
      { nil: null },
    );
    const displayNameArb = fc.string({ minLength: 2, maxLength: 100 }).filter(
      (s) => s.trim().length >= 2 && !/</.test(s),
    );
    const catSexArb = fc.constantFrom('Female', 'Male') as fc.Arbitrary<string>;
    const catLifeStageArb = fc.constantFrom('Kitten', 'Adult', 'Senior') as fc.Arbitrary<string>;

    await fc.assert(
      fc.asyncProperty(
        displayNameArb,
        plainText,       // catName
        plainTextOptional, // catBreed (optional)
        plainTextOptional, // catMarking (optional)
        catSexArb,
        catLifeStageArb,
        async (displayName, catName, catBreed, catMarking, catSex, catLifeStage) => {
          const supabaseUserId = 'user-roundtrip-test';
          const sessionId = 'session-roundtrip-test';

          // Build a fully-complete session with the generated field values
          const session = {
            id: sessionId,
            step: 6,
            ownerName: 'RoundTripOwner',
            ownerEmail: 'rt@example.com',
            otpHash: null,
            otpExpiresAt: null,
            otpVerified: true,
            otpLastSentAt: null,
            otpAttempts: 0,
            catsCount: '1',
            customCatsCount: null,
            catName,
            catBreed,
            catMarking,
            catSex,
            catLifeStage,
            consumedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // The profile the repository would return after create()
          const expectedProfile = {
            id: 'profile-rt',
            supabaseUserId,
            displayName: displayName.trim(),
            catName: catName.trim(),
            catBreed: catBreed?.trim() ?? null,
            catMarking: catMarking?.trim() ?? null,
            catSex,
            catLifeStage,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValueOnce(null);
          vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(session);
          vi.mocked(profileRepository.create).mockResolvedValueOnce(expectedProfile);
          vi.mocked(onboardingRepository.markConsumed).mockResolvedValueOnce(undefined);

          const profile = await profileService.createProfile(
            supabaseUserId,
            displayName,
            sessionId,
          );

          // Round-trip equality: each field must match the trimmed session value
          expect(profile.catName).toBe(catName.trim());
          expect(profile.catBreed).toBe(catBreed?.trim() ?? null);
          expect(profile.catMarking).toBe(catMarking?.trim() ?? null);
          expect(profile.catSex).toBe(catSex);
          expect(profile.catLifeStage).toBe(catLifeStage);
          expect(profile.displayName).toBe(displayName.trim());

          // Verify the repository was called with the correctly trimmed data
          expect(vi.mocked(profileRepository.create)).toHaveBeenCalledWith(
            expect.objectContaining({
              catName: catName.trim(),
              catBreed: catBreed?.trim() ?? null,
              catMarking: catMarking?.trim() ?? null,
              catSex,
              catLifeStage,
              displayName: displayName.trim(),
            }),
          );

          // Session must be marked consumed after successful creation
          expect(vi.mocked(onboardingRepository.markConsumed)).toHaveBeenCalledWith(sessionId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should store null for catBreed and catMarking when they are absent from the session', async () => {
    const supabaseUserId = 'user-null-fields';
    const sessionId = 'session-null-fields';

    const session = {
      id: sessionId,
      step: 6,
      ownerName: 'Owner',
      ownerEmail: 'owner@example.com',
      otpHash: null,
      otpExpiresAt: null,
      otpVerified: true,
      otpLastSentAt: null,
      otpAttempts: 0,
      catsCount: '1',
      customCatsCount: null,
      catName: 'Luna',
      catBreed: null,   // absent
      catMarking: null, // absent
      catSex: 'Female',
      catLifeStage: 'Kitten',
      consumedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedProfile = {
      id: 'profile-null',
      supabaseUserId,
      displayName: 'Owner',
      catName: 'Luna',
      catBreed: null,
      catMarking: null,
      catSex: 'Female',
      catLifeStage: 'Kitten',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValue(null);
    vi.mocked(onboardingRepository.findById).mockResolvedValue(session);
    vi.mocked(profileRepository.create).mockResolvedValue(expectedProfile);
    vi.mocked(onboardingRepository.markConsumed).mockResolvedValue(undefined);

    const profile = await profileService.createProfile(supabaseUserId, 'Owner', sessionId);

    expect(profile.catBreed).toBeNull();
    expect(profile.catMarking).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature: onboarding-security-and-redirect, Property 6: Consumed sessions
// cannot be reused
// Validates: Requirements 5.8, 5.9
// ─────────────────────────────────────────────────────────────────────────────
describe('Property 6: Consumed sessions cannot be reused', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * For any session ID whose consumedAt is non-null, profileService.createProfile
   * must throw an AppError with HTTP 400. This covers the replay-prevention path
   * regardless of which session ID is submitted.
   */
  it('should reject createProfile when the onboarding session is already consumed (400)', async () => {
    const sessionIdArb = fc.uuid();

    await fc.assert(
      fc.asyncProperty(sessionIdArb, async (sessionId) => {
        // Consumed session: consumedAt is set to a non-null Date
        const consumedSession = {
          id: sessionId,
          step: 6,
          ownerName: 'Owner',
          ownerEmail: 'owner@example.com',
          otpHash: null,
          otpExpiresAt: null,
          otpVerified: true,
          otpLastSentAt: null,
          otpAttempts: 0,
          catsCount: '1',
          customCatsCount: null,
          catName: 'Mochi',
          catBreed: null,
          catMarking: null,
          catSex: 'Female',
          catLifeStage: 'Adult',
          consumedAt: new Date(), // already consumed
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValueOnce(null);
        vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(consumedSession);

        const error = await profileService
          .createProfile('user-replay', 'Replay User', sessionId)
          .then(() => null)
          .catch((e: unknown) => e);

        // Must throw, and must be HTTP 400 (not 409 or any other status)
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(Error);
        const appErr = error as { statusCode?: number; message?: string };
        expect(appErr.statusCode).toBe(400);
        expect(appErr.message).toMatch(/Invalid or missing onboardingSessionId/);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * On the 409 (profile already exists) path the session must also be marked
   * as consumed, preventing a different user from submitting the same session ID.
   * For any session ID, when a profile already exists for the user, the service
   * must call markConsumed and then throw HTTP 409.
   */
  it('should mark the session consumed and throw 409 when a duplicate profile is detected', async () => {
    const sessionIdArb = fc.uuid();

    await fc.assert(
      fc.asyncProperty(sessionIdArb, async (sessionId) => {
        const existingProfile = {
          id: 'existing-profile',
          supabaseUserId: 'user-dupe',
          displayName: 'Existing',
          catName: 'Mochi',
          catBreed: null,
          catMarking: null,
          catSex: 'Female',
          catLifeStage: 'Adult',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValueOnce(existingProfile);
        vi.mocked(onboardingRepository.markConsumed).mockResolvedValueOnce(undefined);

        const error = await profileService
          .createProfile('user-dupe', 'Existing', sessionId)
          .then(() => null)
          .catch((e: unknown) => e);

        // Must throw HTTP 409
        expect(error).not.toBeNull();
        const appErr = error as { statusCode?: number; message?: string };
        expect(appErr.statusCode).toBe(409);
        expect(appErr.message).toMatch(/Profile already exists/);

        // markConsumed must have been called with the generated session ID to
        // prevent this session from being replayed by another user
        expect(vi.mocked(onboardingRepository.markConsumed)).toHaveBeenCalledWith(sessionId);
      }),
      { numRuns: 100 },
    );
  });
});
