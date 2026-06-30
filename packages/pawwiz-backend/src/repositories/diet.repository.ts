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
}

export interface UpdateDietMealLogData {
  foodType?: string | null;
  amount?: number | null;
  unit?: string | null;
  kcal?: number;
  status: string;
  timestamp?: string | null;
}

class DietRepository {
  async findManyByProfileId(profileId: string) {
    return prisma.dietProfile.findMany({
      where: { profileId },
      include: { mealLogs: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.dietProfile.findUnique({
      where: { id },
      include: { mealLogs: true },
    });
  }

  async findByIdAndProfileId(id: string, profileId: string) {
    return prisma.dietProfile.findFirst({
      where: { id, profileId },
      include: { mealLogs: true },
    });
  }

  async create(profileId: string, data: CreateDietProfileData) {
    return prisma.dietProfile.create({
      data: {
        profileId,
        name: data.name,
        gender: data.gender,
        lifeStage: data.lifeStage,
        age: data.age,
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
      include: { mealLogs: true },
    });
  }

  async update(id: string, data: UpdateDietProfileData) {
    return prisma.dietProfile.update({
      where: { id },
      data,
      include: { mealLogs: true },
    });
  }

  async delete(id: string) {
    return prisma.dietProfile.delete({
      where: { id },
    });
  }

  async updateMealLog(dietProfileId: string, mealName: string, data: UpdateDietMealLogData) {
    // Find the meal log ID first
    const mealLog = await prisma.dietMealLog.findFirst({
      where: { dietProfileId, mealName },
    });

    if (!mealLog) {
      // If for some reason it doesn't exist, create it
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
