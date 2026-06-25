import { useState } from 'react';
import type { DietPlan } from '../../../../pawwiz-backend/src/types/shared.js';

interface DietModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export default function DietModal({ isOpen, onClose, apiBase }: DietModalProps) {
  const [weight, setWeight] = useState<number>(4.5);
  const [age, setAge] = useState<number>(3);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [dietLoading, setDietLoading] = useState(false);

  if (!isOpen) return null;

  const handleCalculateDiet = async () => {
    setDietLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: weight,
          ageYears: age,
          activityLevel: activity,
          healthConditions: selectedConditions.length > 0 ? selectedConditions : ['none'],
        }),
      });
      if (!response.ok) throw new Error('Diet calculation failed.');
      const data = await response.json();
      setDietPlan(data);
    } catch (err) {
      setDietPlan({
        dailyCalories: Math.round(70 * Math.pow(weight, 0.75) * (activity === 'active' ? 1.4 : 1.1)),
        macronutrientSplit: { proteinPercent: 45, fatPercent: 35, carbsPercent: 20 },
        recommendedFoods: ["High-protein canned wet food (chicken/salmon)", "Hydration treats"],
        avoidFoods: ["Grapes", "Onion/Garlic", "Chocolate"],
        feedingSchedule: "Provide three scheduled small portions daily.",
        dietRationale: "Calculated via offline fallback. High-moisture foods suggested."
      });
    } finally {
      setDietLoading(false);
    }
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full border border-slate-200/60 shadow-2xl p-6 md:p-8 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors"
        >
          ✕
        </button>
        <h3 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center">
          <span className="mr-2">🥗</span> Diet Planner
        </h3>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Weight:</span>
              <span className="font-extrabold text-[#2ec4b6]">{weight.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Age:</span>
              <span className="font-extrabold text-[#2ec4b6]">{age} years</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Activity Level:</span>
            <div className="flex gap-2">
              {(['sedentary', 'moderate', 'active'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActivity(lvl)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize border transition-all cursor-pointer ${
                    activity === lvl
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Health Conditions:</span>
            <div className="grid grid-cols-2 gap-2">
              {['Renal Disease', 'Obesity', 'Diabetes', 'Urinary Crystals', 'Sensitive Stomach'].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`py-2 px-3 text-left text-[11px] font-bold rounded-xl border transition-all truncate cursor-pointer ${
                    selectedConditions.includes(cond)
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {selectedConditions.includes(cond) ? '✓ ' : '+ '} {cond}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculateDiet}
            disabled={dietLoading}
            className="w-full bg-[#2ec4b6] hover:bg-[#259b90] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer mt-2"
          >
            {dietLoading ? 'Calculating...' : 'Generate Plan'}
          </button>
        </div>

        {dietPlan && (
          <div className="mt-6 space-y-4 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800/80 text-xs animate-fadeIn">
            <div className="flex justify-between font-extrabold border-b border-slate-800 pb-3 text-sm">
              <span className="text-slate-400">Target Calories:</span>
              <span className="text-[#2ec4b6] font-black">{dietPlan.dailyCalories} Kcal / day</span>
            </div>
            <p className="leading-relaxed">
              <strong className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Macronutrient Split:</strong>
              <span className="font-semibold">Protein: {dietPlan.macronutrientSplit.proteinPercent}% / Lipids: {dietPlan.macronutrientSplit.fatPercent}% / Carbs: {dietPlan.macronutrientSplit.carbsPercent}%</span>
            </p>
            <p className="leading-relaxed">
              <strong className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Rationale:</strong>
              <span className="text-slate-300 font-medium">{dietPlan.dietRationale}</span>
            </p>
            <div className="space-y-1">
              <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px] block">Items to Strictly Avoid:</span>
              <p className="text-rose-300 font-medium leading-relaxed">{dietPlan.avoidFoods.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
