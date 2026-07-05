import React from 'react';
import { Check, PlusCircle } from 'lucide-react';

interface TodayLogStatusProps {
  loggedToday: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Persistent "logged today ✓ / not logged yet" indicator — the same dot pattern
 * Flo shows on its home icon. Tapping it opens the daily log sheet.
 */
export const TodayLogStatus: React.FC<TodayLogStatusProps> = ({ loggedToday, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={loggedToday ? "Edit today's log" : "Log today"}
    className={`inline-flex items-center gap-2 rounded-full border-2 border-slate-900 px-4 py-2 font-bold text-sm shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-transform active:translate-y-0.5 ${
      loggedToday ? 'bg-[#15AFB4] text-white' : 'bg-white text-slate-900'
    } ${className}`}
  >
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full ${loggedToday ? 'bg-white' : 'bg-amber-400'}`}
    />
    {loggedToday ? (
      <>
        <Check className="h-4 w-4" strokeWidth={3} />
        Logged today
      </>
    ) : (
      <>
        <PlusCircle className="h-4 w-4" strokeWidth={2.5} />
        Log today
      </>
    )}
  </button>
);

export default TodayLogStatus;
