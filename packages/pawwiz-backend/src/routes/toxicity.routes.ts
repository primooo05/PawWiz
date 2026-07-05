/**
 * Chain of Responsibility (Middleware Pattern)
 * Plant toxicity routes — text search and image scan.
 * Auth is optional: sets req.user if a valid Bearer token is present, does NOT 401 if absent.
 */

import multer from 'multer';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { search, scan } from '../controllers/toxicity.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { contentTypeMiddleware } from '../middleware/contentType.js';
import { searchLimiter, scanRateLimiter } from '../middleware/rateLimiter.js';
import {
  toxicitySearchSchema,
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
} from '../schemas/index.js';
import { AppError } from '../utils/errors.js';

// ── Optional auth middleware ────────────────────────────────────────────────────
// Passes through unauthenticated requests; delegates to authMiddleware when a
// Bearer token is present (authMiddleware will 401 on an invalid token).
const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token present — skip auth entirely, continue
    return next();
  }
  // Token present — run the real auth middleware (will 401 if invalid)
  authMiddleware(req, res, next);
};

// ── Multer setup ───────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if ((IMAGE_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Invalid file type. Only JPEG and PNG images are accepted.',
          400,
        ) as unknown as Error,
      );
    }
  },
});

// ── Router ─────────────────────────────────────────────────────────────────────
const toxicityRouter = Router();

// POST /api/toxicity/search
// Resolves plant toxicity by text query. Content-Type: application/json required.
toxicityRouter.post(
  '/search',
  optionalAuth,
  searchLimiter,
  contentTypeMiddleware,
  validate(toxicitySearchSchema),
  search,
);

// POST /api/toxicity/scan
// Resolves plant toxicity from an uploaded image. Content-Type: multipart/form-data.
// Note: contentTypeMiddleware is intentionally omitted — multer handles multipart parsing.
toxicityRouter.post('/scan', optionalAuth, scanRateLimiter, upload.single('image'), scan);

export { toxicityRouter };
