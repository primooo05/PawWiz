import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/winston.js';

export interface AuthUser {
  sub: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL || '';

const client = supabaseUrl
  ? jwksClient({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    })
  : null;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized - Missing or invalid token format' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedHeader = jwt.decode(token, { complete: true }) as jwt.JwtPayload | null;
    const alg = decodedHeader?.header?.alg;

    let decoded: jwt.JwtPayload;

    if (alg === 'ES256') {
      if (!client) {
        throw new Error('JWKS client is not initialized (SUPABASE_URL is missing)');
      }
      const kid = decodedHeader?.header?.kid;
      if (!kid) {
        throw new Error('Missing kid in token header');
      }
      const key = await new Promise<string>((resolve, reject) => {
        client.getSigningKey(kid, (err, key) => {
          if (err) {
            reject(err);
          } else if (!key) {
            reject(new Error('Signing key not found'));
          } else {
            resolve(key.getPublicKey());
          }
        });
      });
      decoded = jwt.verify(token, key, { algorithms: ['ES256'] }) as jwt.JwtPayload;
    } else {
      // Fallback to legacy symmetric HS256
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        throw new Error('SUPABASE_JWT_SECRET is not configured');
      }
      const secretBuffer = Buffer.from(secret, 'base64');
      decoded = jwt.verify(token, secretBuffer, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    }

    if (!decoded.sub) {
      res.status(401).json({ error: 'Unauthorized - Missing sub in token' });
      return;
    }

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.error('JWT verify failed', { error: (error as Error).message });
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
