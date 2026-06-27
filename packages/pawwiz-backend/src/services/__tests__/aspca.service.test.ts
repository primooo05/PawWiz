import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { aspcaService } from '../aspca.service.js';
import { aspcaRepository } from '../../repositories/aspca.repository.js';
import { AppError } from '../../utils/errors.js';
import type { PlantToxicityRecord } from '../../types/shared.js';

vi.mock('../../repositories/aspca.repository.js', () => ({
  aspcaRepository: {
    findByFuzzyMatch: vi.fn(),
    findAll: vi.fn()
  }
}));

/** Factory for valid PlantToxicityRecord test data */
const plantRecordArbitrary = fc.record({
  plantName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  scientificName: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  isToxic: fc.boolean(),
  clinicalSigns: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
  severity: fc.constantFrom('None', 'Mild', 'Moderate', 'Severe') as fc.Arbitrary<PlantToxicityRecord['severity']>,
  actionRequired: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
});

describe('ASPCA Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lookupPlant', () => {
    it('should throw AppError (400) when plantName is empty or whitespace', async () => {
      const emptyStrings = fc.constantFrom('', '   ', '\t', '\n');

      await fc.assert(
        fc.asyncProperty(emptyStrings, async (plantName) => {
          await expect(aspcaService.lookupPlant(plantName)).rejects.toThrow(AppError);
          await expect(aspcaService.lookupPlant(plantName)).rejects.toMatchObject({
            statusCode: 400
          });
        })
      );
    });

    it('should throw AppError (404) when plant is not found in database', async () => {
      const validNames = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

      await fc.assert(
        fc.asyncProperty(validNames, async (plantName) => {
          vi.mocked(aspcaRepository.findByFuzzyMatch).mockResolvedValueOnce(null);

          await expect(aspcaService.lookupPlant(plantName)).rejects.toThrow(AppError);
          await expect(aspcaService.lookupPlant(plantName)).rejects.toMatchObject({
            statusCode: 404
          });
        })
      );
    });

    it('should return a PlantLookupResponse when plant is found', async () => {
      const validNames = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

      await fc.assert(
        fc.asyncProperty(validNames, plantRecordArbitrary, async (plantName, record) => {
          vi.mocked(aspcaRepository.findByFuzzyMatch).mockResolvedValueOnce(record);

          const result = await aspcaService.lookupPlant(plantName);

          expect(result).toEqual({
            plantName: record.plantName,
            scientificName: record.scientificName,
            isToxic: record.isToxic,
            clinicalSigns: record.clinicalSigns,
            severity: record.severity,
            actionRequired: record.actionRequired
          });
        })
      );
    });

    it('should call repository with the provided plantName', async () => {
      const validNames = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

      await fc.assert(
        fc.asyncProperty(validNames, plantRecordArbitrary, async (plantName, record) => {
          vi.mocked(aspcaRepository.findByFuzzyMatch).mockResolvedValueOnce(record);

          await aspcaService.lookupPlant(plantName);

          expect(aspcaRepository.findByFuzzyMatch).toHaveBeenCalledWith(plantName);
        })
      );
    });
  });

  describe('listAll', () => {
    it('should return mapped responses for all records', async () => {
      const recordArrays = fc.array(plantRecordArbitrary, { minLength: 0, maxLength: 10 });

      await fc.assert(
        fc.asyncProperty(recordArrays, async (records) => {
          vi.mocked(aspcaRepository.findAll).mockResolvedValueOnce(records);

          const results = await aspcaService.listAll();

          expect(results).toHaveLength(records.length);
          results.forEach((result, i) => {
            expect(result).toEqual({
              plantName: records[i].plantName,
              scientificName: records[i].scientificName,
              isToxic: records[i].isToxic,
              clinicalSigns: records[i].clinicalSigns,
              severity: records[i].severity,
              actionRequired: records[i].actionRequired
            });
          });
        })
      );
    });

    it('should return an empty array when database is empty', async () => {
      vi.mocked(aspcaRepository.findAll).mockResolvedValueOnce([]);

      const results = await aspcaService.listAll();

      expect(results).toEqual([]);
    });
  });
});
