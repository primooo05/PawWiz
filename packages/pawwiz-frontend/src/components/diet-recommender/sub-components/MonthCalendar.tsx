import React, { useState } from 'react';

interface MonthCalendarProps {
    successDays?: string[];
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ successDays = [] }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState<number>(today.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    const changeMonth = (direction: -1 | 1) => {
        const next = new Date(viewYear, viewMonth + direction, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    // Build a 7-column grid of Date objects, padded with nulls before the 1st
    // and after the last day, so full weeks (rows) line up.
    const buildGrid = (): (Date | null)[] => {
        const firstOfMonth = new Date(viewYear, viewMonth, 1);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const leadingBlanks = firstOfMonth.getDay(); // 0 = Sunday

        const grid: (Date | null)[] = [];
        for (let i = 0; i < leadingBlanks; i++) grid.push(null);
        for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(viewYear, viewMonth, d));
        while (grid.length % 7 !== 0) grid.push(null);
        return grid;
    };

    const grid = buildGrid();

    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    // The row index (week) that contains "today" — only meaningful when viewing
    // the current month. Every other week gets dimmed to keep focus on "this week".
    const currentWeekRowIndex = isCurrentMonth
        ? Math.floor(grid.findIndex((d) => d && isToday(d)) / 7)
        : -1;

    return (
        <div className="relative w-full mt-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
            {/* Month Selector Pill */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1.5 bg-[#ffea30] border-2 border-slate-900 rounded-full font-black text-slate-900 flex items-center gap-4 shadow-[3px_3px_0_0_#0f172a] select-none whitespace-nowrap">
                    <button
                        onClick={() => changeMonth(-1)}
                        aria-label="Previous month"
                        className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-90 transition-transform"
                    >
                        &lt;
                    </button>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900">
                        {monthLabel}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        aria-label="Next month"
                        className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-90 transition-transform"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="w-full overflow-hidden rounded-[2.5rem]">
                <div className="bg-[#40C48E] border-b-2 border-slate-900 pt-8 pb-4 px-4 grid grid-cols-7 text-center">
                    {['S', 'M', 'T', 'W', 'TH', 'F', 'S'].map((dayName, idx) => (
                        <span key={idx} className="font-black text-slate-900 text-xs">{dayName}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-3 py-5 px-4 text-center bg-white">
                    {grid.map((day, idx) => {
                        if (!day) {
                            return <div key={idx} />;
                        }

                        const rowIndex = Math.floor(idx / 7);
                        const isThisWeek = !isCurrentMonth || rowIndex === currentWeekRowIndex;
                        const active = isToday(day);
                        const dayStr = day.toLocaleDateString('sv-SE'); // YYYY-MM-DD
                        const isSuccess = successDays.includes(dayStr);

                        return (
                            <div
                                key={idx}
                                className={`flex flex-col items-center justify-center relative pb-3 transition-opacity ${
                                    isThisWeek ? 'opacity-100' : 'opacity-30'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    active
                                        ? 'bg-[#ffea30] border-2 border-slate-900 text-slate-955 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)]'
                                        : 'text-slate-700'
                                }`}>
                                    {day.getDate()}
                                </div>
                                {isSuccess && (
                                    <span
                                        className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-[#40C48E] border-2 border-slate-900 shadow-[1px_1px_0_rgba(15,23,42,1)]"
                                        title="All meals logged!"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MonthCalendar;
