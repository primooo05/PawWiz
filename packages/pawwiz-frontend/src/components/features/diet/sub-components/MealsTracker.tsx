import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { MealLog } from '../../../../hooks/features/useDietRecommender';
import { getFood, formatAmountUnit, type MealUnit } from '../../../../lib/foods';

interface MealsTrackerProps {
    loggedMeals: MealLog[];
    waterIntake: number;
    waterTarget: number;
    addWater: (amount: number) => void;
    resetWater: () => void;
    onEditMeal: (meal: MealLog) => void;
    onAddMeal: () => void;
    onUndoSkip: (mealId: string) => void;
    catName?: string;
}

const MEAL_COLORS: Record<string, { bg: string; text: string }> = {
    Breakfast: { bg: '#FFE57F', text: '#8A4F00' }, // Gold/Yellow
    Lunch: { bg: '#A7F3D0', text: '#046A38' },     // Mint Green
    Dinner: { bg: '#DDD6FE', text: '#5B21B6' },    // Purple
};

export const MealsTracker: React.FC<MealsTrackerProps> = ({
    loggedMeals,
    waterIntake,
    waterTarget,
    addWater,
    resetWater,
    onEditMeal,
    onAddMeal,
    onUndoSkip,
    catName = 'Your cat',
}) => {
    const [localWater, setLocalWater] = useState(waterIntake);

    useEffect(() => {
        setLocalWater(waterIntake);
    }, [waterIntake]);

    const handleSliderRelease = () => {
        const diff = localWater - waterIntake;
        if (diff !== 0) {
            addWater(diff);
        }
    };

    const hasLoggedMeals = loggedMeals.some(m => m.status === 'logged' || m.status === 'skipped' || m.status === 'pending');

    // Which folder is currently expanded. Default to the first logged or first meal.
    const [expandedMealId, setExpandedMealId] = useState<string | null>(loggedMeals[0]?.id ?? null);
    const [hoveredMealId, setHoveredMealId] = useState<string | null>(null);

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

            {!hasLoggedMeals ? (
                <p className="text-xs font-bold text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-[1.5rem] shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    No meals logged today. Click (+) to start tracking.
                </p>
            ) : (
                <div className="flex flex-col pt-6 pb-4 w-full">
                    {loggedMeals.map((meal, index) => {
                        const isExpanded = meal.id === expandedMealId;
                        const isHovered = meal.id === hoveredMealId;
                        const colors = MEAL_COLORS[meal.mealName] || { bg: '#E2E8F0', text: '#475569' };

                        // Dynamic Z-Index: expanded/active at top (50), hovered just below (40),
                        // and base stack layers from back-to-front (Breakfast at 10, Lunch at 20, Dinner at 30)
                        const zIndex = isExpanded ? 50 : isHovered ? 40 : 10 + index * 10;

                        return (
                            <div
                                key={meal.id}
                                onMouseEnter={() => setHoveredMealId(meal.id)}
                                onMouseLeave={() => setHoveredMealId(null)}
                                onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                                className={`relative flex flex-col transition-all duration-300 ease-out cursor-pointer group w-full
                                    ${index > 0 ? '-mt-10' : ''}
                                    ${isExpanded ? 'scale-[1.01]' : 'scale-100'}
                                    hover:-translate-y-4`}
                                style={{ zIndex }}
                            >
                                {/* Folder Tab (Attached directly to folder body color) */}
                                <div className="flex">
                                    <div
                                        className="h-7 px-4 border-t-2 border-x-2 border-slate-900 rounded-t-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center transition-colors"
                                        style={{
                                            backgroundColor: colors.bg,
                                            borderColor: '#0f172a',
                                            color: colors.text,
                                        }}
                                    >
                                        {meal.mealName}
                                    </div>
                                </div>

                                {/* Folder Body */}
                                <div
                                    className="border-2 border-slate-900 rounded-b-2xl rounded-tr-2xl p-4 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col gap-3 min-h-[110px] transition-colors -mt-[2px]"
                                    style={{
                                        backgroundColor: colors.bg,
                                    }}
                                >
                                    {/* Folder Header */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                                                {meal.timestamp || 'Pending'}
                                            </span>
                                            <span className="font-black text-slate-900 text-base leading-tight">
                                                {meal.status === 'logged' ? 'Logged' : meal.status === 'skipped' ? 'Skipped' : 'Pending'}
                                            </span>
                                        </div>

                                        {meal.status === 'logged' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditMeal(meal);
                                                }}
                                                className="w-7 h-7 bg-[#2ec4b6] hover:bg-[#20a396] text-white border-2 border-slate-900 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Expandable Details Container */}
                                    <motion.div
                                        initial={false}
                                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-3 border-t border-slate-900/10 flex flex-col gap-2.5 text-xs font-bold text-slate-700">
                                            {meal.status === 'logged' ? (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Food:</span>
                                                        <span className="text-slate-900">{getFood(meal.foodType).label}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Amount:</span>
                                                        <span className="text-slate-900">
                                                            {meal.amount != null
                                                                ? formatAmountUnit(meal.amount, (meal.unit as MealUnit) ?? 'spoon')
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-slate-900/5 p-2 rounded-xl mt-1">
                                                        <span>Energy:</span>
                                                        <span className="text-[#20a396] font-black text-sm">{meal.kcal} kcal</span>
                                                    </div>
                                                </>
                                            ) : meal.status === 'skipped' ? (
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-[11px] text-slate-500 italic">This meal was skipped.</p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onUndoSkip(meal.id);
                                                        }}
                                                        className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                                                    >
                                                        Undo Skip
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 pt-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditMeal(meal);
                                                        }}
                                                        className="w-full py-2 bg-[#2ec4b6] hover:bg-[#20a396] text-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                                    >
                                                        Log Meal
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Slim Water Intake Row */}
            <div className="mt-4 flex flex-col gap-4">
                {localWater >= waterTarget && (
                    <div className="bg-[#40C48E]/10 border border-[#40C48E] text-[#1b5c3e] rounded-2xl p-3 text-xs font-black text-center flex items-center justify-center gap-2 animate-fadeIn">
                        All filled up! {catName} is perfectly taken care of, thanks to you.
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wider">Water Intake:</span>
                        <span className="text-sm font-black text-blue-500">{localWater} ml</span>
                        <span className="text-xs font-bold text-slate-400">/ {waterTarget} ml</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                resetWater();
                                setLocalWater(0);
                            }}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="0"
                        max={waterTarget * 2}
                        step="10"
                        value={localWater}
                        onChange={(e) => setLocalWater(parseInt(e.target.value, 10))}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 border border-slate-200 h-3 rounded-full overflow-hidden relative">
                    <style>{`
                        @keyframes wave-flow {
                            0% { background-position-x: 0px; }
                            100% { background-position-x: 40px; }
                        }
                    `}</style>
                    <div
                        className="bg-blue-500 h-full transition-all duration-300 ease-out relative overflow-hidden"
                        style={{ width: `${Math.min(100, (localWater / waterTarget) * 100)}%` }}
                    >
                        {localWater > 0 && (
                            <div 
                                className="absolute inset-0 opacity-40 bg-repeat-x"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 10'%3E%3Cpath d='M0,5 C10,2 10,8 20,5 C30,2 30,8 40,5 L40,10 L0,10 Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                                    backgroundSize: '40px 100%',
                                    animation: 'wave-flow 1.2s linear infinite',
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Water Intake Tip */}
                <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/30 text-xs text-slate-700 flex items-start gap-2.5 mt-1">
                    <span className="text-sm mt-0.5">💡</span>
                    <p className="leading-relaxed font-bold text-slate-700">
                        <strong className="text-blue-900 font-black">Tip:</strong> Measuring the water in a cup first before putting it on a bowl is more accurate.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MealsTracker;
