import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { API_BASE } from '../../lib/config.js';
import BottomNav from '../BottomNav.js';

interface DailyBehaviorSummary {
  date: string;
  totalEvents: number;
  topBehaviors: Array<{ type: string; count: number }>;
  avgIntensity: 'mild' | 'moderate' | 'severe';
}

interface WeeklySummary {
  week: string;
  days: DailyBehaviorSummary[];
  topBehaviors: Array<{ type: string; count: number }>;
  concernFlags: string[];
}

interface BehaviorPattern {
  type: string;
  frequency: number;
  lastObserved: string;
  avgIntensity: 'mild' | 'moderate' | 'severe';
  intensityBreakdown: { mild: number; moderate: number; severe: number };
  commonContexts: string[];
}

interface InsightSummary {
  overallTrend: string;
  primaryConcerns: string[];
  positiveIndicators: string[];
  recommendations: string[];
}

const BehaviorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const behaviorColors: Record<string, string> = {
    playful: '#30c290',
    anxious: '#FFB870',
    aggressive: '#EF4444',
    affectionate: '#EC4899',
    lethargic: '#94A3B8',
    vocalization: '#8B5CF6',
    grooming: '#06B6D4',
    toileting: '#F59E0B',
  };

  const behaviorLabels: Record<string, string> = {
    playful: 'Playful',
    anxious: 'Anxious',
    aggressive: 'Aggressive',
    affectionate: 'Affectionate',
    lethargic: 'Lethargic',
    vocalization: 'Vocal',
    grooming: 'Grooming',
    toileting: 'Toileting',
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        setIsLoading(true);

        // Fetch all dashboard data in parallel
        const [weekRes, patternsRes, insightsRes] = await Promise.all([
          fetch(`${API_BASE}/api/behavior/dashboard/week`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
          fetch(`${API_BASE}/api/behavior/dashboard/patterns`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
          fetch(`${API_BASE}/api/behavior/dashboard/insights`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
        ]);

        if (weekRes.ok) {
          const weekData = await weekRes.json();
          setWeeklySummary(weekData);
        }

        if (patternsRes.ok) {
          const patternsData = await patternsRes.json();
          setPatterns(patternsData);
        }

        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
        }

        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleNavigation = (item: string) => {
    if (item === 'calendar') navigate('/pregnancy-tracker');
    else if (item === 'dashboard') navigate('/dashboard');
    else if (item === 'diet-reco') navigate('/diet-recommender');
    else if (item === 'settings') navigate('/settings');
    else if (item === 'behavior') navigate('/behavior-chat');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full md:w-[1920px] md:mx-auto flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#30c290]/20 border-t-[#30c290] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading behavior insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full md:w-[1920px] md:mx-auto flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">Error loading dashboard</p>
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#30c290] text-white rounded-lg font-semibold hover:bg-[#27a7a0]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col overflow-hidden md:overflow-y-auto">
      <div className="w-full md:w-[1920px] md:mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Behavior Dashboard</h1>
          <p className="text-sm text-slate-600">Track your cat's behavioral patterns and insights</p>
        </div>

        {/* Overall Insights Card */}
        {insights && (
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">📊 Overall Trend</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trend Status */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${
                    insights.overallTrend === 'Healthy & engaged'
                      ? 'bg-green-100'
                      : insights.overallTrend === 'Needs attention'
                        ? 'bg-orange-100'
                        : 'bg-blue-100'
                  }`}
                >
                  {insights.overallTrend === 'Healthy & engaged'
                    ? '✅'
                    : insights.overallTrend === 'Needs attention'
                      ? '⚠️'
                      : '📈'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-black text-slate-900">{insights.overallTrend}</p>
                </div>
              </div>

              {/* Concerns */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Concerns</p>
                {insights.primaryConcerns.length > 0 ? (
                  <div className="space-y-1">
                    {insights.primaryConcerns.map((concern, i) => (
                      <p key={i} className="text-sm text-red-600 font-semibold">
                        • {concern}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 font-semibold">None detected</p>
                )}
              </div>

              {/* Positive Indicators */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Positive Indicators</p>
                <div className="space-y-1">
                  {insights.positiveIndicators.map((indicator, i) => (
                    <p key={i} className="text-sm text-green-600 font-semibold">
                      • {indicator}
                    </p>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommendations</p>
                <div className="space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <p key={i} className="text-sm text-slate-700 font-semibold">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        {weeklySummary && weeklySummary.days.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">📅 {weeklySummary.week}</h2>

            {/* Concern Flags */}
            {weeklySummary.concernFlags.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                <p className="font-bold text-orange-900 mb-2">⚠️ Alerts</p>
                {weeklySummary.concernFlags.map((flag, i) => (
                  <p key={i} className="text-sm text-orange-800">
                    • {flag}
                  </p>
                ))}
              </div>
            )}

            {/* Daily Behavior Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weeklySummary.days.map((day) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedDate === day.date
                      ? 'bg-[#30c290]/10 border-[#30c290]'
                      : 'bg-slate-50 border-slate-200 hover:border-[#30c290]/50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-500 uppercase mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-black text-slate-900 mb-2">{day.totalEvents}</p>
                  <div className="flex flex-wrap gap-1">
                    {day.topBehaviors.slice(0, 2).map((behavior) => (
                      <span
                        key={behavior.type}
                        className="text-[9px] font-black px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${behaviorColors[behavior.type] || '#94A3B8'}20`,
                          color: behaviorColors[behavior.type] || '#475569',
                        }}
                      >
                        {behaviorLabels[behavior.type] || behavior.type}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Behavior Patterns */}
        {patterns.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">🔍 Behavior Patterns</h2>

            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div key={pattern.type} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black"
                        style={{
                          backgroundColor: `${behaviorColors[pattern.type] || '#94A3B8'}20`,
                          color: behaviorColors[pattern.type] || '#475569',
                        }}
                      >
                        {pattern.type === 'playful' && '🎾'}
                        {pattern.type === 'anxious' && '😰'}
                        {pattern.type === 'aggressive' && '😾'}
                        {pattern.type === 'affectionate' && '🥰'}
                        {pattern.type === 'lethargic' && '😴'}
                        {pattern.type === 'vocalization' && '🔊'}
                        {pattern.type === 'grooming' && '🧼'}
                        {pattern.type === 'toileting' && '🚽'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {behaviorLabels[pattern.type] || pattern.type}
                        </p>
                        <p className="text-xs text-slate-500">Observed {pattern.frequency} times</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase">Intensity</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: behaviorColors[pattern.type] || '#475569' }}
                      >
                        {pattern.avgIntensity}
                      </p>
                    </div>
                  </div>

                  {/* Intensity Breakdown */}
                  <div className="flex gap-2 mb-3">
                    {Object.entries(pattern.intensityBreakdown).map(([intensity, count]) => (
                      <div key={intensity} className="flex-1">
                        <div className="bg-slate-100 rounded h-2 mb-1">
                          <div
                            className={`h-2 rounded transition-all ${
                              intensity === 'severe'
                                ? 'bg-red-500'
                                : intensity === 'moderate'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{
                              width: `${(count / (pattern.frequency || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 text-center capitalize">{intensity}</p>
                      </div>
                    ))}
                  </div>

                  {/* Contexts */}
                  {pattern.commonContexts.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Common Contexts</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.commonContexts.map((ctx) => (
                          <span key={ctx} className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded">
                            {ctx}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weeklySummary || weeklySummary.days.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] p-12 text-center">
            <p className="text-lg font-black text-slate-900 mb-2">No behavior data yet</p>
            <p className="text-slate-600 mb-4">Start logging cat behaviors in the behavior chat to see patterns here</p>
            <button
              onClick={() => navigate('/behavior-chat')}
              className="px-6 py-3 bg-[#30c290] text-white font-black rounded-xl hover:bg-[#27a7a0] transition-colors"
            >
              Go to Behavior Chat
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav activeItem="dashboard" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
      </div>
    </div>
  );
};

export default BehaviorDashboard;
