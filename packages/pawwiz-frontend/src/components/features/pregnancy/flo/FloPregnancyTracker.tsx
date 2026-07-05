import React, { useEffect, useState } from 'react';
import { CalendarHeart, Baby } from 'lucide-react';
import type { WeeklyLogGroup } from '../../../../../../pawwiz-backend/src/types/shared.js';
import { useCatPregnancy } from '../../../../hooks/features/useCatPregnancy';
import { useDietRecommender } from '../../../../hooks/features/useDietRecommender';
import AnimatedAvatarGroup, { type AvatarData } from '../../../ui/smoothui/animated-avatar-group';
import TodayLogStatus from './TodayLogStatus';
import InsightCardFeed from './InsightCardFeed';
import DailyLogSheet from './DailyLogSheet';
import WeeklyLogHistory from './WeeklyLogHistory';

interface FloPregnancyTrackerProps {
  /** The cat this tracker is scoped to. When null, the tracker stays idle. */
  catId: string | null;
  /** Optional callback to switch to a different cat (from the avatar group). */
  onSwitchCat?: (catId: string) => void;
}

/**
 * Composite Flo-style pregnancy tracker for a single cat. Wires the daily-log
 * sheet, insight feed, today-status pill, and weekly history to the
 * useCatPregnancy data hook. Renders a "Start Pregnancy Tracker" CTA when the
 * cat is female but has no active session.
 */
export const FloPregnancyTracker: React.FC<FloPregnancyTrackerProps> = ({ catId, onSwitchCat }) => {
  const {
    session,
    todayLog,
    insights,
    isLoading,
    isSaving,
    error,
    hasActiveSession,
    loggedToday,
    startSession,
    saveDailyLog,
    loadHistory,
    markInsightRead,
  } = useCatPregnancy(catId);

  const diet = useDietRecommender();

  // Build avatar list for the profile pill (female cats only, with statusDot).
  const avatars: AvatarData[] = diet.profiles
    .filter((p) => p.gender === 'female' && p.catId)
    .map((p) => ({
      id: p.catId!,
      name: p.name,
      src: p.photoUrl || undefined,
      alt: p.name,
      isActive: p.catId === catId,
      statusDot: p.catId === catId ? (loggedToday ? 'green' : 'amber') : null,
    }));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [matingDate, setMatingDate] = useState('');
  const [history, setHistory] = useState<WeeklyLogGroup[]>([]);

  // Seed the history view from the assembled snapshot, then keep it fresh.
  useEffect(() => {
    if (session) setHistory(session.weeklyHistory);
    else setHistory([]);
  }, [session]);

  const refreshHistory = async () => {
    const groups = await loadHistory();
    setHistory(groups);
  };

  if (!catId) {
    return <p className="py-8 text-center text-sm font-semibold text-slate-400">Select a cat to view her pregnancy tracker.</p>;
  }

  if (isLoading && !session) {
    return <p className="py-8 text-center text-sm font-semibold text-slate-400">Loading tracker…</p>;
  }

  // ── Start CTA — female cat, no active session ─────────────────────────────
  if (!hasActiveSession) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-900 bg-white p-6 text-center shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF7F5] text-[#0F8C90]">
          <CalendarHeart className="h-7 w-7" strokeWidth={2.25} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Start Pregnancy Tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Enter the mating date to begin daily logging and gestation tracking.</p>

        <div className="mt-5 flex flex-col gap-3">
          <input
            type="date"
            value={matingDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setMatingDate(e.target.value)}
            className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 focus:border-[#15AFB4] focus:outline-none"
          />
          <button
            type="button"
            disabled={!matingDate || isSaving}
            onClick={() => startSession(matingDate)}
            className="rounded-2xl border-2 border-slate-900 bg-[#15AFB4] py-3 font-black text-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-transform active:translate-y-0.5 disabled:opacity-60"
          >
            {isSaving ? 'Starting…' : 'Start tracking'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
      </div>
    );
  }

  // ── Active session view ───────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      {/* Profile switcher with logged-today dot */}
      {avatars.length > 1 && (
        <div className="flex justify-end">
          <AnimatedAvatarGroup
            avatars={avatars}
            onAvatarClick={(id) => onSwitchCat?.(id)}
            size={40}
          />
        </div>
      )}

      {/* Gestation summary */}
      <div className="rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-[#0F8C90]" strokeWidth={2.25} />
            <div>
              <h2 className="text-xl font-black text-slate-900">Week {session!.gestationWeek}</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Day {session!.daysPregnant} · {session!.daysRemaining} days to go
              </p>
            </div>
          </div>
          <TodayLogStatus loggedToday={loggedToday} onClick={() => setSheetOpen(true)} />
        </div>
      </div>

      {/* Insights */}
      <InsightCardFeed insights={insights} onMarkRead={markInsightRead} />

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Log history</h3>
        <WeeklyLogHistory groups={history} />
      </div>

      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

      <DailyLogSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          void refreshHistory();
        }}
        gestationWeek={session!.gestationWeek}
        existing={todayLog}
        isSaving={isSaving}
        onSave={saveDailyLog}
      />
    </div>
  );
};

export default FloPregnancyTracker;
