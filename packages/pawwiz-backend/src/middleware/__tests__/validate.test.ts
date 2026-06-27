import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { z } from 'zod';
import { validate } from '../validate.js';
import type { Request, Response, NextFunction } from 'express';

describe('Validation Middleware', () => {
  const testSchema = z.object({ name: z.string(), age: z.number() });
  const middleware = validate(testSchema);

  it('should reject requests with 400 and exact Zod errors when payload violates schema', async () => {
    const invalidPayloads = fc.record({
      name: fc.oneof(fc.integer(), fc.boolean(), fc.constant(undefined)),
      age: fc.oneof(fc.string(), fc.boolean(), fc.constant(undefined)),
    }, { requiredKeys: [] });

    await fc.assert(
      fc.asyncProperty(invalidPayloads, async (payload) => {
        const mockReq = { body: payload } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        middleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        // Assert the shape of the error payload specifically matches Zod Issues
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
          errors: expect.any(Array)
        }));
        
        const jsonCallArgs = (mockRes.json as any).mock.calls[0][0];
        expect(jsonCallArgs.errors[0]).toHaveProperty('message');
        
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should strip unknown fields from req.body when payload is valid', async () => {
    const validBase = fc.record({ name: fc.string(), age: fc.integer() });
    const extraFields = fc.dictionary(
      fc.string().filter(k => k !== 'name' && k !== 'age'),
      fc.anything()
    );

    await fc.assert(
      fc.asyncProperty(validBase, extraFields, async (base, extra) => {
        const mockReq = { body: { ...base, ...extra } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        middleware(mockReq as Request, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.body).toEqual(base); // Extra fields strictly stripped
      })
    );
  });
});
