// Feature: plant-toxicity-caching, Property 7: Rate limit monotonicity
/**
 * Validates: Requirements 5.7, 8.1, 8.2, 8.3, 8.4
 *
 * Property 7: For any sequence of N authenticated requests to either pipeline
 * where N ≤ the applicable limit, each response SHALL have `RateLimit-Remaining`
 * equal to `(limit - requestIndex)`. The (N+1)th request SHALL return HTTP 429
 * with `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and
 * `Retry-After` headers present.
 *
 * express-rate-limit with standardHeaders: 'draft-7' emits a single structured
 * `ratelimit` header: "limit=<n>, remaining=<n>, reset=<n>"
 * On 429 it additionally emits `retry-after` and `ratelimit-policy`.
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';
import type { Options } from 'express-rate-limit';

// ── draft-7 structured header parser ─────────────────────────────────────────

/**
 * Parses the RFC-style structured `ratelimit` header value emitted by
 * express-rate-limit with `standardHeaders: 'draft-7'`.
 *
 * Example value: "limit=5, remaining=4, reset=60"
 */
function parseDraft7Header(value: string | undefined): Record<string, number> {
  if (!value) return {};
  return Object.fromEntries(
    value.split(',').map((pair) => {
      const [k, v] = pair.trim().split('=');
      return [k.trim(), parseInt(v.trim(), 10)];
    }),
  );
}

// ── Limiter factory functions (fresh instance per test run) ───────────────────

function createScanLimiter() {
  return rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => (req as any).user?.sub ?? 'unknown',
    message: 'Daily scan limit reached. Try again tomorrow or use text search instead.',
    handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
      res.status(options.statusCode).json({ error: options.message });
    },
  });
}

function createScanIpLimiter() {
  return rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) =>
      (req.headers['x-real-ip'] as string) || req.ip || 'unknown',
    message: 'Daily scan limit reached. Try again tomorrow or use text search instead.',
    handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
      res.status(options.statusCode).json({ error: options.message });
    },
  });
}

function createSearchLimiter() {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => (req as any).user?.sub ?? 'unknown',
    message: 'Search rate limit reached. Please wait before searching again.',
    handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
      res.status(options.statusCode).json({ error: options.message });
    },
  });
}

// ── App factory — fresh Express app per property run ──────────────────────────

function makeAuthApp(limiter: ReturnType<typeof rateLimit>, sub = 'test-user') {
  const app = express();
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    (_req as any).user = { sub };
    next();
  });
  app.get('/test', limiter, (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  return app;
}

function makeIpApp(limiter: ReturnType<typeof rateLimit>) {
  const app = express();
  // No user injection — uses req.ip as key
  app.get('/test', limiter, (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  return app;
}

// ── Shared assertion helper ───────────────────────────────────────────────────

/**
 * Fires `n` sequential requests and verifies `ratelimit` structured header
 * `remaining` decrements correctly. Then exhausts the remaining quota and
 * fires one over-limit request to verify HTTP 429 with all required indicators.
 *
 * With draft-7, the library emits:
 *   ratelimit: "limit=<L>, remaining=<R>, reset=<T>"
 *   retry-after: <seconds>    (on 429 only)
 *   ratelimit-policy: "<L>;w=<W>"
 */
async function assertMonotonicity(
  app: ReturnType<typeof express>,
  n: number,
  limit: number,
) {
  // Fire n requests — verify monotonic decrement in each `ratelimit` header
  for (let i = 0; i < n; i++) {
    const res = await request(app).get('/test');
    const parsed = parseDraft7Header(res.headers['ratelimit'] as string | undefined);
    const remaining = parsed['remaining'] ?? -1;
    const expectedRemaining = limit - (i + 1);

    if (remaining !== expectedRemaining) {
      throw new Error(
        `Request ${i + 1}: expected ratelimit remaining=${expectedRemaining}, got ${remaining} ` +
          `(raw header: "${res.headers['ratelimit']}")`,
      );
    }
    if (parsed['limit'] !== limit) {
      throw new Error(
        `Request ${i + 1}: expected ratelimit limit=${limit}, got ${parsed['limit']}`,
      );
    }
  }

  // Exhaust any remaining quota
  for (let j = n; j < limit; j++) {
    await request(app).get('/test');
  }

  // The (limit+1)th request must be 429 with required headers
  const over = await request(app).get('/test');

  if (over.status !== 429) {
    throw new Error(`Expected HTTP 429 on over-limit request, got ${over.status}`);
  }

  // draft-7: `ratelimit` header encodes limit, remaining, and reset as one structured field
  const overParsed = parseDraft7Header(over.headers['ratelimit'] as string | undefined);

  if (!('limit' in overParsed)) {
    throw new Error(
      `Missing ratelimit limit field on 429 response (header: "${over.headers['ratelimit']}")`,
    );
  }
  if (!('remaining' in overParsed)) {
    throw new Error(
      `Missing ratelimit remaining field on 429 response (header: "${over.headers['ratelimit']}")`,
    );
  }
  if (!('reset' in overParsed)) {
    throw new Error(
      `Missing ratelimit reset field on 429 response (header: "${over.headers['ratelimit']}")`,
    );
  }
  if (!over.headers['retry-after']) {
    throw new Error('Missing retry-after header on 429 response');
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Rate Limiter — Property 7: Rate limit monotonicity', () => {

  describe('scanLimiter (authenticated, limit=20)', () => {
    it('decrements ratelimit remaining by 1 per request and returns 429 on limit+1', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 20 }), async (n) => {
          const limiter = createScanLimiter();
          const app = makeAuthApp(limiter);
          await assertMonotonicity(app, n, 20);
        }),
        { numRuns: 10 },
      );
    });
  });

  describe('scanIpLimiter (unauthenticated / IP-keyed, limit=5)', () => {
    it('decrements ratelimit remaining by 1 per request and returns 429 on limit+1', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 5 }), async (n) => {
          const limiter = createScanIpLimiter();
          const app = makeIpApp(limiter);
          await assertMonotonicity(app, n, 5);
        }),
        { numRuns: 10 },
      );
    });
  });

  describe('searchLimiter (authenticated, limit=60)', () => {
    it('decrements ratelimit remaining by 1 per request and returns 429 on limit+1', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 60 }), async (n) => {
          const limiter = createSearchLimiter();
          const app = makeAuthApp(limiter);
          await assertMonotonicity(app, n, 60);
        }),
        { numRuns: 10 },
      );
    });
  });
});
