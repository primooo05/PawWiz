import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dietService } from '../diet.service.js';
import { dietRepository } from '../../repositories/diet.repository.js';
import { profileRepository } from '../../repositories/profile.repository.js';

vi.mock('../../repositories/diet.repository.js', () => ({
  dietRepository: {
    findManyByProfileId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../repositories/profile.repository.js', () => ({
  profileRepository: {
    findBySupabaseUserId: vi.fn(),
  },
}));

describe('Diet Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty list if no diet profiles exist', async () => {
    const mockProfile = {
      id: 'profile-id-123',
      supabaseUserId: 'user-id-456',
      displayName: 'Isabel',
      catName: 'Aki',
      catBreed: 'Domestic Short Hair',
      catMarking: 'Mackerel Tabby',
      catSex: 'Male',
      catLifeStage: 'Kitten',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValueOnce(mockProfile);
    vi.mocked(dietRepository.findManyByProfileId).mockResolvedValueOnce([]);

    const result = await dietService.getProfiles('user-id-456');

    expect(profileRepository.findBySupabaseUserId).toHaveBeenCalledWith('user-id-456');
    expect(dietRepository.findManyByProfileId).toHaveBeenCalledWith('profile-id-123');
    expect(dietRepository.create).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  it('correctly maps and returns existing diet profiles', async () => {
    const mockProfile = {
      id: 'profile-id-123',
      supabaseUserId: 'user-id-456',
      displayName: 'Isabel',
      catName: 'Aki',
      catBreed: 'Domestic Short Hair',
      catMarking: 'Mackerel Tabby',
      catSex: 'Male',
      catLifeStage: 'Kitten',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDietProfile = {
      id: 'diet-profile-id',
      profileId: 'profile-id-123',
      catId: null,
      weight: 4.5,
      isKg: true,
      foodPreference: 'mixed',
      isSpayedNeutered: true,
      isTracking: false,
      waterIntake: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        catName: 'Aki',
        catSex: 'Male',
        catLifeStage: 'Kitten',
        catBreed: null,
        catMarking: null,
      },
      cat: null,
      mealLogs: [
        {
          id: 'log-1',
          dietProfileId: 'diet-profile-id',
          mealName: 'Breakfast',
          foodType: null,
          amount: null,
          unit: null,
          kcal: 0,
          status: 'pending',
          timestamp: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log-2',
          dietProfileId: 'diet-profile-id',
          mealName: 'Lunch',
          foodType: null,
          amount: null,
          unit: null,
          kcal: 0,
          status: 'pending',
          timestamp: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log-3',
          dietProfileId: 'diet-profile-id',
          mealName: 'Dinner',
          foodType: null,
          amount: null,
          unit: null,
          kcal: 0,
          status: 'pending',
          timestamp: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    vi.mocked(profileRepository.findBySupabaseUserId).mockResolvedValueOnce(mockProfile);
    vi.mocked(dietRepository.findManyByProfileId).mockResolvedValueOnce([mockDietProfile]);

    const result = await dietService.getProfiles('user-id-456');

    expect(profileRepository.findBySupabaseUserId).toHaveBeenCalledWith('user-id-456');
    expect(dietRepository.findManyByProfileId).toHaveBeenCalledWith('profile-id-123');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'diet-profile-id',
      name: 'Aki',
      gender: 'Male',
      lifeStage: 'Kitten',
      weight: 4.5,
      isKg: true,
      foodPreference: 'mixed',
      isSpayedNeutered: true,
      isTracking: false,
      waterIntake: 0,
      breed: null,
      marking: null,
      age: undefined,
      photoUrl: null,
      updatedAt: expect.any(Date),
      successDays: [],
      loggedMeals: [
        { id: '1', mealName: 'Breakfast', kcal: 0, status: 'pending', foodType: undefined, amount: undefined, unit: undefined, timestamp: undefined, updatedAt: expect.any(Date) },
        { id: '2', mealName: 'Lunch', kcal: 0, status: 'pending', foodType: undefined, amount: undefined, unit: undefined, timestamp: undefined, updatedAt: expect.any(Date) },
        { id: '3', mealName: 'Dinner', kcal: 0, status: 'pending', foodType: undefined, amount: undefined, unit: undefined, timestamp: undefined, updatedAt: expect.any(Date) },
      ],
    });
  });
});
