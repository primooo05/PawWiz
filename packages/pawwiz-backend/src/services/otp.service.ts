/**
 * OTP Service — generate, hash, and verify 6-digit one-time codes.
 * Uses SHA-256 for deterministic, fast hashing (no bcrypt — OTP is short-lived).
 */

import { randomInt, createHash } from 'node:crypto';

class OtpService {
  /**
   * Generates a cryptographically random 6-digit numeric string.
   * Range: 100000–999999 (always 6 digits, no leading-zero ambiguity in numeric sense).
   */
  generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  /**
   * Produces a hex-encoded SHA-256 hash of the given code.
   */
  hashOtp(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verifies an OTP code against its stored hash and TTL.
   * Returns true only if the hash matches AND the code has not expired.
   */
  verifyOtp(input: string, storedHash: string, expiresAt: Date): boolean {
    if (!input || !storedHash) return false;
    if (Date.now() >= expiresAt.getTime()) return false;
    return this.hashOtp(input) === storedHash;
  }
}

/** Singleton */
export const otpService = new OtpService();
