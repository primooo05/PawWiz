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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <span className="mr-2">🥗</span> Diet Planner
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Weight:</span>
              <span className="font-bold text-[#2ec4b6]">{weight.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full accent-[#2ec4b6]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Age:</span>
              <span className="font-bold text-[#2ec4b6]">{age} years</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full accent-[#2ec4b6]"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 block">Activity Level:</span>
            <div className="flex gap-2">
              {(['sedentary', 'moderate', 'active'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActivity(lvl)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    activity === lvl
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6]'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 block">Health Conditions:</span>
            <div className="grid grid-cols-2 gap-2">
              {['Renal Disease', 'Obesity', 'Diabetes', 'Urinary Crystals', 'Sensitive Stomach'].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`py-1.5 px-2.5 text-left text-[10px] font-medium rounded-lg border transition-all truncate ${
                    selectedConditions.includes(cond)
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6]'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
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
            className="w-full bg-[#2ec4b6] hover:bg-[#259b90] text-white font-bold py-2.5 rounded-xl text-xs uppercase"
          >
            {dietLoading ? 'Calculating...' : 'Generate Plan'}
          </button>
        </div>

        {dietPlan && (
          <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between font-bold border-b pb-2 text-slate-800">
              <span>Targets</span>
              <span className="text-[#2ec4b6]">{dietPlan.dailyCalories} Kcal / day</span>
            </div>
            <p className="leading-relaxed"><strong>Split:</strong> P: {dietPlan.macronutrientSplit.proteinPercent}% / F: {dietPlan.macronutrientSplit.fatPercent}% / C: {dietPlan.macronutrientSplit.carbsPercent}%</p>
            <p className="leading-relaxed"><strong>Rationale:</strong> {dietPlan.dietRationale}</p>
            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">Avoid list:</span>
              <p>{dietPlan.avoidFoods.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
