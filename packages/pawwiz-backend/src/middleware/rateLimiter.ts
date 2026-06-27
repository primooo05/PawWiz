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

