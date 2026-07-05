import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import type { HealthEvent, TimelineResponse, EventSource } from '../../../../pawwiz-backend/src/types/shared.js';

const ALL_SOURCES: EventSource[] = ['behavior', 'diet', 'pregnancy', 'heat'];
const PAGE_LIMIT = 50;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  };
};

export function useHealthTimeline(catId: string) {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [pagination, setPagination] = useState<{ nextCursor: string | null; hasMore: boolean }>({
    nextCursor: null,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceErrors, setSourceErrors] = useState<Array<{ source: EventSource; message: string }>>([]);

  // Filter state
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [sources, setSources] = useState<EventSource[]>(ALL_SOURCES);

  const buildUrl = useCallback(
    (cursor: string | null): string => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_LIMIT));
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (sources.length > 0 && sources.length < ALL_SOURCES.length) {
        params.set('sources', sources.join(','));
      }
      if (cursor) params.set('cursor', cursor);
      return `${API_BASE}/api/timeline/${encodeURIComponent(catId)}?${params.toString()}`;
    },
    [catId, startDate, endDate, sources]
  );

  // Fresh fetch — resets event list to page 1
  const fetchTimeline = useCallback(async () => {
    if (!catId) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const url = buildUrl(null);
      const response = await fetch(url, { headers });

      if (response.status === 403) {
        setError('Access denied');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError((errData as { error?: string }).error ?? `Request failed (${response.status})`);
        return;
      }

      const body: TimelineResponse = await response.json();
      setEvents(body.data);
      setPagination(body.pagination);
      setSourceErrors(body.errors ?? []);
    } catch {
      setError('Failed to load health timeline. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [catId, buildUrl]);

  // Load more — appends next cursor page
  const loadMore = useCallback(async () => {
    if (!catId || !pagination.hasMore || !pagination.nextCursor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const url = buildUrl(pagination.nextCursor);
      const response = await fetch(url, { headers });

      if (response.status === 403) {
        setError('Access denied');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError((errData as { error?: string }).error ?? `Request failed (${response.status})`);
        return;
      }

      const body: TimelineResponse = await response.json();
      setEvents((prev) => [...prev, ...body.data]);
      setPagination(body.pagination);
      setSourceErrors(body.errors ?? []);
    } catch {
      setError('Failed to load more events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [catId, pagination, isLoading, buildUrl]);

  // Refetch alias — explicit reset to page 1 (also used internally on filter change)
  const refetch = useCallback(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Auto-fetch on mount and whenever catId / filters change
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    // Data
    events,
    pagination,
    isLoading,
    error,
    sourceErrors,

    // Filter state
    startDate,
    endDate,
    sources,

    // Filter setters (trigger re-fetch via useEffect dependency on fetchTimeline)
    setStartDate,
    setEndDate,
    setSources,

    // Actions
    loadMore,
    refetch,
  };
}
