import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Lightbulb } from 'lucide-react';
import type { CorrelationInsight, InsightSeverity } from '../../../../../pawwiz-backend/src/types/shared.js';
import { SkeletonLine } from '../../ui/skeletons/SkeletonLoader.js';

// ─── Relative time helper ─────────────────────────────────────────────────────

function getRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}

// ─── Severity badge helpers ───────────────────────────────────────────────────

interface SeverityConfig {
  containerClass: string;
  labelClass: string;
  badgeClass: string;
  label: string;
  borderAccent: string;
}

const SEVERITY_CONFIG: Record<InsightSeverity, SeverityConfig> = {
  concern: {
    containerClass: 'bg-red-50 border-red-400',
    labelClass: 'text-red-900',
    badgeClass: 'bg-amber-400 text-red-900 border-red-500',
    label: 'CONCERN',
    borderAccent: 'border-l-red-500',
  },
  warning: {
    containerClass: 'bg-blue-50 border-blue-400',
    labelClass: 'text-blue-900',
    badgeClass: 'bg-blue-200 text-blue-900 border-blue-400',
    label: 'WARNING',
    borderAccent: 'border-l-blue-500',
  },
  info: {
    containerClass: 'bg-slate-50 border-slate-300',
    labelClass: 'text-slate-800',
    badgeClass: 'bg-slate-200 text-slate-700 border-slate-400',
    label: 'INFO',
    borderAccent: 'border-l-slate-400',
  },
};

// ─── Skeleton placeholder for a single insight row ───────────────────────────

const InsightSkeleton: React.FC = () => (
  <div className="bg-white border-2 border-slate-200 p-4 border-l-4 border-l-slate-300 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="w-16 h-5 bg-slate-200 rounded" />
      <div className="w-20 h-3 bg-slate-200 rounded" />
    </div>
    <SkeletonLine width="w-full" className="mb-1.5" />
    <SkeletonLine width="w-4/5" />
  </div>
);

// ─── Single insight card ──────────────────────────────────────────────────────

const InsightCard: React.FC<{ insight: CorrelationInsight }> = ({ insight }) => {
  const cfg = SEVERITY_CONFIG[insight.severity];

  return (
    <div
      className={`border-2 ${cfg.containerClass} border-l-4 ${cfg.borderAccent} p-4 transition-all`}
      role="listitem"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Severity badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${cfg.badgeClass} shrink-0`}
        >
          {cfg.label}
        </span>

        {/* Relative timestamp */}
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mt-0.5">
          {getRelativeTime(insight.generatedAt)}
        </span>
      </div>

      {/* Summary */}
      <p className={`text-sm font-bold leading-snug ${cfg.labelClass}`}>
        {insight.summary}
      </p>

      {/* Source tag */}
      <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
        via {insight.source}
      </span>
    </div>
  );
};

// ─── InsightsPanel ────────────────────────────────────────────────────────────

export interface InsightsPanelProps {
  insights: CorrelationInsight[];
  isLoading: boolean;
  onRefresh: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, isLoading, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasInsights = insights.length > 0;

  return (
    <section
      className="bg-[#F0F8F7] border-4 border-[#1a1a1a] rounded-2xl shadow-[4px_4px_0_0_#1a1a1a] overflow-hidden"
      aria-label="Health insights panel"
    >
      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b-4 border-[#1a1a1a] bg-[#e8f5f4]">
        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            className="text-[#0d7377] shrink-0"
            aria-hidden="true"
          />
          <h2 className="text-xs font-black text-[#0d7377] uppercase tracking-widest">
            Correlation Insights
          </h2>
          {!isLoading && hasInsights && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0d7377] text-white text-[10px] font-black">
              {insights.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh insights"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-[#1a1a1a] bg-[#30c290] text-white hover:bg-white hover:text-[#30c290] shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={11}
              className={isLoading ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            Refresh
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="insights-panel-body"
            aria-label={isExpanded ? 'Collapse insights' : 'Expand insights'}
            className="flex items-center justify-center w-8 h-8 border-2 border-[#1a1a1a] bg-white hover:bg-slate-100 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[1px] transition-all"
          >
            {isExpanded ? (
              <ChevronUp size={14} className="text-[#1a1a1a]" aria-hidden="true" />
            ) : (
              <ChevronDown size={14} className="text-[#1a1a1a]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── Panel body ───────────────────────────────────────────────── */}
      {isExpanded && (
        <div id="insights-panel-body" className="p-4 flex flex-col gap-3">
          {isLoading ? (
            // Skeleton placeholders while loading
            <>
              <InsightSkeleton />
              <InsightSkeleton />
              <InsightSkeleton />
            </>
          ) : hasInsights ? (
            <div role="list" className="flex flex-col gap-3">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-3" aria-hidden="true">🔍</span>
              <p className="text-sm font-black text-slate-700 mb-1">No insights yet</p>
              <p className="text-xs font-bold text-slate-500">
                Log more health events to generate correlation insights.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default InsightsPanel;
