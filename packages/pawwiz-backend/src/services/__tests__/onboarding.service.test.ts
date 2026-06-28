import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onboardingService } from '../onboarding.service.js';
import { onboardingRepository } from '../../repositories/onboarding.repository.js';
import { AppError } from '../../utils/errors.js';

vi.mock('../../repositories/onboarding.repository.js', () => ({
  onboardingRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}));

describe('Onboarding Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully start a new session', async () => {
    const mockSession = {
      id: 'mock-session-id',
      step: 1,
      ownerName: null,
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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

  it('should validate and update step 2 (ownerName)', async () => {
    const mockSession = {
      id: 'session-id',
      step: 1,
      ownerName: null,
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);
    vi.mocked(onboardingRepository.update).mockResolvedValueOnce({
      ...mockSession,
      ownerName: 'Ayla',
      step: 3
    });

    const updated = await onboardingService.updateStep('session-id', 2, { ownerName: 'Ayla' });
    expect(updated.ownerName).toBe('Ayla');
    expect(updated.step).toBe(3);
    expect(onboardingRepository.update).toHaveBeenCalledWith('session-id', {
      ownerName: 'Ayla',
      step: 3
    });
  });

  it('should reject step 2 update with empty ownerName', async () => {
    const mockSession = {
      id: 'session-id',
      step: 1,
      ownerName: null,
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);

    await expect(onboardingService.updateStep('session-id', 2, { ownerName: '' })).rejects.toThrow();
  });

  it('should reject step 2 update with ownerName shorter than 2 characters', async () => {
    const mockSession = {
      id: 'session-id',
      step: 1,
      ownerName: null,
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);

    await expect(onboardingService.updateStep('session-id', 2, { ownerName: 'A' })).rejects.toThrow();
  });

  it('should prevent jumping to step 3 if step 2 ownerName is missing', async () => {
    const mockSession = {
      id: 'session-id',
      step: 1,
      ownerName: null,
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);

    await expect(
      onboardingService.updateStep('session-id', 3, { catsCount: 'One' })
    ).rejects.toThrow('Step 2 data (ownerName) is missing');
  });

  it('should prevent jumping to step 4 if step 3 catsCount/customCatsCount is missing', async () => {
    const mockSession = {
      id: 'session-id',
      step: 2,
      ownerName: 'Ayla',
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(mockSession);

    await expect(
      onboardingService.updateStep('session-id', 4, { catName: 'Galaxy', catSex: 'Male' })
    ).rejects.toThrow('Step 3 data (catsCount) is missing');
  });
});
