import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

export type QuickLogBehaviorType =
  | 'playful'
  | 'affectionate'
  | 'vocal'
  | 'anxious'
  | 'aggressive'
  | 'lethargic';

export interface QuickLogOptions {
  intensity?: 'mild' | 'moderate' | 'severe';
  context?: string;
  catId?: string;
}

/**
 * useQuickLog — one-tap behavior logging.
 * Posts a single user-reported behavior to /api/quick-log/behavior and exposes
 * lightweight status (in-flight + last-logged type) so the UI can show a brief
 * confirmation pulse. Meal and water quick-logging reuse the existing diet hook,
 * so this hook is intentionally scoped to behaviors only.
 */
export const useQuickLog = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [lastLoggedType, setLastLoggedType] = useState<QuickLogBehaviorType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logBehavior = async (
    behaviorType: QuickLogBehaviorType,
    opts: QuickLogOptions = {}
  ): Promise<boolean> => {
    console.log('[useQuickLog] logBehavior called:', behaviorType, opts);
    setIsLogging(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.warn('[useQuickLog] No session — user not signed in');
        setError('You need to be signed in to log behaviors.');
        return false;
      }
      console.log('[useQuickLog] Session OK, user:', session.user.id);

      const payload = { behaviorType, ...opts };
      console.log('[useQuickLog] POSTing to', `${API_BASE}/api/quick-log/behavior`, payload);

      const res = await fetch(`${API_BASE}/api/quick-log/behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[useQuickLog] Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errBody = await res.text().catch(() => '(no body)');
        console.error('[useQuickLog] Request failed. Body:', errBody);
        throw new Error(`Failed to log behavior (${res.status}): ${errBody}`);
      }

      const data = await res.json().catch(() => null);
      console.log('[useQuickLog] Success — logged behavior:', data);

      setLastLoggedType(behaviorType);
      // Clear the confirmation pulse after a short delay.
      window.setTimeout(() => setLastLoggedType(null), 1800);
      return true;
    } catch (e) {
      console.error('[useQuickLog] Caught error:', e);
      setError((e as Error).message);
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  return { logBehavior, isLogging, lastLoggedType, error };
};
