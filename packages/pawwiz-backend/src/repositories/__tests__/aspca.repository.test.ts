import { describe, it, expect } from 'vitest';
import { aspcaRepository } from '../aspca.repository.js';

describe('AspcaRepository', () => {
  describe('findByFuzzyMatch', () => {
    it('should find plant in rich database', async () => {
      const record = await aspcaRepository.findByFuzzyMatch('lily');
      expect(record).not.toBeNull();
      expect(record!.scientificName).toBe('Lilium species');
      expect(record!.isToxic).toBe(true);
      expect(record!.clinicalSigns).toContain('Vomiting');
    });

    it('should find plant in CSV database', async () => {
      // 'Adam-and-Eve' is in aspca-csv.ts
      const record = await aspcaRepository.findByFuzzyMatch('Adam-and-Eve');
      expect(record).not.toBeNull();
      expect(record!.scientificName).toBe('Arum maculatum');
      expect(record!.isToxic).toBe(true);
      expect(record!.clinicalSigns).toContain('Oral irritation');
    });

    it('should return null for non-existing plant', async () => {
      const record = await aspcaRepository.findByFuzzyMatch('NonExistentPlantName123');
      expect(record).toBeNull();
    });
  });
});
