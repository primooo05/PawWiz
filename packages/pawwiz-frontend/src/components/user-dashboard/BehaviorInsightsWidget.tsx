import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

interface InsightSummary {
  overallTrend: string;
  primaryConcerns: string[];
  positiveIndicators: string[];
  recommendations: string[];
}

interface BehaviorInsightsWidgetProps {
  onViewMore: () => void;
}

const BehaviorInsightsWidget: React.FC<BehaviorInsightsWidgetProps> = ({ onViewMore }) => {
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`${API_BASE}/api/behavior/dashboard/insights`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        }
      } catch (error) {
        console.error('Failed to fetch behavior insights', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#F0F8F7] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a]">
        <div className="h-32 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-[#F0F8F7] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a]">
        <h2 className="text-xs font-black text-teal-700 uppercase tracking-widest mb-3">
          Behavior Insights
        </h2>
        <p className="text-sm font-bold text-slate-500">No behavior data collected yet</p>
      </div>
    );
  }

  const getTrendEmoji = (trend: string) => {
    if (trend.includes('Healthy') || trend.includes('engaged')) return '✅';
    if (trend.includes('Needs')) return '⚠️';
    return '📈';
  };

  return (
    <div className="bg-gradient-to-br from-[#F0F8F7] to-[#E8F4F2] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a] flex flex-col gap-4">
      <h2 className="text-xs font-black text-teal-700 uppercase tracking-widest">
        Behavior Insights
      </h2>

      {/* Trend Status */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-teal-200">
        <span className="text-2xl">{getTrendEmoji(insights.overallTrend)}</span>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Overall Trend</p>
          <p className="text-sm font-black text-slate-900">{insights.overallTrend}</p>
        </div>
      </div>

      {/* Concerns Summary */}
      {insights.primaryConcerns.length > 0 && insights.primaryConcerns[0] !== 'None observed' && (
        <div className="bg-orange-50 border-l-4 border-orange-400 rounded p-3">
          <p className="text-[10px] font-black text-orange-900 uppercase mb-1">Concerns</p>
          <p className="text-xs font-bold text-orange-800 line-clamp-2">
            {insights.primaryConcerns[0]}
          </p>
        </div>
      )}

      {/* Positive Indicators */}
      {insights.positiveIndicators.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 rounded p-3">
          <p className="text-[10px] font-black text-green-900 uppercase mb-1">Positive</p>
          <p className="text-xs font-bold text-green-800 line-clamp-2">
            {insights.positiveIndicators[0]}
          </p>
        </div>
      )}

      {/* View More Button */}
      <button
        onClick={onViewMore}
        className="w-full bg-[#2ec4b6] hover:bg-[#3bd4c5] text-white font-black py-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer text-xs tracking-wider uppercase"
      >
        View Full Report
      </button>
    </div>
  );
};

export default BehaviorInsightsWidget;
