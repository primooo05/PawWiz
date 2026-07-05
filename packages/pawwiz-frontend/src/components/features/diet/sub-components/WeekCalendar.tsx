import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface WeekCalendarProps {
    successDays?: string[];
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({ successDays = [] }) => {
    const today = new Date();
    const [weekOffset, setWeekOffset] = useState<number>(0);
    
    // Helper to get Mon-Sun of current week based on offset
    const getWeekDays = () => {
        const current = new Date();
        const day = current.getDay();
        // Adjust so week starts on Monday, plus week offset
        const diff = current.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
        const monday = new Date(current.setDate(diff));

        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const tempDate = new Date(monday);
            tempDate.setDate(monday.getDate() + i);
            days.push(tempDate);
        }
        return days;
    };

    const weekDays = getWeekDays();
    const weekdaysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const getMonthLabel = () => {
        const midDay = weekDays[3];
        return midDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Calculate consecutive days streak ending at today or yesterday
    const getConsecutiveStreak = (dates: string[]) => {
        if (!dates || dates.length === 0) return 0;
        
        // Convert to Date objects and sort descending
        const sorted = [...dates]
            .map(d => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime());

        const getUTCDateMidnight = (d: Date) => {
            return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        };

        const todayMidnight = getUTCDateMidnight(new Date());
        const oneDayMs = 24 * 60 * 60 * 1000;
        const latestSuccessMidnight = getUTCDateMidnight(sorted[0]);
        const diffFromToday = (todayMidnight - latestSuccessMidnight) / oneDayMs;

        if (diffFromToday > 1) {
            // Streak broken (latest success day is older than yesterday)
            return 0;
        }

        let streak = 1;
        let lastDateMidnight = latestSuccessMidnight;

        for (let i = 1; i < sorted.length; i++) {
            const currentMidnight = getUTCDateMidnight(sorted[i]);
            const diff = (lastDateMidnight - currentMidnight) / oneDayMs;

            if (diff === 1) {
                streak++;
                lastDateMidnight = currentMidnight;
            } else if (diff > 1) {
                break;
            }
        }

        return streak;
    };

    const streakCount = getConsecutiveStreak(successDays);
    const showFire = streakCount >= 5;

    return (
        <div className="w-full bg-white border-2 border-slate-900 rounded-[2rem] p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)] text-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="text-center sm:text-left">
                    <span className="text-[10px] font-black tracking-widest text-[#40C48E] uppercase">Weekly Tracker</span>
                </div>
                
                {/* Yellow Navigation Pill */}
                <div className="px-4 py-1.5 bg-[#ffea30] border-2 border-slate-900 rounded-full font-black text-slate-900 flex items-center gap-4 shadow-[3px_3px_0_0_#0f172a] select-none whitespace-nowrap">
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        aria-label="Previous week"
                        className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-90 transition-transform"
                    >
                        &lt;
                    </button>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900">
                        {getMonthLabel()}
                    </span>
                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        aria-label="Next week"
                        className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-90 transition-transform"
                    >
                        &gt;
                    </button>
                </div>

                <div className="px-3 py-1 bg-[#ffea30] border-2 border-slate-900 rounded-full text-[10px] font-black text-slate-900 uppercase tracking-wider shadow-[2px_2px_0_0_#0f172a]">
                    {showFire ? '🔥 ' : ''}{streakCount} Day Streak
                </div>
            </div>

            {/* Capsules row */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 justify-items-center">
                {weekDays.map((day, idx) => {
                    const dayStr = day.toLocaleDateString('sv-SE'); // YYYY-MM-DD
                    const isSuccess = successDays.includes(dayStr);
                    const active = isToday(day);
                    const label = weekdaysLabels[idx];

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col items-center p-1.5 sm:p-2 bg-slate-50 border-2 border-slate-900 rounded-full w-11 sm:w-14 transition-all shadow-[2px_2px_0_0_rgba(15,23,42,0.05)]
                                ${active ? 'ring-4 ring-[#ffea30]/40 border-[#ffea30]' : ''}`}
                        >
                            {/* Inner Circle indicator */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all mb-1.5
                                    ${isSuccess 
                                        ? 'bg-[#40C48E] text-white border-2 border-slate-900' 
                                        : active 
                                            ? 'bg-[#ffea30] text-slate-900 border-2 border-slate-900' 
                                            : 'bg-white text-slate-400 border border-slate-200'}`}
                            >
                                {isSuccess ? (
                                    <Check size={14} strokeWidth={3.5} />
                                ) : (
                                    day.getDate()
                                )}
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekCalendar;
