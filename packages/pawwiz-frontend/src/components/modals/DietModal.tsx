import type { DietPlan } from '../../../../pawwiz-backend/src/types/shared.js';
import { useDietPlanner } from '../../hooks/useDietPlanner';

interface DietModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DietModal({ isOpen, onClose }: DietModalProps) {
  const {
    isKg, weight, setWeight, age, setAge,
    activity, setActivity,
    selectedConditions, customCondition, setCustomCondition,
    dietPlan, dietLoading, isPreviewMode,
    toggleCondition, toggleUnit, handleCalculateDiet,
  } = useDietPlanner();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Outer Card (Non-scrollable, rounds corners, overflow hidden) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full border border-slate-200/60 shadow-2xl relative animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors z-20"
        >
          ✕
        </button>
        
        {/* Inner Scrollable Container (Padded inside the rounded outer card) */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8 pr-4 md:pr-6">
          {/* Enhanced Header with Eyebrow Tag */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45 flex-shrink-0" />
              <span className="text-[10px] font-black tracking-[0.25em] text-[#2ec4b6] uppercase">
                NUTRITION OPTIMIZATION
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Diet Planner
            </h3>
          </div>

          <div className="space-y-6">
            {/* Weight Slider with Toggle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Weight:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#2ec4b6]">
                    {isKg 
                      ? (weight >= 13 ? "13.0+ kg" : `${weight.toFixed(1)} kg`) 
                      : (weight >= 28.6 ? "28.6+ lbs" : `${weight.toFixed(1)} lbs`)
                    }
                  </span>
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => toggleUnit(true)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${isKg ? 'bg-[#2ec4b6] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUnit(false)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${!isKg ? 'bg-[#2ec4b6] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={isKg ? "1" : "2.2"}
                max={isKg ? "13" : "28.6"}
                step={isKg ? "0.1" : "0.2"}
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
              />
            </div>

            {/* Age Slider */}
            <div className="space-y-3">
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
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
              />
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Activity Level:</span>
              <div className="flex gap-2">
                {(['sedentary', 'moderate', 'active'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setActivity(lvl)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl capitalize border transition-all cursor-pointer ${
                      activity === lvl
                        ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              
              {activity && (
                <p className="text-[11px] text-slate-500 font-medium italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/40">
                  {activity === 'sedentary' && "Sedentary: Mainly indoors, sleeps most of the day, low active play."}
                  {activity === 'moderate' && "Moderate: Typical indoor cat, active play sessions, normal energy."}
                  {activity === 'active' && "Active: High energy, outdoor explorer, constant active play / zoomies."}
                </p>
              )}
            </div>

            {/* Health Conditions List */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Health Conditions:</span>
              <div className="grid grid-cols-2 gap-2">
                {['Renal Disease', 'Obesity', 'Diabetes', 'Urinary Crystals', 'Sensitive Stomach'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`py-3 px-3 text-left text-[11px] font-bold rounded-xl border transition-all truncate cursor-pointer ${
                      selectedConditions.includes(cond)
                        ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {selectedConditions.includes(cond) ? '✓ ' : '+ '} {cond}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2 mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Other Condition (Not Listed):</span>
                <input
                  type="text"
                  placeholder="e.g. Hyperthyroidism, Arthritis"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#2ec4b6] focus:bg-white text-slate-700 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateDiet}
              disabled={dietLoading || !activity}
              className={`w-full font-extrabold py-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer ${
                !activity 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#2ec4b6] hover:bg-[#259b90] text-white'
              }`}
            >
              {dietLoading ? 'Calculating...' : !activity ? 'Select Activity First' : 'Generate Plan'}
            </button>
          </div>

          {dietPlan && (
            <div className="mt-8 relative">
              {isPreviewMode ? (
                <>
                  {/* Blurred Content: Calories, Macros, and empty slots */}
                  <div className="filter blur-sm pointer-events-none select-none opacity-20 space-y-5 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200/60">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-extrabold border-b border-slate-200 pb-3">
                        <span className="text-slate-600 text-sm">Target Calories:</span>
                        <span className="text-[#2ec4b6] font-black text-lg">{dietPlan.dailyCalories} Kcal/day</span>
                      </div>
        
                      <div className="space-y-2">
                        <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block">Macronutrient Split:</span>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                            <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.proteinPercent}%</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Protein</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                            <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.fatPercent}%</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Fats</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                            <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.carbsPercent}%</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Carbs</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Foods:</div>
                      <div className="text-sm text-slate-600">High-protein canned wet food, Premium salmon treats</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feeding Schedule:</div>
                      <div className="text-sm text-slate-600">Three scheduled portions daily with optimal timing</div>
                    </div>
                  </div>
  
                  {/* Signup Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl border border-[#e9c46a]/20 z-10 -translate-y-2">
                    <div className="text-center space-y-3 p-4">
                      <div className="text-sm font-extrabold text-slate-900">Get Full Meal Planning</div>
                      <div className="text-xs text-slate-600 max-w-[220px] mx-auto">Detailed calorie targets, custom food recommendations, and health plans</div>
                      <button className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 font-bold px-6 py-2.5 rounded-full text-xs tracking-wider transition-all shadow-sm">
                        Sign Up for Free
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Full Content for Authenticated Users (Unblurred) */
                <div className="space-y-5 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200/60">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-extrabold border-b border-slate-200 pb-3">
                      <span className="text-slate-600 text-sm">Target Calories:</span>
                      <span className="text-[#2ec4b6] font-black text-lg">{dietPlan.dailyCalories} Kcal/day</span>
                    </div>
      
                    <div className="space-y-2">
                      <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block">Macronutrient Split:</span>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                          <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.proteinPercent}%</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Protein</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                          <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.fatPercent}%</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Fats</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/40">
                          <div className="text-lg font-black text-slate-900">{dietPlan.macronutrientSplit.carbsPercent}%</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Carbs</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div>
                      <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2">Recommended Foods:</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{(dietPlan as DietPlan).recommendedFoods?.join(', ')}</p>
                    </div>
    
                    <div>
                      <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2">Feeding Schedule:</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{(dietPlan as DietPlan).feedingSchedule}</p>
                    </div>
    
                    <div>
                      <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2">Rationale:</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{(dietPlan as DietPlan).dietRationale}</p>
                    </div>
    
                    <div className="border-t border-slate-200 pt-3">
                      <span className="text-rose-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Items to Avoid:</span>
                      <p className="text-rose-600 font-medium text-sm leading-relaxed">{(dietPlan as DietPlan).avoidFoods?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
