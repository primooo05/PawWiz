import { dietRepository } from '../repositories/diet.repository.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { assertDefined } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import { profileService } from './profile.service.js';
import { prisma } from '../lib/prisma.js';

/**
 * Absolute ceiling for stored daily water intake (ml). A cat's normal intake is
 * ~50 ml/kg/day; even the largest, heaviest-drinking cat stays well under this.
 * The cap prevents one-tap spam from producing physically impossible hydration
 * data that would corrupt the dashboard analytics.
 */
const MAX_DAILY_WATER_ML = 2000;

function mapProfileToFrontend(profile: any) {
  const mealMap: Record<string, string> = {
    'Breakfast': '1',
    'Lunch': '2',
    'Dinner': '3'
  };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  // Filter logs to only include those created today in UTC
  const todayLogs = (profile.mealLogs || []).filter((m: any) => {
    const d = new Date(m.createdAt);
    return d >= todayStart && d <= todayEnd;
  });

  // Construct loggedMeals, ensuring all 3 standard meals are present
  const standardMeals = ['Breakfast', 'Lunch', 'Dinner'];
  const loggedMeals = standardMeals.map(mealName => {
    const existing = todayLogs.find((m: any) => m.mealName === mealName);
    if (existing) {
      return {
        id: mealMap[mealName] || existing.id,
        mealName: existing.mealName,
        foodType: existing.foodType || undefined,
        amount: existing.amount !== null ? existing.amount : undefined,
        unit: existing.unit || undefined,
        kcal: existing.kcal,
        status: existing.status,
        timestamp: existing.timestamp || undefined,
        updatedAt: existing.updatedAt,
      };
    } else {
      return {
        id: mealMap[mealName],
        mealName,
        foodType: undefined,
        amount: undefined,
        unit: undefined,
        kcal: 0,
        status: 'pending',
        timestamp: undefined,
      };
    }
  });

  // Sort: Breakfast (1), Lunch (2), Dinner (3)
  loggedMeals.sort((a: any, b: any) => a.id.localeCompare(b.id));

  // Append any custom-period meals logged today (e.g. "Midnight Snack") —
  // these use their DB row id directly since they aren't part of the fixed
  // 1/2/3 mapping.
  const customMeals = todayLogs
    .filter((m: any) => !standardMeals.includes(m.mealName))
    .map((m: any) => ({
      id: m.id,
      mealName: m.mealName,
      foodType: m.foodType || undefined,
      amount: m.amount !== null ? m.amount : undefined,
      unit: m.unit || undefined,
      kcal: m.kcal,
      status: m.status,
      timestamp: m.timestamp || undefined,
      updatedAt: m.updatedAt,
    }));

  loggedMeals.push(...customMeals);

  // Compute successDays based on database records
  const logsByDate: Record<string, any[]> = {};
  (profile.mealLogs || []).forEach((m: any) => {
    const dateStr = new Date(m.createdAt).toLocaleDateString('sv-SE'); // YYYY-MM-DD
    if (!logsByDate[dateStr]) {
      logsByDate[dateStr] = [];
    }
    logsByDate[dateStr].push(m);
  });

  const successDays: string[] = [];
  Object.entries(logsByDate).forEach(([dateStr, logs]) => {
    const standardMeals = ['Breakfast', 'Lunch', 'Dinner'];
    const completedMeals = logs.filter((m: any) => m.status === 'logged' || m.status === 'skipped');
    const hasAllThree = standardMeals.every(mealName => 
      completedMeals.some((m: any) => m.mealName === mealName)
    );
    if (hasAllThree) {
      successDays.push(dateStr);
    }
  });

  return {
    id: profile.id,
    catId: profile.catId ?? null,
    name: profile.cat ? profile.cat.name : profile.profile.catName,
    gender: profile.cat ? profile.cat.sex : profile.profile.catSex,
    lifeStage: profile.cat ? profile.cat.lifeStage : profile.profile.catLifeStage,
    age: profile.cat ? (profile.cat.age ?? undefined) : undefined,
    weight: profile.weight,
    isKg: profile.isKg,
    foodPreference: profile.foodPreference,
    isSpayedNeutered: profile.isSpayedNeutered,
    isTracking: profile.isTracking,
    waterIntake: profile.waterIntake,
    breed: profile.cat ? profile.cat.breed : profile.profile.catBreed,
    marking: profile.cat ? profile.cat.marking : profile.profile.catMarking,
    photoUrl: profile.cat?.photoUrl || null,
    updatedAt: profile.updatedAt,
    successDays,
    loggedMeals,
  };
}

class DietService {
  private async getProfileIdOrThrow(supabaseUserId: string, email?: string): Promise<string> {
    const userProfile = await profileService.getProfileByUserId(supabaseUserId, email);
    return userProfile.id;
  }

  async getProfiles(supabaseUserId: string, email?: string) {
    const userProfile = await profileService.getProfileByUserId(supabaseUserId, email);
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

    if (existing.catId) {
      await prisma.cat.delete({
        where: { id: existing.catId },
      });
    } else {
      await dietRepository.delete(id);
    }
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
    if (mealName) {
      // Standard meal slot (1/2/3) — find-or-create today's row for it.
      await dietRepository.updateMealLog(profileId, mealName, data);
    } else {
      // Custom meal period (e.g. "Midnight Snack") — mealId is the actual
      // DietMealLog row id, so update it directly.
      await dietRepository.updateMealLogById(profileId, mealId, data);
    }

    const updatedProfile = await dietRepository.findById(profileId);
    return mapProfileToFrontend(updatedProfile);
  }

  /** Create a new meal log entry for a custom period (e.g. "Midnight Snack"). */
  async createCustomMeal(supabaseUserId: string, profileId: string, data: any) {
    const userProfileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(profileId, userProfileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    await dietRepository.createMealLog(profileId, data);

    const updatedProfile = await dietRepository.findById(profileId);
    return mapProfileToFrontend(updatedProfile);
  }

  async updateWater(supabaseUserId: string, profileId: string, data: { amount: number; reset?: boolean }) {
    const userProfileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(profileId, userProfileId);
    if (!existing) throw AppError.notFound('Diet profile not found');

    let newWaterIntake = data.reset
      ? 0
      : Math.min(MAX_DAILY_WATER_ML, Math.max(0, existing.waterIntake + data.amount));

    const updated = await dietRepository.update(profileId, { waterIntake: newWaterIntake });
    return mapProfileToFrontend(updated);
  }

  async updateAvatar(supabaseUserId: string, profileId: string, photoUrl: string) {
    const userProfileId = await this.getProfileIdOrThrow(supabaseUserId);
    const existing = await dietRepository.findByIdAndProfileId(profileId, userProfileId);
    if (!existing) throw AppError.notFound('Diet profile not found');
    if (!existing.catId) throw AppError.badRequest('Profile has no associated cat');

    await prisma.cat.update({
      where: { id: existing.catId },
      data: { photoUrl } as any,
    });

    const updated = await dietRepository.findById(profileId);
    return mapProfileToFrontend(updated);
  }
}

export const dietService = new DietService();
