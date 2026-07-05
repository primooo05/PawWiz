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
    setIsLogging(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('You need to be signed in to log behaviors.');
        return false;
      }

      const res = await fetch(`${API_BASE}/api/quick-log/behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ behaviorType, ...opts }),
      });

      if (!res.ok) {
        throw new Error('Failed to log behavior');
      }

      setLastLoggedType(behaviorType);
      // Clear the confirmation pulse after a short delay.
      window.setTimeout(() => setLastLoggedType(null), 1800);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  return { logBehavior, isLogging, lastLoggedType, error };
};
