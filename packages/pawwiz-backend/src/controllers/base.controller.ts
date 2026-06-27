/**
 * Template Method Pattern — Base Controller
 * Defines the skeleton for request try/catch flow.
 * Centralizes error parsing.
 * Subclass controller methods execute specific logic.
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps an async controller method with standardized error handling.
 * Template Method: the handler executes specific logic, this wrapper
 * provides the skeleton (try/catch, error classification, response formatting).
 */
export function withErrorHandling(handler: AsyncHandler): AsyncHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      // Unexpected error — log and return generic message
      console.error('[Controller] Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
