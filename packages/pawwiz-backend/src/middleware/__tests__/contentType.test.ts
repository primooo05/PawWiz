import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { contentTypeMiddleware } from '../contentType.js';
import type { Request, Response, NextFunction } from 'express';

describe('ContentType Middleware', () => {
  it('should reject mutation methods with 415 when Content-Type is not application/json', async () => {
    const methods = fc.constantFrom('POST', 'PUT', 'PATCH');
    
    await fc.assert(
      fc.asyncProperty(methods, async (method) => {
        const mockReq = {
          method,
          is: vi.fn().mockReturnValue(false)
        } as unknown as Request;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        contentTypeMiddleware(mockReq, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(415);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unsupported Media Type - application/json required' });
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should allow mutation methods when Content-Type is application/json', async () => {
    const methods = fc.constantFrom('POST', 'PUT', 'PATCH');
    
    await fc.assert(
      fc.asyncProperty(methods, async (method) => {
        const mockReq = { method, is: vi.fn().mockReturnValue(true) } as unknown as Request;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        contentTypeMiddleware(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      })
    );
  });

  it('should allow GET requests regardless of Content-Type', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant('GET'), async (method) => {
        const mockReq = { method } as unknown as Request;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        contentTypeMiddleware(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      })
    );
  });
});
