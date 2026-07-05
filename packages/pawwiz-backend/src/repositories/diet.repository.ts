import { prisma } from '../lib/prisma.js';
import type { DietProfile, DietMealLog } from '@prisma/client';

export interface CreateDietProfileData {
  name: string;
  gender: string;
  lifeStage: string;
  age: number;
  weight: number;
  isKg: boolean;
  foodPreference: string;
  isSpayedNeutered: boolean;
  isTracking?: boolean;
  waterIntake?: number;
  breed?: string | null;
  marking?: string | null;
}

export interface UpdateDietProfileData {
  name?: string;
  gender?: string;
  lifeStage?: string;
  age?: number;
  weight?: number;
  isKg?: boolean;
  foodPreference?: string;
  isSpayedNeutered?: boolean;
  isTracking?: boolean;
  waterIntake?: number;
  breed?: string | null;
  marking?: string | null;
}

export interface UpdateDietMealLogData {
  foodType?: string | null;
  amount?: number | null;
  unit?: string | null;
  kcal?: number;
  status: string;
  timestamp?: string | null;
  /** Rename target for updateMealLogById (custom meal periods only). */
  mealName?: string;
}

/** Rolling window (days) for how much meal-log history we hydrate per profile. */
const MEAL_LOG_WINDOW_DAYS = 7;

/** Start of the bounded meal-log window (UTC midnight, N days ago). */
function mealLogWindowStart(): Date {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (MEAL_LOG_WINDOW_DAYS - 1));
  return start;
}

/** Bounded meal-log include so profile reads never hydrate unbounded history. */
function recentMealLogsInclude() {
  return { where: { createdAt: { gte: mealLogWindowStart() } } };
}

/**
 * Narrow profile select used in all DietProfile reads.
 * mapProfileToFrontend only needs these 5 fields as a fallback when no Cat row
 * is linked — fetching the full Profile row is unnecessary overhead.
 */
const profileSelect = {
  select: {
    catName: true,
    catSex: true,
    catLifeStage: true,
    catBreed: true,
    catMarking: true,
  },
} as const;

class DietRepository {
  async findManyByProfileId(profileId: string) {
    return prisma.dietProfile.findMany({
      where: { profileId },
      include: {
        profile: profileSelect,
        cat: true,
        mealLogs: recentMealLogsInclude(),
      }
    });
  }

  async findById(id: string) {
    return prisma.dietProfile.findUnique({
      where: { id },
      include: {
        profile: profileSelect,
        cat: true,
        mealLogs: recentMealLogsInclude(),
      },
    });
  }

  async findByIdAndProfileId(id: string, profileId: string) {
    return prisma.dietProfile.findFirst({
      where: { id, profileId },
      include: {
        profile: profileSelect,
        cat: true,
        mealLogs: recentMealLogsInclude(),
      },
    });
  }

  async create(profileId: string, data: CreateDietProfileData) {
    // Atomic: the Cat and its DietProfile (+ seed meal logs) are created in one
    // transaction so a partial failure cannot leave an orphaned Cat behind.
    return prisma.$transaction(async (tx) => {
      const cat = await tx.cat.create({
        data: {
          profileId,
          name: data.name,
          sex: data.gender,
          lifeStage: data.lifeStage,
          age: data.age,
          breed: data.breed,
          marking: data.marking,
        }
      });

      return tx.dietProfile.create({
        data: {
          profileId,
          catId: cat.id,
          weight: data.weight,
          isKg: data.isKg,
          foodPreference: data.foodPreference,
          isSpayedNeutered: data.isSpayedNeutered,
          isTracking: data.isTracking ?? false,
          waterIntake: data.waterIntake ?? 0,
          mealLogs: {
            create: [
              { mealName: 'Breakfast', status: 'pending', kcal: 0 },
              { mealName: 'Lunch', status: 'pending', kcal: 0 },
              { mealName: 'Dinner', status: 'pending', kcal: 0 },
            ],
          },
        },
        include: {
          profile: profileSelect,
          cat: true,
          mealLogs: recentMealLogsInclude(),
        },
      });
    });
  }

