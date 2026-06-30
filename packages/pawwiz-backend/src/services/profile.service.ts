/**
 * Service Layer — Profile
 * Coordinator Pattern: orchestrates workflow by calling repositories and utils.
 * Contains business logic, validation guards, and coordination.
 * No direct Prisma calls — delegates to repository.
 */

import { profileRepository, type CreateProfileData } from '../repositories/profile.repository.js';
import { onboardingRepository } from '../repositories/onboarding.repository.js';
import { assertDefined, assertNonEmpty } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import type { Profile } from '@prisma/client';

class ProfileService {
  /**
   * Create a new profile for a Supabase user.
   * Resolves cat fields from the onboarding session and marks it consumed.
   * Guards: all three inputs non-empty, no duplicate profile, valid unconsumed session at step 6.
   */
  async createProfile(
    supabaseUserId: string,
    displayName: string,
    onboardingSessionId?: string,
    catDetails?: {
      catName: string;
      catBreed?: string | null;
      catMarking?: string | null;
      catSex: string;
      catLifeStage: string;
    }
  ): Promise<Profile> {
    // 1. Guard: supabaseUserId and displayName non-empty
    assertNonEmpty(supabaseUserId, 'supabaseUserId');
    assertNonEmpty(displayName, 'displayName');

    // 2. Guard: no duplicate profile
    const existing = await profileRepository.findBySupabaseUserId(supabaseUserId);
    if (existing) {
      if (onboardingSessionId) {
        await onboardingRepository.markConsumed(onboardingSessionId);
      }
      throw AppError.conflict('Profile already exists');
    }

    let data: CreateProfileData;

    if (onboardingSessionId !== undefined) {
      assertNonEmpty(onboardingSessionId, 'onboardingSessionId');
      // 3. Resolve session
      const session = await onboardingRepository.findById(onboardingSessionId);
      if (!session) throw AppError.badRequest('Invalid or missing onboardingSessionId');
      if (session.consumedAt) throw AppError.badRequest('Invalid or missing onboardingSessionId');
      if (session.step < 6) throw AppError.unprocessableEntity('Onboarding not yet complete');

      // 4. Create profile with all cat fields
      data = {
        supabaseUserId,
        displayName: displayName.trim(),
        catName: session.catName!.trim(),
        catBreed: session.catBreed?.trim() ?? null,
        catMarking: session.catMarking?.trim() ?? null,
        catSex: session.catSex!,
        catLifeStage: session.catLifeStage!,
      };
    } else {
      // Direct creation from client (e.g. Diet setup fallback)
      assertDefined(catDetails, 'catDetails');
      assertNonEmpty(catDetails.catName, 'catName');
      assertNonEmpty(catDetails.catSex, 'catSex');
      assertNonEmpty(catDetails.catLifeStage, 'catLifeStage');

      data = {
        supabaseUserId,
        displayName: displayName.trim(),
        catName: catDetails.catName.trim(),
        catBreed: catDetails.catBreed?.trim() ?? null,
        catMarking: catDetails.catMarking?.trim() ?? null,
        catSex: catDetails.catSex,
        catLifeStage: catDetails.catLifeStage,
      };
    }

    const profile = await profileRepository.create(data);

    // 5. Mark session as consumed (prevents replay)
    if (onboardingSessionId) {
      await onboardingRepository.markConsumed(onboardingSessionId);
    }

    return profile;
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
