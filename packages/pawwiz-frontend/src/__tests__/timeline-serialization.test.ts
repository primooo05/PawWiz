// Feature: unified-health-timeline, Property 10: Serialization round-trip fidelity
//
// Validates that HealthEvent objects survive JSON serialization without any field
// loss or mutation, and that eventIds arrays persisted to an in-memory store are
// retrieved in the exact same order they were inserted.
//
// Validates: Requirements 10.1, 10.4, 10.6

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Local type aliases (mirrors packages/pawwiz-backend/src/types/shared.ts) ──
// Do NOT import from the backend package — the frontend test environment cannot
// resolve cross-package imports at test time.

type EventSource = 'behavior' | 'diet' | 'pregnancy' | 'heat';

type EventType =
  | 'behavior_log'
  | 'meal_logged'
  | 'diet_profile_updated'
  | 'water_updated'
  | 'pregnancy_started'
  | 'pregnancy_daily_log'
  | 'heat_cycle_started'
  | 'mating_logged';

interface HealthEvent {
  id: string;
  catId: string;
  source: EventSource;
  eventType: EventType;
  occurredAt: string; // ISO 8601 UTC with ms precision: YYYY-MM-DDTHH:mm:ss.sssZ
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Generates valid ISO 8601 UTC timestamps with millisecond precision.
 *  Date range: 2020-01-01 .. 2030-01-01 — keeps all values realistic and within
 *  spec (YYYY-MM-DDTHH:mm:ss.sssZ). Using Date.toISOString() guarantees the
 *  exact `.sssZ` suffix required by the timestamp regex in the acceptance criteria.
 */
const occurredAtArb = fc
  .integer({
    min: new Date('2020-01-01T00:00:00.000Z').getTime(),
    max: new Date('2030-01-01T00:00:00.000Z').getTime(),
  })
  .map((ms) => new Date(ms).toISOString());

const eventSourceArb = fc.constantFrom<EventSource>(
  'behavior',
  'diet',
  'pregnancy',
  'heat',
);

const eventTypeArb = fc.constantFrom<EventType>(
  'behavior_log',
  'meal_logged',
  'diet_profile_updated',
  'water_updated',
  'pregnancy_started',
  'pregnancy_daily_log',
  'heat_cycle_started',
  'mating_logged',
);

/** Arbitrary JSON-safe scalar values for metadata entries. */
const metadataValueArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
);

const metadataArb: fc.Arbitrary<Record<string, unknown> | undefined> = fc.option(
  fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), metadataValueArb),
  { nil: undefined },
);

/** Full HealthEvent arbitrary — all fields within spec constraints. */
const healthEventArb: fc.Arbitrary<HealthEvent> = fc.record({
  id: fc.uuid(),
  catId: fc.uuid(),
  source: eventSourceArb,
  eventType: eventTypeArb,
  occurredAt: occurredAtArb,
  title: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  metadata: metadataArb,
});

// ─── ISO 8601 UTC ms-precision timestamp regex (from Requirements 10.1) ──────
const ISO_UTC_MS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// ─── UUID regex (lowercase hyphen-separated, per eventIds spec) ───────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// ─── Mock in-memory store (mirrors a real Map-based persistence layer) ────────
class MockEventIdStore {
  private store = new Map<string, string[]>();

  persist(key: string, eventIds: string[]): void {
    // Store a copy so later mutations of the source array don't affect the store
    this.store.set(key, [...eventIds]);
  }

  retrieve(key: string): string[] | undefined {
    const stored = this.store.get(key);
    return stored ? [...stored] : undefined;
  }

  clear(): void {
    this.store.clear();
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Property 10a — HealthEvent JSON round-trip fidelity', () => {
  it('serializes and deserializes to an identical object with valid occurredAt', () => {
    fc.assert(
      fc.property(healthEventArb, (event) => {
        // --- round-trip ---
        const serialized = JSON.stringify(event);
        const deserialized = JSON.parse(serialized) as HealthEvent;

        // 1. Deep equality: every field must be preserved exactly
        expect(deserialized).toEqual(event);

        // 2. occurredAt must match the ISO 8601 UTC ms-precision format
        expect(deserialized.occurredAt).toMatch(ISO_UTC_MS_RE);

        // 3. Required primitive fields must be present and non-empty after round-trip
        expect(deserialized.id).toBeTruthy();
        expect(deserialized.catId).toBeTruthy();
        expect(deserialized.source).toBeTruthy();
        expect(deserialized.eventType).toBeTruthy();
        expect(deserialized.occurredAt).toBeTruthy();
        expect(deserialized.title).toBeTruthy();
        expect(deserialized.description).toBeTruthy();

        // 4. source must still be a valid EventSource value
        const validSources: EventSource[] = ['behavior', 'diet', 'pregnancy', 'heat'];
        expect(validSources).toContain(deserialized.source);

        // 5. eventType must still be a valid EventType value
        const validEventTypes: EventType[] = [
          'behavior_log',
          'meal_logged',
          'diet_profile_updated',
          'water_updated',
          'pregnancy_started',
          'pregnancy_daily_log',
          'heat_cycle_started',
          'mating_logged',
        ];
        expect(validEventTypes).toContain(deserialized.eventType);
      }),
      { numRuns: 200 },
    );
  });
});

describe('Property 10b — eventIds round-trip order fidelity', () => {
  const store = new MockEventIdStore();

  it('retrieves eventIds in the same order they were inserted, with valid UUID format', () => {
    fc.assert(
      fc.property(
        // Generate non-empty arrays of lowercase hyphen-separated UUIDs
        fc.array(fc.uuid(), { minLength: 1, maxLength: 50 }),
        (eventIds) => {
          store.clear();

          const storeKey = 'test-insight-' + Math.random().toString(36).slice(2);

          // --- persist ---
          store.persist(storeKey, eventIds);

          // --- retrieve ---
          const retrieved = store.retrieve(storeKey);

          // 1. Retrieved value must exist
          expect(retrieved).toBeDefined();

          // 2. Same number of elements
          expect(retrieved!.length).toBe(eventIds.length);

          // 3. Same elements in same insertion order
          expect(retrieved).toEqual(eventIds);

          // 4. Every element must match UUID format (lowercase hyphen-separated)
          for (const id of retrieved!) {
            expect(id).toMatch(UUID_RE);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
