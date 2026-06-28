import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { profileService } from '../profile.service.js';
import { profileRepository } from '../../repositories/profile.repository.js';

vi.mock('../../repositories/profile.repository.js', () => ({
  profileRepository: {
    findBySupabaseUserId: vi.fn(),
    create: vi.fn()
  }
}));

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject profile creation when supabaseUserId already exists', async () => {
    const userIds = fc.uuid();
    const displayNames = fc.string({ minLength: 2 }).filter(s => s.trim().length >= 2);
    
    await fc.assert(
      fc.asyncProperty(userIds, displayNames, async (supabaseUserId, displayName) => {
        const mockFind = vi.mocked(profileRepository.findBySupabaseUserId);
        const mockCreate = vi.mocked(profileRepository.create);
        
        // Mock successful creation for the first call
        mockFind.mockResolvedValueOnce(null);
        mockCreate.mockResolvedValueOnce({
          id: 'mock-id',
          supabaseUserId,
          displayName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Mock existing profile for the second call
        mockFind.mockResolvedValueOnce({
          id: 'mock-id',
          supabaseUserId,
          displayName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // First attempt succeeds
        await expect(profileService.createProfile(supabaseUserId, displayName)).resolves.toBeDefined();
        
        // Second attempt with SAME supabaseUserId throws duplicate error
        await expect(profileService.createProfile(supabaseUserId, displayName)).rejects.toThrow(/Profile already exists/);
      })
    );
  });

  it('should reject profile creation when displayName is less than 2 characters', async () => {
    await expect(profileService.createProfile('some-user-id', 'A')).rejects.toThrow(/displayName must be at least 2 characters/);
  });
});
