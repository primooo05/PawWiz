import { Request, Response, NextFunction } from 'express';

export function stripHtmlTags(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return stripHtmlTags(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Use defineProperty to safely set any key (including __proto__) as an own property
      Object.defineProperty(newObj, key, {
        value: sanitizeObject(value),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return newObj;
  }
  return obj;
}

export const sanitizerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
