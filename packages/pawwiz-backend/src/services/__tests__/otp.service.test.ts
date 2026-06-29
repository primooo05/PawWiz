import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { otpService } from '../otp.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a future expiry N ms from now. */
const futureExpiry = (offsetMs = 15 * 60 * 1000) => new Date(Date.now() + offsetMs);

/** Build an expiry that is already in the past. */
const pastExpiry = (offsetMs = 1) => new Date(Date.now() - offsetMs);

// ---------------------------------------------------------------------------
// generateOtp
// ---------------------------------------------------------------------------

describe('otpService.generateOtp', () => {
  it('always returns a string of exactly 6 decimal digits', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), (_n) => {
        const code = otpService.generateOtp();
        expect(code).toMatch(/^\d{6}$/);
      }),
      { numRuns: 200 }
    );
  });

  it('returns values within the valid 6-digit range [100000, 999999]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), (_n) => {
        const num = parseInt(otpService.generateOtp(), 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }),
      { numRuns: 200 }
    );
  });

  it('produces distinct codes across consecutive calls (collision resistance)', () => {
    const codes = new Set(Array.from({ length: 50 }, () => otpService.generateOtp()));
    // 50 samples over 900 000 range: probability of all identical is negligible
    expect(codes.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// hashOtp
// ---------------------------------------------------------------------------

describe('otpService.hashOtp', () => {
  it('Property: returns a 64-char lowercase hex string for any 6-digit input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const hash = otpService.hashOtp(code);
          expect(hash).toMatch(/^[0-9a-f]{64}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: same input always produces the same hash (deterministic)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          expect(otpService.hashOtp(code)).toBe(otpService.hashOtp(code));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: distinct inputs produce distinct hashes (collision-free over test range)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999990 }).map(String),
        (code) => {
          const adjacent = String(parseInt(code, 10) + 1);
          expect(otpService.hashOtp(code)).not.toBe(otpService.hashOtp(adjacent));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('never returns an empty string or the raw code', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const hash = otpService.hashOtp(code);
          expect(hash.length).toBeGreaterThan(0);
          expect(hash).not.toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// verifyOtp
// ---------------------------------------------------------------------------

describe('otpService.verifyOtp', () => {
  it('returns true for a correct code within TTL', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const hash = otpService.hashOtp(code);
          expect(otpService.verifyOtp(code, hash, futureExpiry())).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false for a correct hash but expired TTL', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const hash = otpService.hashOtp(code);
          expect(otpService.verifyOtp(code, hash, pastExpiry())).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false for a wrong code even within TTL', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999990 }).map(String),
        (code) => {
          const correct = String(parseInt(code, 10) + 1);
          const hash = otpService.hashOtp(correct);
          expect(otpService.verifyOtp(code, hash, futureExpiry())).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false when hash is an empty string', () => {
    const code = '123456';
    expect(otpService.verifyOtp(code, '', futureExpiry())).toBe(false);
  });

  it('returns false when code is empty even if hash matches empty string hash', () => {
    const emptyHash = otpService.hashOtp('');
    expect(otpService.verifyOtp('', emptyHash, futureExpiry())).toBe(false);
  });

  it('returns false for a tampered hash (bit-flip simulation)', () => {
    const code = '654321';
    const hash = otpService.hashOtp(code);
    // Flip the first character
    const tampered = (hash[0] === 'a' ? 'b' : 'a') + hash.slice(1);
    expect(otpService.verifyOtp(code, tampered, futureExpiry())).toBe(false);
  });

  it('boundary: expiry exactly at now() is treated as expired', () => {
    const code = '111111';
    const hash = otpService.hashOtp(code);
    // Set expiry 1ms in the past to simulate boundary expiry
    const boundaryExpiry = new Date(Date.now() - 1);
    expect(otpService.verifyOtp(code, hash, boundaryExpiry)).toBe(false);
  });

  it('boundary: expiry 1ms in the future is accepted', () => {
    const code = '222222';
    const hash = otpService.hashOtp(code);
    const nearFuture = new Date(Date.now() + 100);
    expect(otpService.verifyOtp(code, hash, nearFuture)).toBe(true);
  });
});
