/**
 * Service Layer — Profile
 * Coordinator Pattern: orchestrates workflow by calling repositories and utils.
 * Contains business logic, validation guards, and coordination.
 * No direct Prisma calls — delegates to repository.
 */

import { profileRepository, type CreateProfileData } from '../repositories/profile.repository.js';
import { assertDefined, assertNonEmpty, assertNoDuplicate } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import type { Profile } from '@prisma/client';

class ProfileService {
  /**
   * Create a new profile for a Supabase user.
   * Guards: supabaseUserId required, displayName non-empty, no duplicate profile.
   */
  async createProfile(supabaseUserId: string, displayName: string): Promise<Profile> {
    assertNonEmpty(supabaseUserId, 'supabaseUserId');
    assertNonEmpty(displayName, 'displayName');
    if (displayName.trim().length < 2) {
      throw AppError.badRequest('displayName must be at least 2 characters');
    }

    const existing = await profileRepository.findBySupabaseUserId(supabaseUserId);
    assertNoDuplicate(existing, 'Profile already exists for this user');

    const data: CreateProfileData = { supabaseUserId, displayName: displayName.trim() };
    return profileRepository.create(data);
  }

  /**
   * Retrieve a profile by Supabase user ID.
   * Guards: throws 404 if not found.
   */
  async getProfileByUserId(supabaseUserId: string): Promise<Profile> {
    assertNonEmpty(supabaseUserId, 'supabaseUserId');

    const profile = await profileRepository.findBySupabaseUserId(supabaseUserId);
    assertDefined(profile, 'Profile not found');
    return profile;
  }

  /**
   * Update display name for a user profile.
   * Guards: profile must exist, displayName non-empty.
   */
  async updateDisplayName(supabaseUserId: string, displayName: string): Promise<Profile> {
    assertNonEmpty(supabaseUserId, 'supabaseUserId');
    assertNonEmpty(displayName, 'displayName');

    // Ensure profile exists (throws 404 if not)
    await this.getProfileByUserId(supabaseUserId);

    return profileRepository.updateBySupabaseUserId(supabaseUserId, {
      displayName: displayName.trim(),
    });
  }

  /**
   * Delete a user profile.
   * Guards: profile must exist.
   */
  async deleteProfile(supabaseUserId: string): Promise<Profile> {
    assertNonEmpty(supabaseUserId, 'supabaseUserId');

    const profile = await profileRepository.findBySupabaseUserId(supabaseUserId);
    assertDefined(profile, 'Profile not found');

    return profileRepository.delete(profile.id);
  }
}

/** Singleton instance */
export const profileService = new ProfileService();
