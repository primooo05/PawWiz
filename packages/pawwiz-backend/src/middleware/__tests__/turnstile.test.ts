//packages\pawwiz-backend\src\middleware\__tests__\turnstile.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { turnstileMiddleware } from '../turnstile.js';
import type { Request, Response, NextFunction } from 'express';

global.fetch = vi.fn();

describe('Turnstile Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should reject requests with 403 when Turnstile token is missing', async () => {
    const mockReq = { body: {} } as Partial<Request>;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn();

    await turnstileMiddleware(mockReq as Request, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Turnstile token missing' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject requests with 403 when Turnstile verification fails', async () => {
    const tokens = fc.string({ minLength: 1 });
    
    await fc.assert(
      fc.asyncProperty(tokens, async (token) => {
        const mockReq = { body: { 'cf-turnstile-response': token } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        vi.mocked(fetch).mockResolvedValueOnce({
          json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] })
        } as any);

        await turnstileMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ 
          error: 'Turnstile verification failed', 
          codes: ['invalid-input-response'] 
        });
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should call next when Turnstile verification succeeds', async () => {
    const tokens = fc.string({ minLength: 1 });
    
    await fc.assert(
      fc.asyncProperty(tokens, async (token) => {
        const mockReq = { body: { 'cf-turnstile-response': token } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        vi.mocked(fetch).mockResolvedValueOnce({
          json: async () => ({ success: true })
        } as any);

        await turnstileMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      })
    );
  });
});
