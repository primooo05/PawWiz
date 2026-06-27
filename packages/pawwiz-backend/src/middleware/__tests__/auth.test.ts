import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../auth.js';
import type { Request, Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('should populate req.user and call next when provided a valid JWT', async () => {
    const validSubs = fc.uuid();
    const testSecret = process.env.SUPABASE_JWT_SECRET as string;
    
    await fc.assert(
      fc.asyncProperty(validSubs, async (sub) => {
        const token = jwt.sign({ sub, email: 'test@example.com' }, testSecret, { expiresIn: '1h' });
        mockReq = { headers: { authorization: `Bearer ${token}` } };
        
        authMiddleware(mockReq as Request, mockRes as Response, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user?.sub).toBe(sub);
      })
    );
  });

  it('should reject with 401 when token is invalid or missing', async () => {
    const invalidTokens = fc.string();
    
    await fc.assert(
      fc.asyncProperty(invalidTokens, async (token) => {
        mockReq = { headers: { authorization: `Bearer ${token}` } };
        authMiddleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
      })
    );
  });

  it('should reject with 401 when Authorization header is missing', () => {
    mockReq = { headers: {} };
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
