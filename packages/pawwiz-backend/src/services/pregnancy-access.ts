/**
 * Ownership guards for the pregnancy tracker.
 *
 * Every log/insight/session endpoint must confirm the target session's cat is
 * owned by the authenticated Supabase user before reading or writing — this is
 * the line of defence against cross-user session access (a user guessing or
 * replaying another owner's sessionId / catId).
 *
 * Kept in its own module so the session and log services can both depend on it
 * without importing each other (avoids a circular import).
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { pregnancySessionRepository } from '../repositories/pregnancy-session.repository.js';

/** Throw unless `catId` exists and belongs to `supabaseUserId`. */
export async function verifyCatOwnership(catId: string, supabaseUserId: string): Promise<void> {
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
    select: { id: true, profile: { select: { supabaseUserId: true } } },
  });
  if (!cat) throw AppError.notFound(`Cat not found: ${catId}`);
  if (cat.profile?.supabaseUserId !== supabaseUserId) {
    throw AppError.forbidden('You do not have permission to access this cat.');
  }
}

/**
 * Throw unless `sessionId` exists and its cat belongs to `supabaseUserId`.
 * Returns the loaded session (with matingDate/status) so callers avoid a
 * second fetch.
 */
export async function verifySessionOwnership(sessionId: string, supabaseUserId: string) {
  const session = await pregnancySessionRepository.findByIdWithOwner(sessionId);
  if (!session) throw AppError.notFound('Pregnancy session not found');
  if (session.cat.profile?.supabaseUserId !== supabaseUserId) {
    throw AppError.forbidden('You do not have permission to access this session.');
  }
  return session;
}
