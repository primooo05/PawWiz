import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { onboardingService } from '../services/onboarding.service.js';
import { ZodError } from 'zod';

/**
 * POST /api/onboarding/start
 * Starts a new onboarding session and returns the session ID.
 */
export const startOnboarding = withErrorHandling(async (req: Request, res: Response) => {
  const session = await onboardingService.startSession();
  res.status(201).json({ id: session.id, step: session.step });
});

/**
 * GET /api/onboarding/session/:id
 * Retrieves the current state of an onboarding session.
 */
export const getOnboardingSession = withErrorHandling(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = await onboardingService.getSession(id);
  res.json(session);
});

/**
 * POST /api/onboarding/session/:id/update
 * Validates data for a step and updates the onboarding session progress.
 */
export const updateOnboardingStep = withErrorHandling(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { step, data } = req.body;

  if (typeof step !== 'number') {
    res.status(400).json({ error: 'Step must be a number' });
    return;
  }

  try {
    const session = await onboardingService.updateStep(id, step, data);
    res.json(session);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0].message, errors: error.issues });
      return;
    }
    throw error;
  }
});
