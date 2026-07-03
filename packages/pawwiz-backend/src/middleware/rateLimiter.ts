import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const keyGenerator = (req: Request) => {
  return (req.headers['x-real-ip'] as string) || req.ip || 'unknown';
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: options.message });
  }
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: options.message });
  }
});

export const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: 'Too many recovery requests. Please wait before trying again.' });
  },
});

// ── Toxicity pipeline rate limiters ────────────────────────────────────────────

const SCAN_429_MESSAGE =
  'Daily scan limit reached. Try again tomorrow or use text search instead.';

/** Authenticated scan limiter: 20 requests per 24 h, keyed on IP. */
export const scanLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    (req.headers['x-real-ip'] as string) || req.ip || 'unknown',
  message: SCAN_429_MESSAGE,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: options.message });
  },
});

/** Unauthenticated scan limiter: 5 requests per 24 h, keyed on IP. */
export const scanIpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    (req.headers['x-real-ip'] as string) || req.ip || 'unknown',
  message: SCAN_429_MESSAGE,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: options.message });
  },
});

/** Text-search limiter: 60 requests per 1 h, keyed on JWT sub claim. */
export const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.sub ?? 'unknown',
  message: 'Search rate limit reached. Please wait before searching again.',
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: options.message });
  },
});

/** Email collision check limiter: 5 requests per 60s per IP — prevents account enumeration. */
export const emailCheckLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
    res.status(options.statusCode).json({ error: 'Too many requests. Please wait before trying again.' });
  },
});

/**
 * Selector middleware for POST /api/toxicity/scan.
 * Delegates to scanLimiter when the request is authenticated (req.user present)
 * and scanIpLimiter otherwise.
 */
export const scanRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    scanLimiter(req, res, next);
  } else {
    scanIpLimiter(req, res, next);
  }
};

