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

  /**
   * Public projection for GET /session/:id — never exposes the OTP secret
   * material (otpHash / otpExpiresAt / otpLastSentAt / otpAttempts). Returns
   * only the fields the onboarding wizard needs to resume its state.
   */
  async findByIdPublic(id: string) {
    return prisma.onboardingSession.findUnique({
      where: { id },
      select: {
        id: true,
        step: true,
        ownerName: true,
        ownerEmail: true,
        otpVerified: true,
        catsCount: true,
        customCatsCount: true,
        catName: true,
        catBreed: true,
        catMarking: true,
        catSex: true,
        catLifeStage: true,
        consumedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(): Promise<OnboardingSession> {
    return prisma.onboardingSession.create({
      data: {
        step: 2,
      },
    });
  }

  /**
   * Create a new onboarding session with a pre-generated session token.
   * The token is stored in plaintext and compared on subsequent requests.
   */
  async createWithToken(sessionToken: string): Promise<OnboardingSession> {
    return prisma.onboardingSession.create({
      data: {
        step: 2,
        sessionToken,
      } as any,
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

  async findLatestByEmail(email: string): Promise<OnboardingSession | null> {
    return prisma.onboardingSession.findFirst({
      where: {
        ownerEmail: { equals: email, mode: 'insensitive' },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async isEmailConsumed(email: string): Promise<boolean> {
    const session = await prisma.onboardingSession.findFirst({
      where: {
        ownerEmail: { equals: email, mode: 'insensitive' },
        consumedAt: { not: null },
      },
      select: { id: true },
    });
    return session !== null;
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

