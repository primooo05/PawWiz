import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { contentTypeMiddleware } from '../contentType.js';
import type { Request, Response, NextFunction } from 'express';

describe('ContentType Middleware', () => {
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

  it('should reject mutation methods with 415 when Content-Type is not application/json', async () => {
    const methods = fc.constantFrom('POST', 'PUT', 'PATCH');
    
    await fc.assert(
      fc.asyncProperty(methods, async (method) => {
        mockReq = {
          method,
          is: vi.fn().mockReturnValue(false)
        };

        contentTypeMiddleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(415);
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should allow mutation methods when Content-Type is application/json', () => {
    mockReq = { method: 'POST', is: vi.fn().mockReturnValue(true) };
    contentTypeMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow GET requests regardless of Content-Type', () => {
    mockReq = { method: 'GET' };
    contentTypeMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
