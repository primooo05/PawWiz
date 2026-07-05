import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import type {
  ActiveSessionResponse,
  PregnancyLogEntry,
  PregnancyInsightCard,
  WeeklyLogGroup,
  SymptomChip,
  MoodChip,
  AppetiteLevel,
  EnergyLevel,
} from '../../../../pawwiz-backend/src/types/shared.js';

/** Payload for creating/editing today's log (gestationWeek is server-computed). */
export interface DailyLogPayload {
  symptoms: SymptomChip[];
  moodBehavior: MoodChip[];
  appetiteLevel?: AppetiteLevel;
  energyLevel?: EnergyLevel;
  nestingObserved?: boolean;
  weight?: number;
  temp?: number;
  notes?: string;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  };
};

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return (body as { error?: string }).error ?? `Request failed (${res.status})`;
}

/**
 * Data layer for the Flo-style cat pregnancy tracker. Owns all API calls,
 * loading/error state, and the assembled active-session snapshot. Pages/
 * components stay pure UI shells that consume this hook.
 */
export function useCatPregnancy(catId: string | null) {
  const [session, setSession] = useState<ActiveSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActive = useCallback(async () => {
    if (!catId) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE}/api/pregnancy/session/active/${encodeURIComponent(catId)}`,
        { headers },
      );
      if (!res.ok) {
        setError(await parseError(res));
        return;
      }
      const body: ActiveSessionResponse | null = await res.json();
      setSession(body);
    } catch {
      setError('Failed to load the pregnancy tracker. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [catId]);

  useEffect(() => {
    if (catId) fetchActive();
    else setSession(null);
  }, [catId, fetchActive]);

  /** Start a new pregnancy session; refreshes the snapshot on success. */
  const startSession = useCallback(
    async (matingDate: string): Promise<boolean> => {
      if (!catId) return false;
      setIsSaving(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/api/pregnancy/session/start`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ catId, matingDate }),
        });
        if (!res.ok) {
          setError(await parseError(res));
          return false;
        }
        setSession(await res.json());
        return true;
      } catch {
        setError('Failed to start tracking. Please try again.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [catId],
  );

  /** Upsert today's log (one per day, editable). Returns the saved entry. */
  const saveDailyLog = useCallback(
    async (payload: DailyLogPayload): Promise<PregnancyLogEntry | null> => {
      if (!session) return null;
      setIsSaving(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/api/pregnancy/log`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sessionId: session.sessionId, ...payload }),
        });
        if (!res.ok) {
          setError(await parseError(res));
          return null;
        }
        const entry: PregnancyLogEntry = await res.json();
        // Refresh the snapshot so todayLog / recentLogs / insights reflect the save.
        // Insights generate async server-side, so a short refresh picks them up.
        await fetchActive();
        return entry;
      } catch {
        setError('Failed to save today\'s log. Please try again.');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [session, fetchActive],
  );

  /** Fetch week-grouped log history (optionally a single week). */
  const loadHistory = useCallback(
    async (week?: number): Promise<WeeklyLogGroup[]> => {
      if (!session) return [];
      try {
        const headers = await getAuthHeaders();
        const qs = week !== undefined ? `?week=${week}` : '';
        const res = await fetch(
          `${API_BASE}/api/pregnancy/log/history/${session.sessionId}${qs}`,
          { headers },
        );
        if (!res.ok) {
          setError(await parseError(res));
          return [];
        }
        return await res.json();
      } catch {
        setError('Failed to load log history.');
        return [];
      }
    },
    [session],
  );

  /** Mark an insight card read and drop it from the local unread list. */
  const markInsightRead = useCallback(
    async (insightId: string): Promise<void> => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          `${API_BASE}/api/pregnancy/insights/${insightId}/read`,
          { method: 'PATCH', headers },
        );
        if (!res.ok) {
          setError(await parseError(res));
          return;
        }
        setSession((prev) =>
          prev
            ? { ...prev, insights: prev.insights.filter((i) => i.id !== insightId) }
            : prev,
        );
      } catch {
        setError('Failed to update the insight.');
      }
    },
    [],
  );

  /** Mark the active session completed (post-kittening). */
  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;
    setIsSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE}/api/pregnancy/session/${session.sessionId}/complete`,
        { method: 'PATCH', headers },
      );
      if (!res.ok) {
        setError(await parseError(res));
        return false;
      }
      setSession(null);
      return true;
    } catch {
      setError('Failed to complete the session.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [session]);

  const todayLog: PregnancyLogEntry | null = session?.todayLog ?? null;
  const insights: PregnancyInsightCard[] = session?.insights ?? [];

  return {
    session,
    todayLog,
    insights,
    isLoading,
    isSaving,
    error,
    hasActiveSession: !!session,
    loggedToday: !!todayLog,
    refresh: fetchActive,
    startSession,
    saveDailyLog,
    loadHistory,
    markInsightRead,
    completeSession,
  };
}
