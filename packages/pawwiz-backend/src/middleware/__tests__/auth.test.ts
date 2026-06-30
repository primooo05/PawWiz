import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../auth.js';
import type { Request, Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
  const TEST_SECRET_RAW = 'test-secret';
  const TEST_SECRET = Buffer.from(TEST_SECRET_RAW).toString('base64');

  beforeEach(() => {
    vi.stubEnv('SUPABASE_JWT_SECRET', TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should populate req.user and call next when provided a valid JWT', async () => {
    const validSubs = fc.uuid();
    
    await fc.assert(
      fc.asyncProperty(validSubs, async (sub) => {
        const token = jwt.sign({ sub, email: 'test@example.com' }, Buffer.from(TEST_SECRET_RAW), { algorithm: 'HS256', expiresIn: '1h' });
        const mockReq = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();
        
        authMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user?.sub).toBe(sub);
      })
    );
  });

  it('should reject with 401 when token is invalid or tampered', async () => {
    const invalidTokens = fc.string();
    
    await fc.assert(
      fc.asyncProperty(invalidTokens, async (token) => {
        const mockReq = { headers: { authorization: `Bearer ${token}` } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        authMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized - Invalid token' });
      })
    );
  });

  it('should reject with 401 when Authorization header is missing', () => {
    const mockReq = { headers: {} } as Partial<Request>;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn();

    authMiddleware(mockReq as Request, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized - Missing or invalid token format' });
  });
});
