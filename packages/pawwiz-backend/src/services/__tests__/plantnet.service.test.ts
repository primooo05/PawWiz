// Feature: plant-toxicity-scanner — PlantNet identification service
//
// Covers: mock fallback when PLANTNET_API_KEY is absent, successful identification
// mapping, empty results handling, and property that confidence is always [0,1].
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

vi.mock('../../repositories/plantnet.repository.js', () => ({
  plantNetRepository: { identify: vi.fn() },
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { plantnetService } from '../plantnet.service.js';
import { plantNetRepository } from '../../repositories/plantnet.repository.js';

const repo = plantNetRepository as unknown as { identify: ReturnType<typeof vi.fn> };

let originalEnv: string | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  originalEnv = process.env.PLANTNET_API_KEY;
});

afterEach(() => {
  if (originalEnv !== undefined) {
    process.env.PLANTNET_API_KEY = originalEnv;
  } else {
    delete process.env.PLANTNET_API_KEY;
  }
});

describe('PlantNetService — mock fallback', () => {
  it('returns deterministic mock when PLANTNET_API_KEY is absent', async () => {
    delete process.env.PLANTNET_API_KEY;
    const r = await plantnetService.identify(Buffer.from('fake'), 'image/jpeg');
    expect(r.scientificName).toBe('Spathiphyllum wallisii');
    expect(r.confidence).toBe(0.94);
    expect(repo.identify).not.toHaveBeenCalled();
  });
});

describe('PlantNetService — live path (with API key)', () => {
  beforeEach(() => {
    process.env.PLANTNET_API_KEY = 'test-key';
  });

  it('maps the top result to { scientificName, confidence }', async () => {
    repo.identify.mockResolvedValueOnce({
      results: [
        { species: { scientificName: 'Rosa canina' }, score: 0.87 },
        { species: { scientificName: 'Rosa gallica' }, score: 0.12 },
      ],
    });
    const r = await plantnetService.identify(Buffer.from('img'), 'image/png');
    expect(r.scientificName).toBe('Rosa canina');
    expect(r.confidence).toBe(0.87);
  });

  it('returns null scientificName with confidence 0 when results are empty', async () => {
    repo.identify.mockResolvedValueOnce({ results: [] });
    const r = await plantnetService.identify(Buffer.from('img'), 'image/jpeg');
    expect(r.scientificName).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it('handles undefined results array gracefully', async () => {
    repo.identify.mockResolvedValueOnce({});
    const r = await plantnetService.identify(Buffer.from('img'), 'image/jpeg');
    expect(r.scientificName).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it('Property: confidence is always a finite number in [0,1]', async () => {
    await fc.assert(
      fc.asyncProperty(fc.double({ min: 0, max: 1, noNaN: true }), async (score) => {
        repo.identify.mockResolvedValueOnce({
          results: [{ species: { scientificName: 'Test' }, score }],
        });
        const r = await plantnetService.identify(Buffer.from('x'), 'image/jpeg');
        expect(r.confidence).toBeGreaterThanOrEqual(0);
        expect(r.confidence).toBeLessThanOrEqual(1);
        expect(Number.isFinite(r.confidence)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
