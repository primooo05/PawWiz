import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/winston.js';

export const turnstileMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.body?.['cf-turnstile-response'];
  
  if (!token) {
    res.status(403).json({ error: 'Turnstile token missing' });
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    logger.error('TURNSTILE_SECRET_KEY is not configured');
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await result.json();
    
    if (!data.success) {
      res.status(403).json({ error: 'Turnstile verification failed', codes: data['error-codes'] });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error verifying turnstile token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
