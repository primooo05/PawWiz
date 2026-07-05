/**
 * Auth Controller — Password Recovery
 *
 * POST /api/auth/recover
 * Accepts an email address and dispatches a Supabase-generated, time-bound
 * password-reset link via the existing MailerService.
 *
 * Security invariants:
 *  - No token is generated on the client side.
 *  - The response is identical whether the email exists or not
 *    (prevents account enumeration).
 *  - Rate-limited upstream by recoveryLimiter (3 req / 15 min / IP).
 *  - The reset redirect URL is defined server-side only.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { recoverRequestSchema } from '../schemas/auth.schemas.js';
import { supabaseAdmin } from '../lib/supabase-admin.js';
import { mailerService } from '../services/mailer.service.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/winston.js';

// The frontend route Supabase will append the recovery token to.
// Must be an allowed redirect URL in your Supabase project settings.
const RESET_REDIRECT_URL =
  process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5173/reset-password';

// Constant-time floor for the recovery handler. Both the "email exists" and
// "email does not exist" paths are padded to at least this duration so an
// attacker cannot infer account existence from response latency.
const RECOVERY_MIN_RESPONSE_MS = 750;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const postRequestRecovery = withErrorHandling(async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const { email } = recoverRequestSchema.parse(req.body);

  // Always return the same response to prevent email enumeration.
  const GENERIC_RESPONSE = {
    message: 'If an account with that email exists, a password reset link has been sent.',
  };

  // Pad the elapsed time up to the constant-time floor before responding.
  const respondConstantTime = async () => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < RECOVERY_MIN_RESPONSE_MS) {
      await sleep(RECOVERY_MIN_RESPONSE_MS - elapsed);
    }
    res.json(GENERIC_RESPONSE);
  };

  // Ask Supabase Admin to generate a one-time recovery link.
  // This will fail silently (from the client's perspective) if the email
  // is not registered — the generic response is returned either way.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: RESET_REDIRECT_URL },
  });

  if (linkError || !linkData?.properties?.action_link) {
    // Log server-side but do NOT surface to client (enumeration prevention).
    logger.warn('[AuthController] Recovery link generation failed or email not found', {
      error: linkError?.message,
    });
    await respondConstantTime();
    return;
  }

  const resetLink = linkData.properties.action_link;

  // Resolve the owner's display name via the Supabase user record (best-effort).
  let ownerName = 'Cat Parent';
  try {
    const supabaseUserId = linkData.user?.id;
    if (supabaseUserId) {
      const profile = await prisma.profile.findUnique({
        where: { supabaseUserId },
        select: { displayName: true },
      });
      if (profile?.displayName) ownerName = profile.displayName;
    }
  } catch {
    // Non-fatal.
  }

  // Dispatch recovery email. Failures are logged but do not alter the response.
  try {
    await mailerService.sendRecoveryEmail(email, ownerName, resetLink);
  } catch (err) {
    logger.error('[AuthController] Recovery email dispatch failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  await respondConstantTime();
});
