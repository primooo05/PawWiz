import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { API_BASE } from '../../lib/config.js';
import type { CorrelationInsight, InsightsResponse } from '../../../../pawwiz-backend/src/types/shared.js';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  };
};

export function useTimelineInsights(
  catId: string,
  severityFilter?: 'info' | 'warning' | 'concern',
) {
  const [insights, setInsights] = useState<CorrelationInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!catId) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const url = new URL(`${API_BASE}/api/timeline/${catId}/insights`);
      if (severityFilter) {
        url.searchParams.set('severity', severityFilter);
      }

      const response = await fetch(url.toString(), { headers });

      if (response.status === 403) {
        setError('Access denied');
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Request failed with status ${response.status}`);
      }

      const data: InsightsResponse = await response.json();
      setInsights(data.data);
    } catch (err) {
      if (error !== 'Access denied') {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [catId, severityFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(async (): Promise<void> => {
    if (!catId) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();

      const postResponse = await fetch(
        `${API_BASE}/api/timeline/${catId}/insights/refresh`,
        { method: 'POST', headers },
      );

      if (postResponse.status === 403) {
        setError('Access denied');
        return;
      }

      if (!postResponse.ok) {
        const body = await postResponse.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Refresh failed with status ${postResponse.status}`,
        );
      }

      // Re-fetch insights after triggering the refresh
      const getHeaders = await getAuthHeaders();
      const url = new URL(`${API_BASE}/api/timeline/${catId}/insights`);
      if (severityFilter) {
        url.searchParams.set('severity', severityFilter);
      }

      const getResponse = await fetch(url.toString(), { headers: getHeaders });

      if (getResponse.status === 403) {
        setError('Access denied');
        return;
      }

      if (!getResponse.ok) {
        const body = await getResponse.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Fetch failed with status ${getResponse.status}`,
        );
      }

      const data: InsightsResponse = await getResponse.json();
      setInsights(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  }, [catId, severityFilter]);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  return { insights, isLoading, isRefreshing, error, refresh };
}
