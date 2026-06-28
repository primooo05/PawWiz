import React from 'react';
import type { AgeBracketDetails } from '../../hooks/useDietRecommender';
import ConfirmationDialog from '../modals/ConfirmationDialog';

interface DietDashboardViewProps {
    weight: number;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult';
    lifeStage: 'kitten' | 'adult';
    age: number;
    ageBracketInfo: AgeBracketDetails;
    onReset: () => void;
}

export const DietDashboardView: React.FC<DietDashboardViewProps> = ({
    weight,
    foodPreference,
    isSpayedNeutered,
    activeLifeStage,
    lifeStage,
    age,
    ageBracketInfo,
    onReset,
}) => {
    const [isConfirmResetOpen, setIsConfirmResetOpen] = React.useState(false);

    // Nutrition formulas
    const rer = Math.round(70 * Math.pow(weight, 0.75));
    const factor = activeLifeStage === 'kitten' ? 2.5 : isSpayedNeutered ? 1.2 : 1.4;
    const dailyCalories = Math.round(rer * factor);

    // Portions estimate
    // Dry kibble: ~3.8 kcal/g. Wet food: ~0.85 kcal/g.
    const dryGrams = Math.round(dailyCalories / 3.8);
    const wetGrams = Math.round(dailyCalories / 0.85);

    const getOptimalPortionMessage = () => {
        if (foodPreference === 'dry') {
            const cups = (dryGrams / 120).toFixed(1);
            return `${dryGrams}g of dry kibble daily (approx. ${cups} cups).`;
        } else if (foodPreference === 'wet') {
            const cans = (wetGrams / 85).toFixed(1);
            const spoons = (wetGrams / 15).toFixed(1);
            return `${wetGrams}g of wet food daily (approx. ${cans} cans or ${spoons} tablespoons).`;
        } else {
            // Mixed: 50% dry calories, 50% wet calories
            const halfDry = Math.round((dailyCalories * 0.5) / 3.8);
            const halfWet = Math.round((dailyCalories * 0.5) / 0.85);
            const dryCups = (halfDry / 120).toFixed(1);
            const wetCans = (halfWet / 85).toFixed(1);
            const wetSpoons = (halfWet / 15).toFixed(1);
            return `${halfDry}g dry kibble (approx. ${dryCups} cups) + ${halfWet}g wet food (approx. ${wetCans} cans or ${wetSpoons} tablespoons) daily.`;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">
            {/* Left Column: Cat Profile Details Card */}
            <div className="p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cat Profile</h2>
                    <button
                        type="button"
                        onClick={() => setIsConfirmResetOpen(true)}
                        className="text-xs font-black text-teal-500 hover:text-teal-600 cursor-pointer active:scale-95 transition-transform"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="w-24 h-24 bg-teal-50 border-2 border-slate-900 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    🐈
                </div>

                {/* Profile Stats */}
                <div className="w-full space-y-4 text-left">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Age</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 capitalize">
                            {age} {lifeStage === 'kitten' ? (age === 1 ? 'month' : 'months') : (age === 1 ? 'year' : 'years')}
                        </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Weight</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{weight.toFixed(1)} kg</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Life Stage</p>
                        <p className="text-sm font-black text-slate-800 capitalize mt-0.5">{activeLifeStage}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Neutered / Spayed</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{isSpayedNeutered ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Diet Plan Dashboard */}
            <div className="flex flex-col gap-6 w-full">
                {/* 1. Main Recommendation Banner */}
                <div className="p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-teal-100/30 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#40C48E] rotate-45" />
                        <span className="text-[10px] font-black tracking-widest text-[#40C48E] uppercase">Feeding Guideline</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{ageBracketInfo.bracket}</h3>
                    <p className="text-xs text-slate-500 font-bold mb-6">Based on detected age and lifecycle stage.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl">
                            <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block mb-1">Recommended Food</span>
                            <span className="text-sm font-black text-slate-900 leading-tight">{ageBracketInfo.recommendedFood}</span>
                        </div>

                        <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl">
                            <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider block mb-1">Feeding Frequency</span>
                            <span className="text-sm font-black text-slate-900 leading-tight">{ageBracketInfo.frequency}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Daily Energy & Portion Calculator */}
                <div className="p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rotate-45" />
                        <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Portion & Energy targets</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center sm:text-left">
                        <div className="p-4 bg-[#F2FBF9] rounded-[1.25rem]">
                            <p className="text-[10px] font-bold text-teal-800/70 mb-1 uppercase tracking-widest">Base Energy (RER)</p>
                            <p className="text-xl font-black text-teal-900">{rer} kcal/day</p>
                        </div>
                        <div className="p-4 bg-[#FFFDF0] rounded-[1.25rem]">
                            <p className="text-[10px] font-bold text-yellow-800/70 mb-1 uppercase tracking-widest">Daily Target (DER)</p>
                            <p className="text-xl font-black text-yellow-900">{dailyCalories} kcal/day</p>
                        </div>
                        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-[1.25rem]">
                            <p className="text-[10px] font-bold text-indigo-800 mb-1 uppercase tracking-widest">Multiplier Factor</p>
                            <p className="text-xl font-black text-indigo-950">{factor}x</p>
                        </div>
                    </div>

                    <hr className="border-slate-100 my-6" />

                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Daily Meal Portions ({foodPreference} preference)</h4>
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                            <p className="text-sm font-black text-slate-800 leading-snug">
                                {getOptimalPortionMessage()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 leading-relaxed">
                                *Note: Dry kibble estimates assume an energy density of 3.8 kcal/g. Wet food assumes 0.85 kcal/g. Adjust targets if your specific pet food package guidelines differ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isConfirmResetOpen}
                title="Edit Diet Profile?"
                message="Are you sure you want to edit your cat's diet profile? This will reset the recommendations."
                confirmText="Edit"
                cancelText="Cancel"
                onConfirm={() => {
                    setIsConfirmResetOpen(false);
                    onReset();
                }}
                onCancel={() => setIsConfirmResetOpen(false)}
            />
        </div>
    );
};

export default DietDashboardView;
