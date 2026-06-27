import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { corsMiddleware } from '../cors.js';
import type { Request, Response, NextFunction } from 'express';

describe('CORS Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let headers: Record<string, string>;

  beforeEach(() => {
    headers = {};
    mockReq = { headers: {} };
    mockRes = {
      getHeader: vi.fn((key: string) => headers[key.toLowerCase()]),
    } as Partial<Response>;
    
    mockRes.setHeader = vi.fn((key: string, val: string) => {
      headers[key.toLowerCase()] = val;
      return mockRes as Response;
    });
    mockNext = vi.fn();
  });

  it('should omit access-control-allow-origin header for disallowed origins', async () => {
    const disallowedOrigins = fc.webUrl().filter(url => url !== process.env.FRONTEND_ORIGIN);

    await fc.assert(
      fc.asyncProperty(disallowedOrigins, async (origin) => {
        mockReq.headers = { origin };
        
        corsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        
        const allowed = headers['access-control-allow-origin'];
        expect(allowed).not.toBe(origin);
        expect(allowed).not.toBe('*');
      })
    );
  });

  it('should set access-control-allow-origin header when origin matches FRONTEND_ORIGIN', () => {
    mockReq.headers = { origin: process.env.FRONTEND_ORIGIN };
    corsMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(headers['access-control-allow-origin']).toBe(process.env.FRONTEND_ORIGIN);
  });
});
