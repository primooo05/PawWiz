/**
 * Repository Layer — Plant Toxicity
 * Encapsulates all Prisma queries for the Plant model.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import type { Plant, Prisma } from '@prisma/client';

/**
 * Payload for updating Perenual-sourced fields on an existing plant record.
 * Covers all fields that may be refreshed from the Perenual API cache.
 */
export type PerenualUpdatePayload = {
  toxicityStatus?: string;
  severity?: string | null;
  clinicalSigns?: string[];
  mediaUrl?: string | null;
  perenualId?: string | null;
  cachedAt?: Date | null;
  lastVerifiedAt?: Date;
};

class ToxicityRepository {
  /**
   * Case-insensitive exact match on scientific_name.
   * Uses Prisma's `mode: 'insensitive'` for PostgreSQL ILIKE behaviour.
   */
  async findByScientificName(name: string): Promise<Plant | null> {
    return prisma.plant.findFirst({
      where: {
        scientificName: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Case-insensitive substring match on common_name; returns the first match.
   * Uses Prisma's `contains` + `mode: 'insensitive'`.
   */
  async findByCommonName(name: string): Promise<Plant | null> {
    return prisma.plant.findFirst({
      where: {
        commonName: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Insert a new plant record.
   * Used for initial ASPCA seed writes or first-time Perenual cache entries.
   */
  async create(data: Prisma.PlantCreateInput): Promise<Plant> {
    return prisma.plant.create({ data });
  }

  /**
   * Targeted update of Perenual-sourced fields plus cached_at / last_verified_at.
   * Only the fields present in `data` are written — all other columns are untouched.
   */
  async updatePerenualFields(id: string, data: PerenualUpdatePayload): Promise<Plant> {
    return prisma.plant.update({
      where: { id },
      data: {
        ...(data.toxicityStatus !== undefined && { toxicityStatus: data.toxicityStatus }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.clinicalSigns !== undefined && { clinicalSigns: data.clinicalSigns }),
        ...(data.mediaUrl !== undefined && { mediaUrl: data.mediaUrl }),
        ...(data.perenualId !== undefined && { perenualId: data.perenualId }),
        ...(data.cachedAt !== undefined && { cachedAt: data.cachedAt }),
        ...(data.lastVerifiedAt !== undefined && { lastVerifiedAt: data.lastVerifiedAt }),
      },
    });
  }

  /**
   * Update media_url and bump last_verified_at for a specific record.
   */
  async updateMediaUrl(id: string, mediaUrl: string): Promise<Plant> {
    return prisma.plant.update({
      where: { id },
      data: {
        mediaUrl,
        lastVerifiedAt: new Date(),
      },
    });
  }
}

/** Singleton instance */
export const toxicityRepository = new ToxicityRepository();
