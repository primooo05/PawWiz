import { dietRepository } from '../repositories/diet.repository.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { assertDefined } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';

function mapProfileToFrontend(profile: any) {
  const mealMap: Record<string, string> = {
    'Breakfast': '1',
    'Lunch': '2',
    'Dinner': '3'
  };

  const loggedMeals = (profile.mealLogs || []).map((m: any) => ({
    id: mealMap[m.mealName] || m.id,
    mealName: m.mealName,
    foodType: m.foodType || undefined,
    amount: m.amount !== null ? m.amount : undefined,
    unit: m.unit || undefined,
    kcal: m.kcal,
    status: m.status,
    timestamp: m.timestamp || undefined,
  }));

  // Sort: Breakfast (1), Lunch (2), Dinner (3)
  loggedMeals.sort((a: any, b: any) => a.id.localeCompare(b.id));

  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    lifeStage: profile.lifeStage,
    age: profile.age,
    weight: profile.weight,
    isKg: profile.isKg,
    foodPreference: profile.foodPreference,
    isSpayedNeutered: profile.isSpayedNeutered,
    isTracking: profile.isTracking,
    waterIntake: profile.waterIntake,
    loggedMeals,
  };
}

class DietService {
  private async getProfileIdOrThrow(supabaseUserId: string): Promise<string> {
    const userProfile = await profileRepository.findBySupabaseUserId(supabaseUserId);
    assertDefined(userProfile, 'User profile not found. Please complete onboarding first.');
    return userProfile.id;
  }

  async getProfiles(supabaseUserId: string) {
    const userProfile = await profileRepository.findBySupabaseUserId(supabaseUserId);
    assertDefined(userProfile, 'User profile not found. Please complete onboarding first.');
    const profileId = userProfile.id;

    const profiles = await dietRepository.findManyByProfileId(profileId);
    return profiles.map(mapProfileToFrontend);
  }

  async createProfile(supabaseUserId: string, data: any) {
    const profileId = await this.getProfileIdOrThrow(supabaseUserId);
    const newProfile = await dietRepository.create(profileId, data);
    return mapProfileToFrontend(newProfile);
  }

  async updateProfile(supabaseUserId: string, id: string, data: any) {
    const profileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(id, profileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    const updated = await dietRepository.update(id, data);
    return mapProfileToFrontend(updated);
  }

  async deleteProfile(supabaseUserId: string, id: string) {
    const profileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(id, profileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    await dietRepository.delete(id);
    return { success: true };
  }

  async updateMeal(supabaseUserId: string, profileId: string, mealId: string, data: any) {
    const userProfileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(profileId, userProfileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    const mealIdMap: Record<string, string> = {
      '1': 'Breakfast',
      '2': 'Lunch',
      '3': 'Dinner',
    };

    const mealName = mealIdMap[mealId];
    if (!mealName) throw AppError.badRequest('Invalid mealId. Must be 1, 2, or 3.');

    await dietRepository.updateMealLog(profileId, mealName, data);

    const updatedProfile = await dietRepository.findById(profileId);
    return mapProfileToFrontend(updatedProfile);
  }

  async updateWater(supabaseUserId: string, profileId: string, data: { amount: number; reset?: boolean }) {
    const userProfileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(profileId, userProfileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    let newWaterIntake = data.reset ? 0 : Math.max(0, existing.waterIntake + data.amount);

    const updated = await dietRepository.update(profileId, { waterIntake: newWaterIntake });
    return mapProfileToFrontend(updated);
  }
}

export const dietService = new DietService();
