import React, { useState } from 'react';

interface WeeklyCalendarProps {
    // Extensible if parent wants to track selected active dates
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = () => {
    const [weekOffset, setWeekOffset] = useState<number>(0);

    // Helper to get days of current week
    const getDaysOfCurrentWeek = () => {
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 = Sunday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek + (weekOffset * 7));

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const currentWeekDays = getDaysOfCurrentWeek();
    const calendarMonthLabel = currentWeekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="relative w-full mt-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
            {/* Month Selector Pill */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1.5 bg-[#ffea30] border-2 border-slate-900 rounded-full font-black text-slate-900 flex items-center gap-4 shadow-[3px_3px_0_0_#0f172a] select-none whitespace-nowrap">
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-90 transition-transform"
                    >
                        &lt;
                    </button>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900">
                        {calendarMonthLabel}
                    </span>
                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
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
 
                <div className="grid grid-cols-7 py-5 px-4 text-center bg-white">
                    {currentWeekDays.map((day, idx) => {
                        const active = isToday(day);
                        return (
                            <div key={idx} className="flex flex-col items-center justify-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    active
                                        ? 'bg-[#ffea30] border-2 border-slate-900 text-slate-955 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)]'
                                        : 'text-slate-700'
                                }`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
