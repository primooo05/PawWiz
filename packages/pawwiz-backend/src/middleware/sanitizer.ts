import { Request, Response, NextFunction } from 'express';

export function stripHtmlTags(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return stripHtmlTags(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = sanitizeObject(value);
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
