/**
 * Integration Tests — Onboarding Routes
 *
 * Uses Supertest to exercise the full Express middleware + route + service
 * stack for onboarding step-progression enforcement.
 *
 * Prisma is mocked at the repository layer so no live database is required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { onboardingRouter } from '../onboarding.routes.js';
import { onboardingRepository } from '../../repositories/onboarding.repository.js';

// ---------------------------------------------------------------------------
// Mock the repository so no real DB is hit
// ---------------------------------------------------------------------------
vi.mock('../../repositories/onboarding.repository.js', () => ({
  onboardingRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    markConsumed: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Minimal Express app — mirrors the middleware pipeline in index.ts
// (sanitizer is not needed here; we test step-progression logic only)
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/onboarding', onboardingRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Session factory — mirrors the makeSession helper in service tests
// ---------------------------------------------------------------------------
function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-session-id',
    step: 3,
    ownerName: null,
    ownerEmail: null,
    otpHash: null,
    otpExpiresAt: null,
    otpVerified: false,
    otpLastSentAt: null,
    catsCount: null,
    customCatsCount: null,
    catName: null,
    catBreed: null,
    catMarking: null,
    catSex: null,
    catLifeStage: null,
    consumedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/onboarding/session/:id/update — step-progression enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    // Requirements 9.1, 9.2
    'returns 400 with step-progression error when attempting step 4 but email is not verified',
    async () => {
      // Session has step-2 data (ownerName + ownerEmail) but OTP is not verified
      vi.mocked(onboardingRepository.findById).mockResolvedValueOnce(
        makeSession({
          ownerName: 'Ayla',
          ownerEmail: 'ayla@example.com',
          otpVerified: false,
          catsCount: null,
          customCatsCount: null,
        }),
      );

      const app = buildApp();

      const response = await request(app)
        .post('/api/onboarding/session/test-session-id/update')
        .send({
          step: 4,
          data: { catsCount: 'One' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email must be verified before proceeding',
      });
    },
  );
});
