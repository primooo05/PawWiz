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
import { Prisma } from '@prisma/client';
import type { OnboardingSession } from '@prisma/client';
import { logger } from '../utils/winston.js';
import { randomUUID } from 'crypto';
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
   * Returns only id, step, and the one-time session token. The token must be
   * stored by the client and supplied as X-Session-Token on all subsequent
   * mutating operations.
   */
  async startSession(): Promise<{ id: string; step: number; sessionToken: string }> {
    const token = randomUUID();
    const session = await onboardingRepository.createWithToken(token);
    // Return the minimum fields needed by the client — no OTP state, no internal fields.
    return { id: session.id, step: session.step, sessionToken: token };
  }

  /**
   * Verifies that the supplied token matches the session's stored token.
   * Throws 401 if the token is missing or does not match — prevents
   * UUID-only session takeover where an attacker enumerates session IDs
   * without possessing the session token issued at creation.
   */
  private async verifySessionToken(session: OnboardingSession, suppliedToken: string | undefined): Promise<void> {
    if (!suppliedToken) {
      throw AppError.unauthorized('Session token is required');
    }
    const storedToken = (session as any).sessionToken as string | null;
    if (!storedToken || storedToken !== suppliedToken) {
      throw AppError.unauthorized('Invalid session token');
    }
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
   * Retrieves a sanitized onboarding session for public (unauthenticated) reads.
   * Strips OTP secret material so it is never returned to the client.
   */
  async getSessionPublic(id: string) {
    const session = await onboardingRepository.findByIdPublic(id);
    assertDefined(session, 'Onboarding session not found');
    return session;
  }

  /**
   * Validates and updates session data for a specific step.
   * Enforces that all prior steps' data must exist.
   * Requires the session token issued at creation.
   * Returns only public-safe fields — OTP secret material is never included.
   */
  async updateStep(id: string, step: number, data: any, sessionToken?: string) {
    const session = await this.getSession(id);
    await this.verifySessionToken(session, sessionToken);

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
    } else {
      throw AppError.badRequest('Invalid step for update');
    }

    // Use updatePublic so OTP fields are never included in the response.
    return onboardingRepository.updatePublic(id, updateData);
  }

  /**
   * Saves a completed cat (name + breed + marking + sex + lifeStage) as a Cat
   * row linked to this onboarding session. Called after the user finishes
   * step 6 (life stage) when they are adding additional cats in a multi-cat
   * flow. The first cat is already captured on the flat session columns and
   * will be created by profile.service.ts at registration time; this endpoint
   * stores subsequent cats so none are lost.
   *
   * Requires the session token issued at creation.
   */
  async saveCatToSession(
    id: string,
    catData: { catName: string; catBreed?: string | null; catMarking?: string | null; catSex: string; catLifeStage: string },
    sessionToken?: string,
  ): Promise<void> {
    const session = await this.getSession(id);
    await this.verifySessionToken(session, sessionToken);

    if (session.step < 7) {
      throw AppError.badRequest('Complete the cat details steps before saving a cat');
    }

    await prisma.cat.create({
      data: {
        onboardingSessionId: id,
        name: catData.catName.trim(),
        breed: catData.catBreed?.trim() || null,
        marking: catData.catMarking?.trim() || null,
        sex: catData.catSex,
        lifeStage: catData.catLifeStage,
      },
    });
  }

  /**
   * Sends a 6-digit OTP to the session's ownerEmail.
   * Enforces a 60-second cooldown between sends.
   * Requires the session token issued at creation.
   */
  async sendOtp(id: string, sessionToken?: string): Promise<{ cooldownSeconds: number }> {
    const session = await this.getSession(id);
    await this.verifySessionToken(session, sessionToken);

    if (!session.ownerEmail || session.ownerEmail.trim().length === 0) {
      throw AppError.badRequest('Email address is required before OTP can be sent');
    }

    // Rate-limit: 60s cooldown
    if (session.otpLastSentAt) {
      const elapsed = Date.now() - session.otpLastSentAt.getTime();
      if (elapsed < 60_000) {
        throw AppError.badRequest('Please wait before requesting another code');
      }
    }

    // Enumeration-safe: if the email is already registered we still return the
    // identical generic response, but skip generating/sending a code. Callers
    // cannot distinguish "sent" from "already exists" — no account oracle.
    const emailExists = await this.checkEmailExists(session.ownerEmail.trim());
    if (emailExists) {
      logger.info('[Onboarding] OTP send suppressed for already-registered email', { sessionId: id });
      return { cooldownSeconds: 60 };
    }

    const code = otpService.generateOtp();
    const hash = otpService.hashOtp(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min TTL
    const now = new Date();

    // Persist FIRST (if DB fails, no email sent — consistent state).
    // Reset the failed-attempt counter each time a fresh code is issued.
    await onboardingRepository.update(id, {
      otpHash: hash,
      otpExpiresAt: expiresAt,
      otpLastSentAt: now,
      otpVerified: false,
      otpAttempts: 0,
    } as Prisma.OnboardingSessionUpdateInput);

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
   * Requires the session token issued at creation.
   * Returns only public-safe fields — OTP secret material is never included.
   */
  async verifyOtp(id: string, code: string, sessionToken?: string) {
    const session = await this.getSession(id);
    await this.verifySessionToken(session, sessionToken);

    if (!session.otpHash || !session.otpExpiresAt) {
      throw AppError.badRequest('No OTP has been issued for this session');
    }

    if (session.otpVerified) {
      throw AppError.badRequest('Email has already been verified');
    }

    // Per-session brute-force lockout. After MAX_OTP_ATTEMPTS failures the code
    // is invalidated and the user must request a fresh one (which resets the
    // counter). This bounds guesses to MAX_OTP_ATTEMPTS per issued code.
    const MAX_OTP_ATTEMPTS = 3;
    const attempts = (session as { otpAttempts?: number }).otpAttempts ?? 0;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      throw AppError.badRequest('Too many incorrect attempts. Please request a new code.');
    }

    const isValid = otpService.verifyOtp(code, session.otpHash, session.otpExpiresAt);
    if (!isValid) {
      // Count the failed attempt; invalidate the code once the cap is reached.
      // This path throws — no session data is returned to the client, so using
      // the internal update() here is fine.
      const nextAttempts = attempts + 1;
      await onboardingRepository.update(id, {
        otpAttempts: nextAttempts,
        ...(nextAttempts >= MAX_OTP_ATTEMPTS
          ? { otpHash: null, otpExpiresAt: null }
          : {}),
      } as Prisma.OnboardingSessionUpdateInput);
      throw AppError.badRequest('Invalid or expired code');
    }

    // Success — clear the OTP secret material and advance the step.
    // Use updatePublic so the cleared otpHash/otpExpiresAt/otpAttempts fields
    // (and any other OTP state) are excluded from the HTTP response.
    return onboardingRepository.updatePublic(id, {
      otpVerified: true,
      otpHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      step: Math.max(session.step, 4), // Unlock step 4 (cats count)
    } as Prisma.OnboardingSessionUpdateInput);
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
