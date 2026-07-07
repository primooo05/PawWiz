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
import { prisma } from '../lib/prisma.js';
import type { Profile } from '@prisma/client';

class ProfileService {
  /**
   * Create a new profile for a Supabase user.
   * Resolves cat fields from the onboarding session and marks it consumed.
   * Guards: all three inputs non-empty, no duplicate profile, valid unconsumed session at step 6.
   *
   * @param additionalCats - Full cat list accumulated on the frontend during
   *   multi-cat onboarding. When provided (non-empty), these are used as the
   *   authoritative source for all cats. When empty/absent, falls back to the
   *   flat session columns (single-cat flow).
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
    },
    additionalCats?: Array<{
      catName: string;
      catBreed?: string | null;
      catMarking?: string | null;
      catSex: string;
      catLifeStage: string;
    }>
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

    // 5. Create onboarding cat(s) and their default diet profiles.
    if (onboardingSessionId) {
      const session = await onboardingRepository.findById(onboardingSessionId);
      if (session) {
        // Multi-cat flow: the frontend sends the full accumulated list in
        // `additionalCats`. Single-cat flow: that array is empty/absent, so
        // fall back to the flat session columns.
        const allCats: Array<{
          name: string;
          breed: string | null | undefined;
          marking: string | null | undefined;
          sex: string;
          lifeStage: string;
        }> = (additionalCats && additionalCats.length > 0)
          ? additionalCats.map((c) => ({
              name: c.catName.trim(),
              breed: c.catBreed?.trim() || null,
              marking: c.catMarking?.trim() || null,
              sex: c.catSex,
              lifeStage: c.catLifeStage,
            }))
          : [{
              name: session.catName!.trim(),
              breed: session.catBreed?.trim() ?? null,
              marking: session.catMarking?.trim() ?? null,
              sex: session.catSex!,
              lifeStage: session.catLifeStage!,
            }];

        for (const catData of allCats) {
          const cat = await prisma.cat.create({
            data: {
              profileId: profile.id,
              name: catData.name,
              breed: catData.breed,
              marking: catData.marking,
              sex: catData.sex,
              lifeStage: catData.lifeStage,
            },
          });

          await prisma.dietProfile.create({
            data: {
              profileId: profile.id,
              catId: cat.id,
              weight: 4.0,
              isKg: true,
              foodPreference: 'mixed',
              isSpayedNeutered: false,
              isTracking: false,
              mealLogs: {
                create: [
                  { mealName: 'Breakfast', status: 'pending', kcal: 0 },
                  { mealName: 'Lunch', status: 'pending', kcal: 0 },
                  { mealName: 'Dinner', status: 'pending', kcal: 0 },
                ],
              },
            },
          });
        }
      }

      await onboardingRepository.markConsumed(onboardingSessionId);
    }

    return profile;
  }

  async getProfileByUserId(supabaseUserId: string, email?: string): Promise<Profile> {
    assertNonEmpty(supabaseUserId, 'supabaseUserId');

    let profile = await profileRepository.findBySupabaseUserId(supabaseUserId);

    // Only query onboarding when the profile still carries the placeholder cat
    // name ('Aki'). Once the profile has real data this branch is never entered,
    // eliminating a redundant ILIKE scan on every authenticated request.
    if (profile && email && profile.catName === 'Aki') {
      const onboardingSession = await onboardingRepository.findLatestByEmail(email);
      if (onboardingSession?.catName && onboardingSession.catName !== 'Aki') {
        profile = await profileRepository.update(profile.id, {
          displayName: onboardingSession.ownerName || profile.displayName,
          catName: onboardingSession.catName,
          catSex: onboardingSession.catSex || profile.catSex,
          catLifeStage: onboardingSession.catLifeStage || profile.catLifeStage,
          catBreed: onboardingSession.catBreed || profile.catBreed,
          catMarking: onboardingSession.catMarking || profile.catMarking,
        });
      }
    }

    if (!profile) {
      throw AppError.notFound('Profile not found');
    }
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
