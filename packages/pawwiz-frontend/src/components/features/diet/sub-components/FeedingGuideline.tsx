import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFelineFeedingGuideDetails } from '../../../../hooks/features/useDietRecommender';
import type { FoodType } from '../../../../lib/foods';

interface FeedingGuidelineProps {
    lifeStage: 'kitten' | 'adult' | 'senior';
    weight: number;
    isKg: boolean;
    foodPreference: FoodType;
}

export const FeedingGuideline: React.FC<FeedingGuidelineProps> = ({
    lifeStage,
    weight,
    isKg,
    foodPreference,
}) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const weightInKg = isKg ? weight : weight * 0.45359237;
    const guide = getFelineFeedingGuideDetails(lifeStage, weightInKg, foodPreference);

    // Daily water target (kitten: ~70ml per kg; adult/senior: ~50ml per kg) —
    // mirrors the formula used by the water intake tracker so numbers stay consistent.
    const waterTarget = lifeStage === 'kitten'
        ? Math.round(weightInKg * 70)
        : Math.round(weightInKg * 50);

    return (
        <div className="p-6 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] relative overflow-hidden flex flex-col gap-4 w-full animate-fadeIn">
            {/* Info Button — top-right corner of the card */}
            <button
                type="button"
                onClick={() => setIsInfoOpen(true)}
                aria-label="More info about feeding and hydration guidelines"
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-[#2ec4b6] hover:bg-teal-50 transition-colors cursor-pointer"
            >
                <Info size={16} strokeWidth={2.5} />
            </button>

            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45" />
                    <span className="text-[10px] font-black tracking-widest text-[#2ec4b6] uppercase">Recommended Diet Guideline</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 pr-8">
                    {lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1)}: {guide.condition}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Based on weight condition and food preference.</p>
            </div>

            {/* Chips list formatted in 3 columns (food + hydration side-by-side) */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block mb-1">Daily Portion</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{guide.dailySpoons}</span>
                </div>

                <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider block mb-1">Portion PER MEAL</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{guide.portionPerMeal}</span>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block mb-1">Daily Water Target</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{waterTarget} ml</span>
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

            {/* Info Modal: full feeding + hydration guideline explainer */}
            <AnimatePresence>
                {isInfoOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                            onClick={() => setIsInfoOpen(false)}
                        />
                        <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: 'spring', duration: 0.4 }}
                                className="bg-white border-2 border-slate-900 rounded-[2rem] max-w-md w-full p-6 shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto max-h-[85vh] overflow-y-auto"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <h3 className="text-lg font-black text-slate-900">Feeding &amp; Hydration Guidelines</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsInfoOpen(false)}
                                        aria-label="Close"
                                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="space-y-4 text-xs text-slate-700">
                                    <div>
                                        <strong className="text-teal-900 font-extrabold block text-[10px] uppercase tracking-wider mb-1.5">Feeding Basics</strong>
                                        <ul className="list-disc list-inside space-y-1 font-bold leading-relaxed">
                                            <li>Daily portions are calculated from your cat's weight, life stage, and food preference.</li>
                                            <li>Split total daily food across the recommended feeding frequency rather than one large meal.</li>
                                            <li>0.25 spoon &asymp; 1 tsp &bull; 0.50 spoon &asymp; 1.5 tsp &bull; 0.75 spoon &asymp; 2 tsp.</li>
                                            <li>Re-check portions whenever weight, age bracket, or food type changes.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong className="text-blue-900 font-extrabold block text-[10px] uppercase tracking-wider mb-1.5">Hydration Basics</strong>
                                        <ul className="list-disc list-inside space-y-1 font-bold leading-relaxed">
                                            <li>Kittens need roughly 60&ndash;80 ml of water per kg of body weight daily; adults and seniors need roughly 50 ml per kg.</li>
                                            <li>Wet food already contains ~70&ndash;80% moisture, so it naturally supports hydration alongside drinking water.</li>
                                            <li>Kibble-only diets provide very little moisture &mdash; always keep fresh water available.</li>
                                            <li>Keep water bowls away from litter boxes and food, and refresh the water daily to encourage drinking.</li>
                                        </ul>
                                    </div>

                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                                        These guidelines are general recommendations. Always consult your veterinarian for advice specific to your cat's health.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeedingGuideline;
