/**
 * Service Layer — Onboarding
 * Orchestrates business logic, step-level validations, and transition guards.
 */

import { onboardingRepository } from '../repositories/onboarding.repository.js';
import { assertDefined } from '../utils/guards.js';
import { AppError } from '../utils/errors.js';
import type { OnboardingSession } from '@prisma/client';
import {
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema
} from '../schemas/onboarding.schemas.js';

class OnboardingService {
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
        step: Math.max(session.step, 3), // Unlock step 3
      };
    } else if (step === 3) {
      const parsed = onboardingStep3Schema.parse(data);
      updateData = {
        catsCount: parsed.catsCount || null,
        customCatsCount: parsed.customCatsCount || null,
        step: Math.max(session.step, 4), // Unlock step 4
      };
    } else if (step === 4) {
      const parsed = onboardingStep4Schema.parse(data);
      updateData = {
        catName: parsed.catName,
        catBreed: parsed.catBreed || null,
        catMarking: parsed.catMarking || null,
        catSex: parsed.catSex,
        step: Math.max(session.step, 5), // Unlock step 5
      };
    } else if (step === 5) {
      const parsed = onboardingStep5Schema.parse(data);
      updateData = {
        catLifeStage: parsed.catLifeStage,
        step: Math.max(session.step, 6), // Unlock step 6 (ready for profile creation)
      };
    } else {
      throw AppError.badRequest('Invalid step for update');
    }

    return onboardingRepository.update(id, updateData);
  }

  /**
   * Internal helper to assert that the prerequisites of a given step are met.
   */
  private assertPriorStepsValid(session: OnboardingSession, targetStep: number): void {
    if (targetStep >= 3 && (!session.ownerName || session.ownerName.trim().length === 0)) {
      throw AppError.badRequest(`Step 2 data is incomplete; cannot advance to step ${targetStep}`);
    }
    if (targetStep >= 4) {
      const hasCats = (session.catsCount?.trim().length ?? 0) > 0
                   || (session.customCatsCount?.trim().length ?? 0) > 0;
      if (!hasCats) throw AppError.badRequest(`Step 3 data is incomplete; cannot advance to step ${targetStep}`);
    }
    if (targetStep >= 5) {
      if (!session.catName?.trim().length || !session.catSex) {
        throw AppError.badRequest(`Step 4 data is incomplete; cannot advance to step ${targetStep}`);
      }
    }
    if (targetStep >= 6) {
      if (!session.catLifeStage) {
        throw AppError.badRequest(`Step 5 data is incomplete; cannot advance to step ${targetStep}`);
      }
    }
  }
}

/** Singleton instance */
export const onboardingService = new OnboardingService();
