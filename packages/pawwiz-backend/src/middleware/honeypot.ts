import { Request, Response, NextFunction } from 'express';

export const honeypotMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Honeypot field name ('website')
  const honeypotField = req.body?.website;

  if (honeypotField !== undefined && honeypotField !== '') {
    // Non-empty honeypot field indicates a bot
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
};
