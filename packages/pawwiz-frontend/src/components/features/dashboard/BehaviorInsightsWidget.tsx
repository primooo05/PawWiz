import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { API_BASE } from '../../../lib/config.js';

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
      <div className="bg-[#F0F8F7] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a]">
        <div className="h-40 bg-slate-200 animate-pulse border-2 border-slate-300" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-[#F0F8F7] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a]">
        <h2 className="text-xs font-black text-[#0d7377] uppercase tracking-widest mb-3">
          Behavior Insights
        </h2>
        <p className="text-sm font-bold text-gray-600">No behavior data collected yet</p>
      </div>
    );
  }

  const getTrendEmoji = (trend: string) => {
    if (trend.includes('Healthy') || trend.includes('engaged')) return '✅';
    if (trend.includes('Needs')) return '⚠️';
    return '📈';
  };

  return (
    <div className="bg-[#F0F8F7] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a] flex flex-col gap-4">
      <h2 className="text-xs font-black text-[#0d7377] uppercase tracking-widest">
        Behavior Insights
      </h2>

      {/* Trend Status */}
      <div className="flex items-center gap-4 bg-white border-2 border-[#1a1a1a] p-4">
        <span className="text-3xl">{getTrendEmoji(insights.overallTrend)}</span>
        <div>
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Overall Trend</p>
          <p className="text-sm font-black text-slate-900">{insights.overallTrend}</p>
        </div>
      </div>

      {/* Concerns Summary */}
      {insights.primaryConcerns.length > 0 && insights.primaryConcerns[0] !== 'None observed' && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <p className="text-xs font-black text-orange-900 uppercase tracking-widest mb-1">Concerns</p>
          <p className="text-sm font-bold text-orange-800 line-clamp-2">
            {insights.primaryConcerns[0]}
          </p>
        </div>
      )}

      {/* Positive Indicators */}
      {insights.positiveIndicators.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-xs font-black text-green-900 uppercase tracking-widest mb-1">Positive</p>
          <p className="text-sm font-bold text-green-800 line-clamp-2">
            {insights.positiveIndicators[0]}
          </p>
        </div>
      )}

      {/* View More Button */}
      <button
        onClick={onViewMore}
        className="w-full bg-[#30c290] hover:bg-white text-white hover:text-[#30c290] font-black py-3 border-2 border-[#1a1a1a] shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-xs tracking-wider uppercase"
      >
        View Full Report
      </button>
    </div>
  );
};

export default BehaviorInsightsWidget;
