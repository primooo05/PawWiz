import React from 'react';

interface CalorieTrackerProps {
    dailyCalories: number;
    totalLoggedCalories: number;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
    dailyCalories,
    totalLoggedCalories,
}) => {
    const remainingCalories = Math.max(0, dailyCalories - totalLoggedCalories);
    const percent = Math.min(100, (totalLoggedCalories / dailyCalories) * 100);

    return (
        <div className="p-6 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#FFEA30] rotate-45" />
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Calorie Tracker</span>
            </div>

            <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div
                    className="w-24 h-24 rounded-full border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] relative flex items-center justify-center flex-shrink-0"
                    style={{
                        background: `conic-gradient(#2ec4b6 0% ${percent}%, #f1f5f9 ${percent}% 100%)`
                    }}
                >
                    <div className="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center border border-slate-200">
                        <span className="text-xs font-black text-slate-800 leading-none">{Math.round(percent)}%</span>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Eaten</span>
                    </div>
                </div>

                {/* Details values */}
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Daily Target</p>
                    <p className="text-lg font-black text-slate-950 leading-tight">{dailyCalories} kcal</p>
                    <div className="text-[10px] text-slate-500 font-bold space-y-0.5 mt-1">
                        <p>Logged: {totalLoggedCalories} kcal</p>
                        <p>Remaining: {remainingCalories} kcal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalorieTracker;
