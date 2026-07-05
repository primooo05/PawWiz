import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { MealLog } from '../../../../hooks/features/useDietRecommender';

interface MealsTrackerProps {
    loggedMeals: MealLog[];
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
    onEditMeal,
    onAddMeal,
    onUndoSkip,
    catName = 'Your cat',
}) => {
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
                                    className="border-2 border-slate-900 rounded-b-2xl rounded-tr-2xl p-4 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col gap-3 min-h-[110px] transition-colors -mt-[2px] w-full"
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
                                                        <span className="text-slate-900 capitalize">{meal.foodType === 'dry' ? 'Kibble' : meal.foodType === 'wet' ? 'Wet Food' : 'Mixed Food'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Amount:</span>
                                                        <span className="text-slate-900">{meal.amount} {meal.unit}{meal.amount !== 1 ? 's' : ''}</span>
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
        </div>
    );
};

export default MealsTracker;
