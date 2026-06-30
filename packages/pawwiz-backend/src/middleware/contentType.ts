import { Request, Response, NextFunction } from 'express';

export const contentTypeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method;
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      
      // Allow multipart/form-data requests for file uploads (e.g. toxicity scan)
      if (req.is('multipart/form-data')) {
        return next();
      }
      
      if (!req.is('application/json')) {
        res.status(415).json({ error: 'Unsupported Media Type - application/json required' });
        return;
      }
    } catch (error) {
      // req.is throws on malformed content-type headers like ";"
      res.status(415).json({ error: 'Unsupported Media Type - malformed header' });
      return;
    }
  }
  
  next();
};
