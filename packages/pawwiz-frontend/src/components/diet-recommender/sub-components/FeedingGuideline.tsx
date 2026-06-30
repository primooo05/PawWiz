import React from 'react';
import type { AgeBracketDetails } from '../../../hooks/useDietRecommender';

interface FeedingGuidelineProps {
    ageBracketInfo: AgeBracketDetails;
}

export const FeedingGuideline: React.FC<FeedingGuidelineProps> = ({ ageBracketInfo }) => {
    return (
        <div className="p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] relative overflow-hidden flex flex-col gap-4 w-full">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45" />
                    <span className="text-[10px] font-black tracking-widest text-[#2ec4b6] uppercase">Feeding Guideline</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">{ageBracketInfo.bracket}</h3>
                <p className="text-xs text-slate-500 font-bold">Based on detected age and lifecycle stage.</p>
            </div>

            {/* Chips list formatted in 2 columns (side-by-side) */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block mb-1">Recommended Food</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{ageBracketInfo.recommendedFood}</span>
                </div>

                <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider block mb-1">Feeding Frequency</span>
                    <span className="text-xs sm:text-sm font-black text-slate-905 leading-snug">{ageBracketInfo.frequency}</span>
                </div>
            </div>
        </div>
    );
};

export default FeedingGuideline;
