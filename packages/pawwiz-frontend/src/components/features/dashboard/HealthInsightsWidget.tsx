import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useTimelineInsights } from '../../../hooks/features/useTimelineInsights.js';
import { SkeletonLine } from '../../ui/skeletons/SkeletonLoader.js';
import type { CorrelationInsight } from '../../../../../pawwiz-backend/src/types/shared.js';

interface HealthInsightsWidgetProps {
  catId: string;
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const severityConfig = {
  concern: {
    card: 'bg-[#fff0f0] border-l-4 border-[#F98080]',
    badge: 'bg-[#F98080] text-white border border-[#1a1a1a]',
    text: 'text-[#1a1a1a]',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#F98080' }} />,
    label: 'Concern',
  },
  warning: {
    card: 'bg-[#fff8e6] border-l-4 border-[#FF6B35]',
    badge: 'bg-[#FF6B35] text-white border border-[#1a1a1a]',
    text: 'text-[#1a1a1a]',
    icon: <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B35' }} />,
    label: 'Warning',
  },
  info: {
    card: 'bg-[#f0fbfa] border-l-4 border-[#4ECDC4]',
    badge: 'bg-[#4ECDC4] text-white border border-[#1a1a1a]',
    text: 'text-[#1a1a1a]',
    icon: <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#4ECDC4' }} />,
    label: 'Info',
  },
} as const;

const InsightCard: React.FC<{ insight: CorrelationInsight }> = ({ insight }) => {
  const config = severityConfig[insight.severity];

  return (
    <div className={`${config.card} rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-xs font-bold text-[#888]">
              {getRelativeTime(insight.generatedAt)}
            </span>
          </div>
          <p className={`text-sm font-bold ${config.text} leading-snug`}>
            {insight.summary}
          </p>
          {insight.detail && (
            <p className="text-xs font-bold text-[#555] mt-1 line-clamp-2">
              {insight.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const HealthInsightsWidget: React.FC<HealthInsightsWidgetProps> = ({ catId }) => {
  const { insights, isLoading, error, refresh } = useTimelineInsights(catId);
  const visibleInsights = insights.slice(0, 3);

  return (
    <div className="bg-[#F0F8F7] border-4 border-[#1a1a1a] rounded-3xl p-6 shadow-[4px_4px_0_0_#1a1a1a] flex flex-col gap-4">
      <h2 className="text-xs font-black text-[#0d7377] uppercase tracking-widest">
        Health Insights
      </h2>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          <SkeletonLine width="w-full" height="h-16" />
          <SkeletonLine width="w-full" height="h-16" />
          <SkeletonLine width="w-full" height="h-16" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-[#fff0f0] border-2 border-[#F98080] rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-[#1a1a1a]">
            Failed to load health insights: {error}
          </p>
          <button
            onClick={() => void refresh()}
            className="flex items-center gap-2 self-start bg-white hover:bg-[#fff0f0] text-[#1a1a1a] font-black text-xs uppercase tracking-wider px-3 py-2 border-2 border-[#1a1a1a] rounded-xl shadow-[2px_2px_0_0_#1a1a1a] active:shadow-none active:translate-y-[2px] transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && visibleInsights.length === 0 && (
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4">
          <p className="text-sm font-bold text-[#555]">
            Log more activity to generate health insights
          </p>
        </div>
      )}

      {/* Data state */}
      {!isLoading && !error && visibleInsights.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {/* Footer — always visible */}
      <Link
        to={`/health-timeline/${catId}`}
        className="flex items-center gap-2 self-start text-xs font-black text-[#0d7377] uppercase tracking-widest hover:text-[#30c290] transition-colors"
      >
        View full timeline
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default HealthInsightsWidget;
