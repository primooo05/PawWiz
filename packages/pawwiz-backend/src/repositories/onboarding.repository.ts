/**
 * Repository Layer — Onboarding Session
 * Encapsulates all Prisma queries for the OnboardingSession model.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type { OnboardingSession } from '@prisma/client';
import { AppError } from '../utils/errors.js';

class OnboardingRepository {
  async findById(id: string): Promise<OnboardingSession | null> {
    return prisma.onboardingSession.findUnique({ where: { id } });
  }

  async create(): Promise<OnboardingSession> {
    return prisma.onboardingSession.create({
      data: {
        step: 2,
      },
    });
  }

  async update(id: string, data: Prisma.OnboardingSessionUpdateInput): Promise<OnboardingSession> {
    try {
      return await prisma.onboardingSession.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound('Onboarding session not found');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<OnboardingSession> {
    try {
      return await prisma.onboardingSession.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound('Onboarding session not found');
      }
      throw error;
    }
  }

  async markConsumed(id: string): Promise<void> {
    try {
      await prisma.onboardingSession.update({
        where: { id },
        data: { consumedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound('Onboarding session not found');
      }
      throw error;
    }
  }
}

/** Singleton instance */
export const onboardingRepository = new OnboardingRepository();

