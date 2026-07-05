import React from 'react';
import type { DailyLog } from '../../../hooks/trackers/usePregnancyTracker';

interface CalendarModuleProps {
    currentMonthLabel: string;
    currentYear: number;
    changeCalendarMonth: (direction: -1 | 1) => void;
    calendarGrid: (number | null)[];
    getLocalDateStr: (year: number, monthIdx: number, dayNum: number) => string;
    logs: Record<string, DailyLog>;
    selectedDateStr: string | null;
    isDateLoggable: (year: number, monthIdx: number, dayNum: number) => boolean;
    openLogForDate: (dateStr: string) => void;
    getWeekMilestone: (day: number) => number | null;
    getElapsedDayLabel: (day: number) => number | null;
    getDayBadgeClassName: (day: number, isSelected: boolean) => string;
    currentMonthIndex: number;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
    currentMonthLabel,
    currentYear,
    changeCalendarMonth,
    calendarGrid,
    getLocalDateStr,
    logs,
    selectedDateStr,
    isDateLoggable,
    openLogForDate,
    getWeekMilestone,
    getElapsedDayLabel,
    getDayBadgeClassName,
    currentMonthIndex,
}) => {
    return (
        <div className="relative flex flex-col items-center w-full">
            {/* Floating Month Navigator */}
            <div className="absolute -top-5 z-10">
                <div className="px-3 py-1.5 bg-[#FFEA30] border-2 border-slate-900 rounded-full font-bold text-slate-900 flex items-center gap-3 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <button
                        type="button"
                        onClick={() => changeCalendarMonth(-1)}
                        aria-label="Previous month"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white/90 text-base leading-none hover:bg-white transition-all duration-200 ease-out hover:scale-110 active:scale-90 cursor-pointer"
                    >
                        {'<'}
                    </button>
                    <span className="min-w-[140px] text-center text-sm">
                        {currentMonthLabel} {currentYear}
                    </span>
                    <button
                        type="button"
                        onClick={() => changeCalendarMonth(1)}
                        aria-label="Next month"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white/90 text-base leading-none hover:bg-white transition-all duration-200 ease-out hover:scale-110 active:scale-90 cursor-pointer"
                    >
                        {'>'}
                    </button>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="w-full bg-white border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                {/* Green Header */}
                <div className="bg-[#40C48E] border-b-2 border-slate-900 pt-8 pb-4 px-6 grid grid-cols-7 text-center">
                    {['S', 'M', 'T', 'W', 'TH', 'F', 'S'].map((day, idx) => (
                        <span key={idx} className="font-bold text-slate-900">{day}</span>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-6 py-8 px-6 text-center bg-white min-h-[220px]">
                    {calendarGrid.map((day, idx) => {
                        if (!day) {
                            return <div key={idx} className="w-10 h-10"></div>;
                        }

                        const dateStr = getLocalDateStr(currentYear, currentMonthIndex, day);
                        const log = logs[dateStr];
                        const hasSymptoms = log && log.symptoms && log.symptoms.length > 0;
                        const weekMilestone = getWeekMilestone(day);
                        const isSelected = dateStr === selectedDateStr;
                        const loggable = isDateLoggable(currentYear, currentMonthIndex, day);

                        return (
                            <div key={idx} className="flex justify-center items-center">
                                <button
                                    type="button"
                                    disabled={!loggable}
                                    onClick={() => openLogForDate(dateStr)}
                                    className={`flex flex-col items-center justify-center gap-1 min-h-[70px] w-full focus:outline-none transition-all duration-200 ease-out ${loggable ? 'cursor-pointer hover:scale-110 active:scale-95 hover:opacity-90' : 'cursor-not-allowed opacity-40'}`}
                                >
                                    {/* Top indicator: Week Milestone or Elapsed Day */}
                                    <span className={`inline-flex min-h-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-black leading-none ${weekMilestone !== null
                                        ? 'bg-[#FFEA30] text-slate-900 border border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] font-extrabold'
                                        : 'text-slate-400'
                                        }`}>
                                        {weekMilestone !== null ? `W${weekMilestone}` : getElapsedDayLabel(day)}
                                    </span>

                                    {/* Badge Circle */}
                                    <div className={getDayBadgeClassName(day, isSelected)}>
                                        {day}
                                    </div>

                                    {/* Bottom indicators: dot for symptoms */}
                                    <div className="h-2 flex items-center justify-center">
                                        {hasSymptoms && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarModule;
