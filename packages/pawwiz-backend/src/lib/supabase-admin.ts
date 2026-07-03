/**
 * Supabase Admin Client — Service Role
 * Used exclusively for server-side privileged operations (e.g. password recovery).
 * NEVER expose this client or its key to any frontend path.
 *
 * Required env vars:
 *   SUPABASE_URL          — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role secret (not the anon key)
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    '[supabase-admin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
    'Did you start the server without Infisical?'
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
