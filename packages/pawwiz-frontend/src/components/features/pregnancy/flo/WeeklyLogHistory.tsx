import React, { useState } from 'react';
import { Scale, Thermometer, StickyNote, ChevronRight } from 'lucide-react';
import type { PregnancyLogEntry, WeeklyLogGroup } from '../../../../../../pawwiz-backend/src/types/shared.js';
import { SYMPTOM_META, MOOD_META } from '../chipRegistry';

interface WeeklyLogHistoryProps {
  groups: WeeklyLogGroup[];
  className?: string;
}

function chipLabels(log: PregnancyLogEntry): string[] {
  return [
    ...log.symptoms.map((s) => SYMPTOM_META[s]?.label ?? s),
    ...log.moodBehavior.map((m) => MOOD_META[m]?.label ?? m),
  ];
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Flo-style history: a vertical list grouped by gestation week (Week N — Phase),
 * each week listing its per-day log rows. Tapping a row expands a read-only
 * detail view of that day's log.
 */
export const WeeklyLogHistory: React.FC<WeeklyLogHistoryProps> = ({ groups, className = '' }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <p className={`rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center text-sm font-semibold text-slate-400 ${className}`}>
        No logs yet. Your daily logs will appear here, grouped by week.
      </p>
    );
  }

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {groups.map((group) => (
        <section key={group.week}>
          <div className="mb-2 flex items-baseline gap-2">
            <h3 className="text-lg font-black text-slate-900">Week {group.week}</h3>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F8C90]">{group.phase}</span>
          </div>

          <div className="flex flex-col gap-2">
            {group.logs.map((log) => {
              const labels = chipLabels(log);
              const isOpen = openId === log.id;
              return (
                <div key={log.id} className="rounded-2xl border-2 border-slate-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : log.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="w-14 shrink-0 text-sm font-black text-slate-700">{formatDay(log.logDate)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-500">
                      {labels.length > 0 ? labels.join(', ') : 'No chips logged'}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-slate-400">
                      {log.weight != null && <Scale className="h-4 w-4" strokeWidth={2.25} />}
                      {log.temp != null && <Thermometer className="h-4 w-4" strokeWidth={2.25} />}
                      {log.notes && <StickyNote className="h-4 w-4" strokeWidth={2.25} />}
                      <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2.5} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t-2 border-slate-100 px-4 py-3 text-sm">
                      <DetailRow label="Symptoms" value={log.symptoms.map((s) => SYMPTOM_META[s]?.label ?? s).join(', ') || '—'} />
                      <DetailRow label="Mood" value={log.moodBehavior.map((m) => MOOD_META[m]?.label ?? m).join(', ') || '—'} />
                      <DetailRow label="Appetite" value={log.appetiteLevel ?? '—'} />
                      <DetailRow label="Energy" value={log.energyLevel ?? '—'} />
                      <DetailRow label="Nesting" value={log.nestingObserved ? 'Yes' : 'No'} />
                      {log.weight != null && <DetailRow label="Weight" value={`${log.weight} kg`} />}
                      {log.temp != null && <DetailRow label="Temp" value={`${log.temp} °C`} />}
                      {log.notes && <DetailRow label="Notes" value={log.notes} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-2 py-0.5">
    <span className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="min-w-0 flex-1 font-medium text-slate-700 capitalize">{value}</span>
  </div>
);

export default WeeklyLogHistory;