  async update(id: string, data: UpdateDietProfileData) {
    const { name, gender, lifeStage, age, breed, marking, ...dietData } = data;

    // Atomic: the linked Cat update and the DietProfile update either both
    // commit or both roll back.
    return prisma.$transaction(async (tx) => {
      const dietProfile = await tx.dietProfile.findUnique({
        where: { id },
        select: { catId: true },
      });

      if (dietProfile?.catId && (name !== undefined || gender !== undefined || lifeStage !== undefined || age !== undefined || breed !== undefined || marking !== undefined)) {
        await tx.cat.update({
          where: { id: dietProfile.catId },
          data: {
            name,
            sex: gender,
            lifeStage,
            age,
            breed,
            marking,
          },
        });
      }

      return tx.dietProfile.update({
        where: { id },
        data: dietData,
        include: {
          profile: profileSelect,
          cat: true,
          mealLogs: recentMealLogsInclude(),
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.dietProfile.delete({
      where: { id },
    });
  }

  /**
   * Create a brand-new meal log row for a custom meal period (e.g. "Midnight
   * Snack") that isn't one of the 3 standard Breakfast/Lunch/Dinner slots.
   * Standard meals reuse updateMealLog's find-or-create-for-today behavior;
   * custom periods always get their own new row per log so multiple entries
   * with the same custom name on the same day don't collide.
   */
  async createMealLog(dietProfileId: string, data: UpdateDietMealLogData & { mealName: string }) {
    return prisma.dietMealLog.create({
      data: {
        dietProfileId,
        mealName: data.mealName,
        foodType: data.foodType ?? null,
        amount: data.amount ?? null,
        unit: data.unit ?? null,
        kcal: data.kcal ?? 0,
        status: data.status,
        timestamp: data.timestamp ?? null,
      },
    });
  }

  /**
   * Update a specific meal log row by its own id (used for custom meal
   * periods, whose frontend "mealId" is the actual DietMealLog row id rather
   * than the fixed 1/2/3 standard-slot mapping).
   */
  async updateMealLogById(dietProfileId: string, mealLogId: string, data: UpdateDietMealLogData) {
    const mealLog = await prisma.dietMealLog.findFirst({
      where: { id: mealLogId, dietProfileId },
    });
    if (!mealLog) return null;

    return prisma.dietMealLog.update({
      where: { id: mealLog.id },
      data: {
        mealName: data.mealName !== undefined ? data.mealName : mealLog.mealName,
        foodType: data.foodType !== undefined ? data.foodType : mealLog.foodType,
        amount: data.amount !== undefined ? data.amount : mealLog.amount,
        unit: data.unit !== undefined ? data.unit : mealLog.unit,
        kcal: data.kcal !== undefined ? data.kcal : mealLog.kcal,
        status: data.status,
        timestamp: data.timestamp !== undefined ? data.timestamp : mealLog.timestamp,
      },
    });
  }

  async updateMealLog(dietProfileId: string, mealName: string, data: UpdateDietMealLogData) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Find a meal log for today
    const mealLog = await prisma.dietMealLog.findFirst({
      where: { 
        dietProfileId, 
        mealName,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
    });

    if (!mealLog) {
      // If none exists for today, create a new record
      return prisma.dietMealLog.create({
        data: {
          dietProfileId,
          mealName,
          foodType: data.foodType ?? null,
          amount: data.amount ?? null,
          unit: data.unit ?? null,
          kcal: data.kcal ?? 0,
          status: data.status,
          timestamp: data.timestamp ?? null,
        },
      });
    }

    return prisma.dietMealLog.update({
      where: { id: mealLog.id },
      data: {
        foodType: data.foodType !== undefined ? data.foodType : mealLog.foodType,
        amount: data.amount !== undefined ? data.amount : mealLog.amount,
        unit: data.unit !== undefined ? data.unit : mealLog.unit,
        kcal: data.kcal !== undefined ? data.kcal : mealLog.kcal,
        status: data.status,
        timestamp: data.timestamp !== undefined ? data.timestamp : mealLog.timestamp,
      },
    });
  }
}

export const dietRepository = new DietRepository();
