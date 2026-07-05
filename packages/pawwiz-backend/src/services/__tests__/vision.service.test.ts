// Feature: plant-toxicity-scanner — vision identification pipeline
//
// Covers: text-based lookup (ASPCA hit → TOXIC/SAFE), image-based path
// (Gemini Vision → ASPCA cross-reference vs fallback UNKNOWN), mock fallback
// when Gemini is unavailable, low-confidence warning flag, and error handling
// when neither input is provided.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { visionService } from '../vision.service.js';
import { AppError } from '../../utils/errors.js';

vi.mock('../../repositories/gemini.repository.js', () => ({
  geminiClient: { isAvailable: true, generateVision: vi.fn() },
}));
vi.mock('../../repositories/aspca.repository.js', () => ({
  aspcaRepository: { findByFuzzyMatch: vi.fn() },
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { geminiClient } from '../../repositories/gemini.repository.js';
import { aspcaRepository } from '../../repositories/aspca.repository.js';

const gemini = geminiClient as unknown as { isAvailable: boolean; generateVision: ReturnType<typeof vi.fn> };
const aspca = aspcaRepository as unknown as { findByFuzzyMatch: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  gemini.isAvailable = false; // default to mock-fallback
});

// ─────────────────────────────────────────────────────────────────────────────
// Input validation
// ─────────────────────────────────────────────────────────────────────────────
describe('VisionService — input validation', () => {
  it('throws AppError(400) when neither image nor plantNameQuery is provided', async () => {
    await expect(visionService.scan({})).rejects.toThrow(AppError);
    await expect(visionService.scan({})).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Text-based lookup path
// ─────────────────────────────────────────────────────────────────────────────
describe('VisionService — text lookup', () => {
  it('returns TOXIC when ASPCA record is toxic', async () => {
    aspca.findByFuzzyMatch.mockResolvedValueOnce({
      plantName: 'Lily',
      scientificName: 'Lilium sp.',
      isToxic: true,
      severity: 'Moderate',
      clinicalSigns: ['vomiting', 'lethargy'],
      actionRequired: 'Seek vet immediately',
    });
    const r = await visionService.scan({ plantNameQuery: 'lily' });
    expect(r.toxicityStatus).toBe('TOXIC');
    expect(r.identifiedPlant).toBe('Lily');
    expect(r.dataSource).toBe('aspca');
    expect(r.identificationConfidence).toBeNull(); // text lookup → no confidence
  });

  it('returns SAFE when ASPCA record is non-toxic', async () => {
    aspca.findByFuzzyMatch.mockResolvedValueOnce({
      plantName: 'Spider Plant',
      scientificName: 'Chlorophytum comosum',
      isToxic: false,
      severity: null,
      clinicalSigns: [],
      actionRequired: null,
    });
    const r = await visionService.scan({ plantNameQuery: 'spider plant' });
    expect(r.toxicityStatus).toBe('SAFE');
  });

  it('throws 404 when plant is not found in ASPCA database', async () => {
    aspca.findByFuzzyMatch.mockResolvedValueOnce(null);
    await expect(visionService.scan({ plantNameQuery: 'xyzPlant' })).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Image-based path (mock fallback — Gemini unavailable)
// ─────────────────────────────────────────────────────────────────────────────
describe('VisionService — image scan (mock fallback)', () => {
  it('uses mock vision response when Gemini is unavailable, cross-references ASPCA', async () => {
    gemini.isAvailable = false;
    aspca.findByFuzzyMatch.mockResolvedValueOnce({
      plantName: 'Peace Lily',
      scientificName: 'Spathiphyllum wallisii',
      isToxic: true,
      severity: 'Mild',
      clinicalSigns: ['oral irritation'],
      actionRequired: 'Monitor',
    });
    const r = await visionService.scan({ image: 'base64data' });
    expect(r.identifiedPlant).toBe('Peace Lily');
    expect(r.toxicityStatus).toBe('TOXIC');
    expect(r.identificationConfidence).toBe(0.94);
    expect(r.lowConfidenceWarning).toBe(false);
    expect(r.dataSource).toBe('aspca');
  });

  it('returns UNKNOWN with fallback dataSource when plant not in ASPCA after vision', async () => {
    gemini.isAvailable = false;
    aspca.findByFuzzyMatch.mockResolvedValueOnce(null);
    const r = await visionService.scan({ image: 'base64data' });
    expect(r.toxicityStatus).toBe('UNKNOWN');
    expect(r.dataSource).toBe('fallback');
    expect(r.actionRequired).toMatch(/not found in ASPCA/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Image-based path (Gemini available)
// ─────────────────────────────────────────────────────────────────────────────
describe('VisionService — image scan (Gemini available)', () => {
  it('calls Gemini, cross-references ASPCA, sets low-confidence warning', async () => {
    gemini.isAvailable = true;
    gemini.generateVision.mockResolvedValueOnce(
      JSON.stringify({ plantName: 'Aloe Vera', confidence: 0.45, details: 'succulent' })
    );
    aspca.findByFuzzyMatch.mockResolvedValueOnce({
      plantName: 'Aloe Vera',
      scientificName: 'Aloe barbadensis',
      isToxic: true,
      severity: 'Mild',
      clinicalSigns: ['diarrhea'],
      actionRequired: 'Monitor closely',
    });
    const r = await visionService.scan({ image: 'base64img' });
    expect(r.identifiedPlant).toBe('Aloe Vera');
    expect(r.identificationConfidence).toBe(0.45);
    expect(r.lowConfidenceWarning).toBe(true); // <0.6
  });

  it('gracefully falls back on Gemini API error (returns "Unknown Plant")', async () => {
    gemini.isAvailable = true;
    gemini.generateVision.mockRejectedValueOnce(new Error('Gemini 500'));
    aspca.findByFuzzyMatch.mockResolvedValueOnce(null);
    const r = await visionService.scan({ image: 'base64img' });
    expect(r.identifiedPlant).toBe('Unknown Plant');
    expect(r.identificationConfidence).toBe(0.5);
    expect(r.toxicityStatus).toBe('UNKNOWN');
  });
});
