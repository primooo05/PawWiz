/**
 * Integration tests for POST /api/profile and GET /api/profile
 *
 * Strategy:
 * - Build a minimal Express app that matches the real middleware chain without
 *   bootstrapping a real DB connection (the DB is mocked via vi.mock on the
 *   Prisma client singleton).
 * - JWT auth is real (jsonwebtoken) using the test secret already set in
 *   vitest.config.ts: SUPABASE_JWT_SECRET.
 * - Rate-limiter is the real registerLimiter instance (in-memory store) so we
 *   can verify the 429 behaviour by exhausting the 3-request quota.
 *
 * Tests:
 * 1. Valid payload → 201 with all five cat fields
 * 2. Missing Authorization header → 401
 * 3. 4th request within rate-limit window → 429 + Retry-After header
 * 4. Already-consumed session → 400
 * 5. GET /api/profile authenticated → 200 with catName, catBreed (null),
 *    catMarking (null), catSex, catLifeStage
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ─── Mock Prisma before any module that touches it is imported ─────────────
vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    onboardingSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

// ─── Imports that depend on mocked Prisma ─────────────────────────────────
import { prisma } from '../../lib/prisma.js';
import { helmetMiddleware } from '../../middleware/helmet.js';
import { contentTypeMiddleware } from '../../middleware/contentType.js';
import { sanitizerMiddleware } from '../../middleware/sanitizer.js';
import { profileRouter } from '../profile.routes.js';

// ─── Constants ─────────────────────────────────────────────────────────────
const JWT_SECRET = 'super-secret-jwt-key-for-testing-only-do-not-use-in-prod';
const TEST_USER_ID = 'test-user-uuid-1234';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

function makeToken(sub: string = TEST_USER_ID): string {
  return jwt.sign({ sub, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
}

// ─── Minimal test app factory ───────────────────────────────────────────────
// We build a fresh app per test group to avoid rate-limiter state bleed
// between different test suites. The rate-limiter test builds its own app.
function buildApp(): express.Express {
  const app = express();
  app.use(helmetMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(contentTypeMiddleware);
  app.use(sanitizerMiddleware);
  app.use('/api/profile', profileRouter);
  return app;
}

// ─── Valid body factory ─────────────────────────────────────────────────────
function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    displayName: 'Alice',
    onboardingSessionId: SESSION_ID,
    ...overrides,
  };
}

// ─── Mock helpers ──────────────────────────────────────────────────────────

const MOCK_SESSION = {
  id: SESSION_ID,
  step: 6,
  ownerName: 'Alice',
  ownerEmail: 'alice@example.com',
  catsCount: '1',
  customCatsCount: null,
  catName: 'Whiskers',
  catBreed: null,
  catMarking: null,
  catSex: 'Female',
  catLifeStage: 'Adult',
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_PROFILE = {
  id: 'profile-id-abc',
  supabaseUserId: TEST_USER_ID,
  displayName: 'Alice',
  catName: 'Whiskers',
  catBreed: null,
  catMarking: null,
  catSex: 'Female',
  catLifeStage: 'Adult',
  createdAt: new Date(),
  updatedAt: new Date(),
};



// ══════════════════════════════════════════════════════════════════════════════
// Suite 1 — POST /api/profile happy path
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/profile — valid payload returns 201 with all cat fields', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.onboardingSession.findUnique).mockResolvedValue(MOCK_SESSION as any);
    vi.mocked(prisma.profile.create).mockResolvedValue(MOCK_PROFILE as any);
    vi.mocked(prisma.onboardingSession.update).mockResolvedValue({ ...MOCK_SESSION, consumedAt: new Date() } as any);
  });

  it('returns 201 and includes all five cat fields in the response body', async () => {
    const token = makeToken();

    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(validBody());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      displayName: 'Alice',
      catName: 'Whiskers',
      catSex: 'Female',
      catLifeStage: 'Adult',
    });
    // catBreed and catMarking may be null — verify they are explicitly present
    expect(Object.prototype.hasOwnProperty.call(res.body, 'catBreed')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(res.body, 'catMarking')).toBe(true);
    expect(res.body.catBreed).toBeNull();
    expect(res.body.catMarking).toBeNull();
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('catName');
    expect(res.body).toHaveProperty('catSex');
    expect(res.body).toHaveProperty('catLifeStage');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Suite 2 — Missing Authorization → 401
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/profile — missing Authorization header returns 401', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  it('returns 401 when Authorization header is absent', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Content-Type', 'application/json')
      .send(validBody());

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when Authorization header has invalid format', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', 'InvalidScheme token')
      .set('Content-Type', 'application/json')
      .send(validBody());

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Suite 3 — Rate limiter: 4th request in the same window → 429 + Retry-After
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/profile — 4th request within rate-limit window returns 429', () => {
  /**
   * We build a dedicated app instance here so the in-memory rate-limit store
   * starts fresh and we can exhaust the 3-request quota cleanly.
   *
   * Note: registerLimiter fires BEFORE authMiddleware in the chain, so we do
   * not need a valid JWT — the limiter will block before auth runs.
   */
  let rateLimitApp: express.Express;

  beforeAll(() => {
    rateLimitApp = buildApp();
  });

  it('returns 429 with Retry-After header on the 4th request from the same IP', async () => {
    const token = makeToken();
    const testIp = '192.168.1.99';
    // Make 3 requests that hit the limiter
    for (let i = 0; i < 3; i++) {
      await request(rateLimitApp)
        .post('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Real-IP', testIp)
        .set('Content-Type', 'application/json')
        .send(validBody());
    }

    // 4th request should be rate-limited
    const res = await request(rateLimitApp)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Real-IP', testIp)
      .set('Content-Type', 'application/json')
      .send(validBody());

    expect(res.status).toBe(429);
    // Retry-After header must be present (draft-7 standardHeaders)
    const retryAfter = res.headers['retry-after'] ?? res.headers['Retry-After'];
    expect(retryAfter).toBeDefined();
    expect(res.body).toHaveProperty('error');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Suite 4 — Already-consumed session → 400
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/profile — already-consumed onboardingSessionId returns 400', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when the onboarding session is already consumed', async () => {
    const token = makeToken();

    // Session exists but consumedAt is set
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.onboardingSession.findUnique).mockResolvedValue({
      ...MOCK_SESSION,
      consumedAt: new Date('2024-01-01T00:00:00.000Z'),
    } as any);

    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(validBody());

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Invalid or missing onboardingSessionId/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Suite 5 — GET /api/profile authenticated → 200 with cat fields
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /api/profile — authenticated returns 200 with all cat fields', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // findUnique is used by both profile lookup paths; return the profile for GET
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(MOCK_PROFILE as any);
  });

  it('returns 200 with catName, catBreed (null), catMarking (null), catSex, catLifeStage', async () => {
    const token = makeToken();

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // All five cat fields must be present
    expect(res.body).toHaveProperty('catName', 'Whiskers');
    expect(res.body).toHaveProperty('catSex', 'Female');
    expect(res.body).toHaveProperty('catLifeStage', 'Adult');

    // Optional fields must be explicitly present (not omitted), with null values
    expect(Object.prototype.hasOwnProperty.call(res.body, 'catBreed')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(res.body, 'catMarking')).toBe(true);
    expect(res.body.catBreed).toBeNull();
    expect(res.body.catMarking).toBeNull();

    // Standard profile fields
    expect(res.body).toHaveProperty('displayName', 'Alice');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 401 when Authorization header is missing on GET', async () => {
    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
