// Feature: cross-cutting precondition guards (used by every service layer)
//
// Guards are the single choke point that converts missing/invalid data into
// well-typed AppErrors with correct HTTP status codes. Weak tests here would let
// a mutated status code (404→500) or an inverted null check ship silently, so
// these assertions pin the exact thrown type, status code, and message.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { assertDefined, assertNonEmpty, assertNoDuplicate } from '../guards.js';
import { AppError } from '../errors.js';

describe('assertDefined', () => {
  it('throws AppError(404) by default for null', () => {
    try {
      assertDefined(null, 'Cat not found');
      expect.unreachable('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).statusCode).toBe(404);
      expect((e as AppError).message).toBe('Cat not found');
    }
  });

  it('throws for undefined too', () => {
    expect(() => assertDefined(undefined, 'missing')).toThrow(AppError);
  });

  it('honors a custom status code', () => {
    try {
      assertDefined(null, 'forbidden thing', 403);
      expect.unreachable();
    } catch (e) {
      expect((e as AppError).statusCode).toBe(403);
    }
  });

  it('does NOT throw for falsy-but-defined values (0, empty string, false)', () => {
    expect(() => assertDefined(0, 'x')).not.toThrow();
    expect(() => assertDefined('', 'x')).not.toThrow();
    expect(() => assertDefined(false, 'x')).not.toThrow();
    expect(() => assertDefined(NaN, 'x')).not.toThrow();
  });

  it('Property: throws for null/undefined, passes for every other value', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        if (value === null || value === undefined) {
          expect(() => assertDefined(value, 'msg')).toThrow(AppError);
        } else {
          expect(() => assertDefined(value, 'msg')).not.toThrow();
        }
      }),
      { numRuns: 300 }
    );
  });
});

describe('assertNonEmpty', () => {
  it('throws AppError(400) for undefined, empty, or whitespace-only strings', () => {
    for (const bad of [undefined, '', '   ', '\t\n']) {
      try {
        assertNonEmpty(bad, 'name');
        expect.unreachable(`should have thrown for ${JSON.stringify(bad)}`);
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).statusCode).toBe(400);
        expect((e as AppError).message).toContain('name');
      }
    }
  });

  it('passes for any string with non-whitespace content', () => {
    for (const ok of ['a', ' padded ', 'Whiskers', '0']) {
      expect(() => assertNonEmpty(ok, 'name')).not.toThrow();
    }
  });

  it('Property: throws iff the trimmed string is empty', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        if (s.trim().length === 0) {
          expect(() => assertNonEmpty(s, 'field')).toThrow(AppError);
        } else {
          expect(() => assertNonEmpty(s, 'field')).not.toThrow();
        }
      }),
      { numRuns: 200 }
    );
  });
});

describe('assertNoDuplicate', () => {
  it('throws AppError(409) when an existing record is supplied', () => {
    try {
      assertNoDuplicate({ id: 1 }, 'Email already registered');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).statusCode).toBe(409);
      expect((e as AppError).message).toBe('Email already registered');
    }
  });

  it('does nothing for null/undefined/falsy "existing"', () => {
    expect(() => assertNoDuplicate(null, 'dup')).not.toThrow();
    expect(() => assertNoDuplicate(undefined, 'dup')).not.toThrow();
    expect(() => assertNoDuplicate(0, 'dup')).not.toThrow();
    expect(() => assertNoDuplicate('', 'dup')).not.toThrow();
  });

  it('Property: throws for any truthy existing value, passes for any falsy one', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        if (value) {
          expect(() => assertNoDuplicate(value, 'dup')).toThrow(AppError);
        } else {
          expect(() => assertNoDuplicate(value, 'dup')).not.toThrow();
        }
      }),
      { numRuns: 300 }
    );
  });
});
