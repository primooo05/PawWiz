import { Request, Response, NextFunction } from 'express';

export const contentTypeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method;
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Unsupported Media Type - application/json required' });
      return;
    }
  }
  
  next();
};
