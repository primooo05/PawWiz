/**
 * Repository Layer — Onboarding Session
 * Encapsulates all Prisma queries for the OnboardingSession model.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import type { OnboardingSession, Prisma } from '@prisma/client';

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
    return prisma.onboardingSession.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<OnboardingSession> {
    return prisma.onboardingSession.delete({ where: { id } });
  }

  async markConsumed(id: string): Promise<void> {
    await prisma.onboardingSession.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}

/** Singleton instance */
export const onboardingRepository = new OnboardingRepository();
