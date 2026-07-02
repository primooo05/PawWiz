import React from 'react';
import { getFelineFeedingGuideDetails } from '../../../hooks/useDietRecommender';

interface FeedingGuidelineProps {
    lifeStage: 'kitten' | 'adult' | 'senior';
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
}

export const FeedingGuideline: React.FC<FeedingGuidelineProps> = ({
    lifeStage,
    weight,
    isKg,
    foodPreference,
}) => {
    const weightInKg = isKg ? weight : weight * 0.45359237;
    const guide = getFelineFeedingGuideDetails(lifeStage, weightInKg, foodPreference);

    return (
        <div className="p-6 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] relative overflow-hidden flex flex-col gap-4 w-full animate-fadeIn">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45" />
                    <span className="text-[10px] font-black tracking-widest text-[#2ec4b6] uppercase">Feeding Guideline</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">
                    {lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1)}: {guide.condition}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Based on weight condition and food preference.</p>
            </div>

            {/* Chips list formatted in 2 columns (side-by-side) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block mb-1">Daily Total Spoons</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{guide.dailySpoons}</span>
                </div>

                <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider block mb-1">Portion PER MEAL</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{guide.portionPerMeal}</span>
                </div>
            </div>

            <div className="text-xs leading-relaxed text-slate-700 border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-sm">🕒</span>
                    <div>
                        <strong className="text-blue-900 font-extrabold block text-[9px] uppercase tracking-wider leading-none mb-1">Feeding Frequency</strong>
                        <span className="font-black text-slate-900 leading-none">{guide.frequency}</span>
                    </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <span className="text-sm mt-0.5">💡</span>
                    <div>
                        <strong className="text-amber-900 font-extrabold block text-[9px] uppercase tracking-wider leading-none mb-1">Measurement Tip</strong>
                        <span className="font-black text-slate-900 leading-snug">0.25 spoon = ~1 tsp &bull; 0.50 spoon = ~1.5 tsp &bull; 0.75 spoon = ~2 tsp</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedingGuideline;
