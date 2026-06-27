import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { corsMiddleware } from '../cors.js';
import type { Request, Response, NextFunction } from 'express';

describe('CORS Middleware', () => {
  const TEST_ORIGIN = 'http://localhost:5173';

  beforeEach(() => {
    vi.stubEnv('FRONTEND_ORIGIN', TEST_ORIGIN);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should omit access-control-allow-origin header for disallowed origins', async () => {
    const disallowedOrigins = fc.webUrl().filter(url => url !== TEST_ORIGIN);

    await fc.assert(
      fc.asyncProperty(disallowedOrigins, async (origin) => {
        const headers: Record<string, string> = {};
        const mockReq = { headers: { origin } } as Partial<Request>;
        const mockRes = {
          getHeader: vi.fn((key: string) => headers[key.toLowerCase()]),
          setHeader: vi.fn((key: string, val: string) => {
            headers[key.toLowerCase()] = val;
            return mockRes;
          }),
        } as unknown as Response;
        const mockNext = vi.fn();

        corsMiddleware(mockReq as Request, mockRes, mockNext);
        
        const allowed = headers['access-control-allow-origin'];
        expect(allowed).not.toBe(origin);
        expect(allowed).not.toBe('*');
        expect(mockNext).toHaveBeenCalled();
      })
    );
  });

  it('should set access-control-allow-origin header when origin matches FRONTEND_ORIGIN', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(TEST_ORIGIN), async (origin) => {
        const headers: Record<string, string> = {};
        const mockReq = { headers: { origin } } as Partial<Request>;
        const mockRes = {
          getHeader: vi.fn((key: string) => headers[key.toLowerCase()]),
          setHeader: vi.fn((key: string, val: string) => {
            headers[key.toLowerCase()] = val;
            return mockRes;
          }),
        } as unknown as Response;
        const mockNext = vi.fn();

        corsMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(headers['access-control-allow-origin']).toBe(TEST_ORIGIN);
        expect(mockNext).toHaveBeenCalled();
      })
    );
  });
});
