import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/winston.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replaces body with stripped unknown fields
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', { errors: error.issues, body: req.body });
        res.status(400).json({ errors: error.issues });
      } else {
        next(error);
      }
    }
  };
};
