/**
 * Repository Layer — Profile
 * Encapsulates all Prisma queries for the Profile model.
 * No business logic. Only data access.
 * Singleton Pattern — exported as a single instance.
 */

import { prisma } from '../lib/prisma.js';
import type { Profile } from '@prisma/client';

export interface CreateProfileData {
  supabaseUserId: string;
  displayName: string;
  catName: string;
  catBreed: string | null;
  catMarking: string | null;
  catSex: string;
  catLifeStage: string;
}

export interface UpdateProfileData {
  displayName?: string;
  catName?: string;
  catBreed?: string | null;
  catMarking?: string | null;
  catSex?: string;
  catLifeStage?: string;
}

class ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { id } });
  }

  async findBySupabaseUserId(supabaseUserId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { supabaseUserId } });
  }

  async create(data: CreateProfileData): Promise<Profile> {
    return prisma.profile.create({ data });
  }

  async update(id: string, data: UpdateProfileData): Promise<Profile> {
    return prisma.profile.update({ where: { id }, data });
  }

  async updateBySupabaseUserId(supabaseUserId: string, data: UpdateProfileData): Promise<Profile> {
    return prisma.profile.update({ where: { supabaseUserId }, data });
  }

  async delete(id: string): Promise<Profile> {
    return prisma.profile.delete({ where: { id } });
  }

  async exists(supabaseUserId: string): Promise<boolean> {
    const count = await prisma.profile.count({ where: { supabaseUserId } });
    return count > 0;
  }
}

/** Singleton instance */
export const profileRepository = new ProfileRepository();
