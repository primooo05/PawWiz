import React from 'react';
import { AlertTriangle, Sparkles, CalendarClock, Trophy, X } from 'lucide-react';
import type { PregnancyInsightCard, PregnancyInsightType } from '../../../../../../pawwiz-backend/src/types/shared.js';

interface InsightCardFeedProps {
  insights: PregnancyInsightCard[];
  onMarkRead: (insightId: string) => void;
  className?: string;
}

const ICONS: Record<PregnancyInsightType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  warning: AlertTriangle,
  pattern_detected: Sparkles,
  vet_reminder: CalendarClock,
  milestone_reached: Trophy,
};

/** Warning cards get a rose accent; everything else is teal/informational. */
function accent(type: PregnancyInsightType): string {
  return type === 'warning'
    ? 'bg-rose-50 border-rose-500'
    : 'bg-[#EBF7F5] border-[#15AFB4]';
}

function iconTint(type: PregnancyInsightType): string {
  return type === 'warning' ? 'text-rose-600' : 'text-[#0F8C90]';
}

/**
 * Flo-style insight card feed. Sits above the "Log today" trigger. Each card is
 * dismissible (marks read → slides out). Warning insights are visually distinct.
 */
export const InsightCardFeed: React.FC<InsightCardFeedProps> = ({ insights, onMarkRead, className = '' }) => {
  if (insights.length === 0) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {insights.map((card) => {
        const Icon = ICONS[card.insightType] ?? Sparkles;
        return (
          <div
            key={card.id}
            className={`relative flex gap-3 rounded-2xl border-2 p-4 shadow-[2px_2px_0_0_rgba(15,23,42,0.9)] ${accent(card.insightType)}`}
          >
            <div className={`shrink-0 ${iconTint(card.insightType)}`}>
              <Icon className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-slate-900 leading-tight">{card.title}</h4>
                <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  Week {card.gestationWeek}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 leading-snug">{card.body}</p>
            </div>
            <button
              type="button"
              onClick={() => onMarkRead(card.id)}
              aria-label="Dismiss insight"
              className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-700"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default InsightCardFeed;
