import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { honeypotMiddleware } from '../honeypot.js';
import type { Request, Response, NextFunction } from 'express';

describe('Honeypot Middleware', () => {
  it('should reject requests with 403 when honeypot field is non-empty', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (honeypotValue) => {
        const mockReq = { body: { website: honeypotValue } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        honeypotMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' });
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should allow requests when honeypot field is missing or empty', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(undefined, ''), async (honeypotValue) => {
        const mockReq = { body: { website: honeypotValue } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        honeypotMiddleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      })
    );
  });
});
