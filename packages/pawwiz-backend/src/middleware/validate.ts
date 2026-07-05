import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/winston.js';

export const validate = (schema: ZodSchema, target: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const input = target === 'query' ? req.query : req.body;
      const parsed = schema.parse(input);
      if (target === 'query') {
        // Express 5 makes req.query a getter-only property on the prototype.
        // Store the validated+coerced values in a custom property instead so
        // controllers can access them via req.validatedQuery.
        (req as any).validatedQuery = parsed;
      } else {
        req.body = parsed; // Replaces body with stripped unknown fields
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', { errors: error.issues, [target]: target === 'query' ? req.query : req.body });
        res.status(400).json({ errors: error.issues });
      } else {
        next(error);
      }
    }
  };
};
