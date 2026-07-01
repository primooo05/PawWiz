/**
 * Service Layer — Onboarding
 * Orchestrates business logic, step-level validations, and transition guards.
 */

import { onboardingRepository } from '../repositories/onboarding.repository.js';
import { assertDefined } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import { otpService } from './otp.service.js';
import { mailerService } from './mailer.service.js';
import { prisma } from '../lib/prisma.js';
import type { OnboardingSession } from '@prisma/client';
import {
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema
} from '../schemas/onboarding.schemas.js';

class OnboardingService {
  /**
   * Checks whether the given email address is already associated with a completed
   * registration (i.e., a consumed onboarding session exists for it).
   */
  async checkEmailExists(email: string): Promise<boolean> {
    return onboardingRepository.isEmailConsumed(email);
  }

  /**
   * Starts a new onboarding session.
   */
  async startSession(): Promise<OnboardingSession> {
    return onboardingRepository.create();
  }

  /**
   * Retrieves an onboarding session, throwing 404 if not found.
   */
  async getSession(id: string): Promise<OnboardingSession> {
    const session = await onboardingRepository.findById(id);
    assertDefined(session, 'Onboarding session not found');
    return session;
  }

  /**
   * Validates and updates session data for a specific step.
   * Enforces that all prior steps' data must exist.
   */
  async updateStep(id: string, step: number, data: any): Promise<OnboardingSession> {
    const session = await this.getSession(id);

    // 1. Guard check: Ensure prior step data exists
    this.assertPriorStepsValid(session, step);

    // 2. Schema validation for the incoming step data
    let updateData: any = {};
    if (step === 2) {
      const parsed = onboardingStep2Schema.parse(data);
      updateData = {
        ownerName: parsed.ownerName,
        ownerEmail: parsed.ownerEmail,
        step: Math.max(session.step, 3), // Unlock step 3 (OTP)
      };
    } else if (step === 3) {
      // Step 3 is now OTP — handled via sendOtp/verifyOtp endpoints
      throw AppError.badRequest('Step 3 (OTP) uses dedicated send/verify endpoints');
    } else if (step === 4) {
      const parsed = onboardingStep3Schema.parse(data);
      updateData = {
        catsCount: parsed.catsCount || null,
        customCatsCount: parsed.customCatsCount || null,
        step: Math.max(session.step, 5), // Unlock step 5
      };
    } else if (step === 5) {
      const parsed = onboardingStep4Schema.parse(data);
      updateData = {
        catName: parsed.catName,
        catBreed: parsed.catBreed || null,
        catMarking: parsed.catMarking || null,
        catSex: parsed.catSex,
        step: Math.max(session.step, 6), // Unlock step 6
      };
    } else if (step === 6) {
      const parsed = onboardingStep5Schema.parse(data);
      updateData = {
        catLifeStage: parsed.catLifeStage,
        step: Math.max(session.step, 7), // Unlock step 7
      };

      // Upsert the cat to the Cats table to handle back-edits and multiple cats
      const existingCat = await prisma.cat.findFirst({
        where: {
          onboardingSessionId: id,
          name: session.catName!,
        },
      });

      if (existingCat) {
        await prisma.cat.update({
          where: { id: existingCat.id },
          data: {
            breed: session.catBreed,
            marking: session.catMarking,
            sex: session.catSex!,
            lifeStage: parsed.catLifeStage,
          },
        });
      } else {
        await prisma.cat.create({
          data: {
            onboardingSessionId: id,
            name: session.catName!,
            breed: session.catBreed,
            marking: session.catMarking,
            sex: session.catSex!,
            lifeStage: parsed.catLifeStage,
          },
        });
      }
    } else {
      throw AppError.badRequest('Invalid step for update');
    }

    return onboardingRepository.update(id, updateData);
  }

  /**
   * Sends a 6-digit OTP to the session's ownerEmail.
   * Enforces a 60-second cooldown between sends.
   */
  async sendOtp(id: string): Promise<{ cooldownSeconds: number }> {
    const session = await this.getSession(id);

    if (!session.ownerEmail || session.ownerEmail.trim().length === 0) {
      throw AppError.badRequest('Email address is required before OTP can be sent');
    }

    const emailExists = await this.checkEmailExists(session.ownerEmail.trim());
    if (emailExists) {
      throw AppError.badRequest('Email already exists, meow');
    }

    // Rate-limit: 60s cooldown
    if (session.otpLastSentAt) {
      const elapsed = Date.now() - session.otpLastSentAt.getTime();
      if (elapsed < 60_000) {
        throw AppError.badRequest('Please wait before requesting another code');
      }
    }

    const code = otpService.generateOtp();
    const hash = otpService.hashOtp(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min TTL
    const now = new Date();

    // Persist FIRST (if DB fails, no email sent — consistent state)
    await onboardingRepository.update(id, {
      otpHash: hash,
      otpExpiresAt: expiresAt,
      otpLastSentAt: now,
      otpVerified: false,
    });

    // Send email (may silently skip if GMAIL credentials are absent)
    await mailerService.sendOtpEmail(
      session.ownerEmail,
      session.ownerName || 'Cat Parent',
      code
    );

    return { cooldownSeconds: 60 };
  }

  /**
   * Verifies a user-supplied OTP code against the stored hash + TTL.
   * On success, advances session past step 3 (OTP gate).
   */
  async verifyOtp(id: string, code: string): Promise<OnboardingSession> {
    const session = await this.getSession(id);

    if (!session.otpHash || !session.otpExpiresAt) {
      throw AppError.badRequest('No OTP has been issued for this session');
    }

    if (session.otpVerified) {
      throw AppError.badRequest('Email has already been verified');
    }

    const isValid = otpService.verifyOtp(code, session.otpHash, session.otpExpiresAt);
    if (!isValid) {
      throw AppError.badRequest('Invalid or expired code');
    }

    return onboardingRepository.update(id, {
      otpVerified: true,
      step: Math.max(session.step, 4), // Unlock step 4 (cats count)
    });
  }

  /**
   * Internal helper to assert that the prerequisites of a given step are met.
   */
  private assertPriorStepsValid(session: OnboardingSession, targetStep: number): void {
    if (targetStep >= 3 && (!session.ownerName || session.ownerName.trim().length === 0)) {
      throw AppError.badRequest(`Step 2 data is incomplete; cannot advance to step ${targetStep}`);
    }
    if (targetStep >= 4 && !session.otpVerified) {
      throw AppError.badRequest('Email must be verified before proceeding');
    }
    if (targetStep >= 5) {
      const hasCats = (session.catsCount?.trim().length ?? 0) > 0
                   || (session.customCatsCount?.trim().length ?? 0) > 0;
      if (!hasCats) throw AppError.badRequest(`Step 4 data is incomplete; cannot advance to step ${targetStep}`);
    }
    if (targetStep >= 6) {
      if (!session.catName?.trim().length || !session.catSex) {
        throw AppError.badRequest(`Step 5 data is incomplete; cannot advance to step ${targetStep}`);
      }
    }
    if (targetStep >= 7) {
      if (!session.catLifeStage) {
        throw AppError.badRequest(`Step 6 data is incomplete; cannot advance to step ${targetStep}`);
      }
    }
  }
}

/** Singleton instance */
export const onboardingService = new OnboardingService();
