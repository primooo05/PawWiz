/**
 * Guard Pattern — Precondition assertions
 * Throw early operational errors if checks fail.
 * Prevents deep nested if-else blocks in services.
 */

import { AppError } from './errors.js';

/**
 * Assert a condition is truthy, or throw AppError.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string,
  statusCode = 404
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError(message, statusCode);
  }
}

/**
 * Assert a string is non-empty.
 */
export function assertNonEmpty(value: string | undefined, fieldName: string): asserts value is string {
  if (!value || value.trim().length === 0) {
    throw AppError.badRequest(`${fieldName} must not be empty`);
  }
}

/**
 * Assert no duplicate exists (for unique constraints).
 */
export function assertNoDuplicate(existing: unknown, message: string): void {
  if (existing) {
    throw AppError.conflict(message);
  }
}
