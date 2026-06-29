import React from 'react';
import type { MealLog } from '../../../hooks/useDietRecommender';

interface MealsTrackerProps {
    loggedMeals: MealLog[];
    waterIntake: number;
    waterTarget: number;
    addWater: (amount: number) => void;
    resetWater: () => void;
    onEditMeal: (meal: MealLog) => void;
    onAddMeal: () => void;
    onUndoSkip: (mealId: string) => void;
}

export const MealsTracker: React.FC<MealsTrackerProps> = ({
    loggedMeals,
    waterIntake,
    waterTarget,
    addWater,
    resetWater,
    onEditMeal,
    onAddMeal,
    onUndoSkip,
}) => {
    const hasLoggedMeals = loggedMeals.some(m => m.status === 'logged' || m.status === 'skipped');

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Meals</h2>
                <button
                    onClick={onAddMeal}
                    className="w-10 h-10 bg-[#2ec4b6] hover:bg-[#20a396] text-white border-2 border-slate-900 rounded-full flex items-center justify-center font-bold text-2xl shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                    +
                </button>
            </div>

            <div className="space-y-6">
                {!hasLoggedMeals ? (
                    <p className="text-xs font-bold text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-[1.5rem] shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                        No meals logged today. Click (+) to start tracking.
                    </p>
                ) : (
                    loggedMeals.map((meal) => {
                        const isLogged = meal.status === 'logged';
                        const isSkipped = meal.status === 'skipped';

                        if (isLogged) {
                            return (
                                <div key={meal.id} className="relative p-5 bg-[#F2FBF9] border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0_0_rgba(15,23,42,1)] flex flex-col gap-3">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-slate-900 text-lg">{meal.mealName}</span>
                                            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{meal.timestamp || '10:00am'}</span>
                                        </div>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => onEditMeal(meal)}
                                            className="w-7 h-7 bg-[#2ec4b6] hover:bg-[#20a396] text-white border border-slate-900 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                    </div>

                                    <hr className="border-slate-200" />

                                    {/* Details */}
                                    <div className="text-xs text-slate-500 font-bold space-y-1 mt-1">
                                        <div>Food type: <span className="text-slate-800 capitalize">{meal.foodType === 'dry' ? 'Kibble' : meal.foodType === 'wet' ? 'Wet Food' : 'Mixed Food'}</span></div>
                                        <div>Measurement: <span className="text-slate-800">{meal.amount} {meal.unit}{meal.amount !== 1 ? 's' : ''}</span></div>
                                    </div>
                                </div>
                            );
                        }

                        if (isSkipped) {
                            return (
                                <div key={meal.id} className="p-5 bg-white border-2 border-slate-900 rounded-2xl flex items-center justify-between shadow-[3px_3px_0_0_rgba(15,23,42,1)]">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0 animate-pulse" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                            {meal.mealName} &middot; Meal Skipped
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onUndoSkip(meal.id)}
                                        className="text-xs font-black text-[#2ec4b6] hover:text-[#20a396] uppercase tracking-wider cursor-pointer transition-colors border-none bg-transparent"
                                    >
                                        Undo
                                    </button>
                                </div>
                            );
                        }

                        return null;
                    })
                )}
            </div>

            {/* Slim Water Intake Row */}
            <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wider">Water Intake:</span>
                        <span className="text-sm font-black text-[#2ec4b6]">{waterIntake} ml</span>
                        <span className="text-xs font-bold text-slate-400">/ {waterTarget} ml</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => addWater(50)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-slate-900 rounded-xl text-xs font-black shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                            +50ml
                        </button>
                        <button
                            onClick={() => addWater(100)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-slate-900 rounded-xl text-xs font-black shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                            +100ml
                        </button>
                        <button
                            onClick={resetWater}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-3 rounded-full overflow-hidden relative">
                    <div
                        className="bg-blue-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (waterIntake / waterTarget) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MealsTracker;
