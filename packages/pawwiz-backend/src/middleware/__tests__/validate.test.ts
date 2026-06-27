import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { z } from 'zod';
import { validate } from '../validate.js';
import type { Request, Response, NextFunction } from 'express';

describe('Validation Middleware', () => {
  const testSchema = z.object({ name: z.string(), age: z.number() });
  const middleware = validate(testSchema);
  
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

  it('should reject requests with 400 when payload violates schema', async () => {
    const invalidPayloads = fc.record({
      name: fc.oneof(fc.integer(), fc.boolean(), fc.constant(undefined)),
      age: fc.oneof(fc.string(), fc.boolean(), fc.constant(undefined)),
    }, { requiredKeys: [] });

    await fc.assert(
      fc.asyncProperty(invalidPayloads, async (payload) => {
        mockReq = { body: payload };
        middleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(400);
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
        mockReq = { body: { ...base, ...extra } };
        middleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.body).toEqual(base); // Extra fields stripped
      })
    );
  });
});
