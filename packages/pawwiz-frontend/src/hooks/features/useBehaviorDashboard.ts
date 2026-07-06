import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

export interface DailyBehaviorSummary {
  date: string;
  totalEvents: number;
  topBehaviors: Array<{ type: string; count: number }>;
  avgIntensity: 'mild' | 'moderate' | 'severe';
}

export interface WeeklySummary {
  week: string;
  days: DailyBehaviorSummary[];
  topBehaviors: Array<{ type: string; count: number }>;
  concernFlags: string[];
}

export interface BehaviorPattern {
  type: string;
  frequency: number;
  lastObserved: string;
  avgIntensity: 'mild' | 'moderate' | 'severe';
  intensityBreakdown: { mild: number; moderate: number; severe: number };
  commonContexts: string[];
}

export interface TrendDataByPeriod {
  labels: string[];
  series: Array<{ name: string; color: string; data: number[] }>;
}

interface UseBehaviorDashboardReturn {
  weeklySummary: WeeklySummary | null;
  patterns: BehaviorPattern[];
  trendDataByPeriod: Record<'7' | '30' | 'all', TrendDataByPeriod>;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const EMPTY_TREND: TrendDataByPeriod = { labels: [], series: [] };

export function useBehaviorDashboard(catId?: string | null): UseBehaviorDashboardReturn {
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [trendDataByPeriod, setTrendDataByPeriod] = useState<Record<'7' | '30' | 'all', TrendDataByPeriod>>({
    7: EMPTY_TREND,
    30: EMPTY_TREND,
    all: EMPTY_TREND,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const catParam = catId ? `catId=${catId}` : '';

      // Fetch weekly summary, patterns, and all three trend windows in parallel.
      // The trend endpoint accepts days=7|30|365 — "all" maps to 365 on the backend.
      const [weekRes, patternsRes, trend7Res, trend30Res, trendAllRes] = await Promise.all([
        fetch(`${API_BASE}/api/behavior/dashboard/week${catParam ? `?${catParam}` : ''}`, { headers }),
        fetch(`${API_BASE}/api/behavior/dashboard/patterns?days=7${catParam ? `&${catParam}` : ''}`, { headers }),
        fetch(`${API_BASE}/api/behavior/dashboard/trend?days=7${catParam ? `&${catParam}` : ''}`, { headers }),
        fetch(`${API_BASE}/api/behavior/dashboard/trend?days=30${catParam ? `&${catParam}` : ''}`, { headers }),
        fetch(`${API_BASE}/api/behavior/dashboard/trend?days=all${catParam ? `&${catParam}` : ''}`, { headers }),
      ]);

      if (!weekRes.ok) throw new Error(`Weekly summary fetch failed: ${weekRes.statusText}`);
      if (!patternsRes.ok) throw new Error(`Patterns fetch failed: ${patternsRes.statusText}`);

      const weekData = await weekRes.json() as WeeklySummary;
      setWeeklySummary(weekData);

      const patternData = await patternsRes.json() as BehaviorPattern[];
      setPatterns(patternData);

      // Real per-bucket trend data — fall back to empty on error so the chart
      // renders cleanly with no data rather than crashing.
      const [trend7, trend30, trendAll] = await Promise.all([
        trend7Res.ok ? (trend7Res.json() as Promise<TrendDataByPeriod>) : Promise.resolve(EMPTY_TREND),
        trend30Res.ok ? (trend30Res.json() as Promise<TrendDataByPeriod>) : Promise.resolve(EMPTY_TREND),
        trendAllRes.ok ? (trendAllRes.json() as Promise<TrendDataByPeriod>) : Promise.resolve(EMPTY_TREND),
      ]);

      setTrendDataByPeriod({ 7: trend7, 30: trend30, all: trendAll });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch behavior data';
      setError(message);
      console.error('useBehaviorDashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [catId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    weeklySummary,
    patterns,
    trendDataByPeriod,
    isLoading,
    error,
    refreshData: fetchData,
  };
}
