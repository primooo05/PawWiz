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

// Neo-brutalist palette (shared with Dashboard)
const ORANGE = '#FF6B35';
const TEAL = '#4ECDC4';
const PINK = '#F98080';

const BEHAVIOR_COLORS: Record<string, string> = {
  playful: TEAL,
  affectionate: ORANGE,
  vocal: '#8b5cf6',
  anxious: PINK,
  aggressive: '#b91c1c',
  lethargic: '#94a3b8',
};

function synthesizeTrendData(patterns: BehaviorPattern[]): Record<'7' | '30' | 'all', TrendDataByPeriod> {
  const behaviorTypes = [...new Set(patterns.map(p => p.type))];
  const colors = behaviorTypes.map(t => BEHAVIOR_COLORS[t] ?? '#94a3b8');

  // Build series for each behavior type
  const series = behaviorTypes.map((type, idx) => {
    const pattern = patterns.find(p => p.type === type);
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      color: colors[idx],
      // For 7-day view: distribute frequency evenly across 7 days
      data7: pattern ? Array(7).fill(Math.round(pattern.frequency / 7)) : Array(7).fill(0),
      // For 30-day view: 4 weeks
      data30: pattern ? Array(4).fill(Math.round(pattern.frequency / 4)) : Array(4).fill(0),
      // For all-time: 5-month view
      dataAll: pattern ? Array(5).fill(Math.round(pattern.frequency / 5)) : Array(5).fill(0),
    };
  });

  return {
    7: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: series.map(s => ({ name: s.name, color: s.color, data: s.data7 })),
    },
    30: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      series: series.map(s => ({ name: s.name, color: s.color, data: s.data30 })),
    },
    all: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      series: series.map(s => ({ name: s.name, color: s.color, data: s.dataAll })),
    },
  } as Record<'7' | '30' | 'all', TrendDataByPeriod>;
}

export function useBehaviorDashboard(catId?: string | null): UseBehaviorDashboardReturn {
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [trendDataByPeriod, setTrendDataByPeriod] = useState<Record<'7' | '30' | 'all', TrendDataByPeriod>>({
    7: { labels: [], series: [] },
    30: { labels: [], series: [] },
    all: { labels: [], series: [] },
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
      const catIdParam = catId ? `?catId=${catId}` : '';

      // Fetch weekly summary
      const weekRes = await fetch(`${API_BASE}/api/behavior/dashboard/week${catIdParam}`, { headers });
      if (!weekRes.ok) throw new Error(`Weekly summary fetch failed: ${weekRes.statusText}`);
      const weekData = await weekRes.json() as WeeklySummary;
      setWeeklySummary(weekData);

      // Fetch patterns (7-day view by default)
      const patternsRes = await fetch(`${API_BASE}/api/behavior/dashboard/patterns?days=7${catIdParam ? `&${catIdParam.slice(1)}` : ''}`, { headers });
      if (!patternsRes.ok) throw new Error(`Patterns fetch failed: ${patternsRes.statusText}`);
      const patternData = await patternsRes.json() as BehaviorPattern[];
      setPatterns(patternData);

      // Synthesize trend data from patterns
      const trendData = synthesizeTrendData(patternData);
      setTrendDataByPeriod(trendData);
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
