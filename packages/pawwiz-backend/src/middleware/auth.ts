import jwt from 'jsonwebtoken';
import * as jose from 'jose';
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

// Supabase issues tokens with issuer `${SUPABASE_URL}/auth/v1` and audience
// `authenticated`. Validating these claims closes the door on tokens minted
// for other projects/audiences being replayed against this API.
const EXPECTED_ISSUER = supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;
const EXPECTED_AUDIENCE = 'authenticated';

const verifyOptions = (algorithms: jwt.Algorithm[]): jwt.VerifyOptions => ({
  algorithms,
  audience: EXPECTED_AUDIENCE,
  ...(EXPECTED_ISSUER ? { issuer: EXPECTED_ISSUER } : {}),
});

const JWKS = supabaseUrl
  ? jose.createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
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

    let decodedSub: string | undefined;
    let decodedEmail: string | undefined;
    let decodedRole: string | undefined;

    if (alg === 'ES256') {
      if (!JWKS) {
        throw new Error('JWKS client is not initialized (SUPABASE_URL is missing)');
      }
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: EXPECTED_ISSUER,
        audience: EXPECTED_AUDIENCE,
      });
      decodedSub = payload.sub;
      decodedEmail = payload.email as string | undefined;
      decodedRole = payload.role as string | undefined;
    } else {
      // Fallback to legacy symmetric HS256
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        throw new Error('SUPABASE_JWT_SECRET is not configured');
      }
      const secretBuffer = Buffer.from(secret, 'base64');
      const decoded = jwt.verify(token, secretBuffer, verifyOptions(['HS256'])) as jwt.JwtPayload;
      decodedSub = decoded.sub;
      decodedEmail = decoded.email;
      decodedRole = decoded.role;
    }

    if (!decodedSub) {
      res.status(401).json({ error: 'Unauthorized - Missing sub in token' });
      return;
    }

    req.user = {
      sub: decodedSub,
      email: decodedEmail,
      role: decodedRole,
    };
    next();
  } catch (error) {
    logger.error('JWT verify failed', { error: (error as Error).message });
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
