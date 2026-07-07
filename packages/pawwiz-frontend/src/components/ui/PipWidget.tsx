import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDietRecommender } from '../../hooks/features/useDietRecommender';
import { Sliders, X, Monitor } from 'lucide-react';

export default function PipWidget() {
  const { profiles, activeProfile, switchProfile, addMeal, skipMeal, resetMealLog, addWater } = useDietRecommender();
  const [isOpen, setIsOpen] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [settingsMode, setSettingsMode] = useState(false);
  const [customWaterGoal, setCustomWaterGoal] = useState<number | null>(null);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<string>('dry');
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<'spoon' | 'gram' | 'cup'>('spoon');
  const [localWater, setLocalWater] = useState(0);

  useEffect(() => {
    if (activeProfile) {
      setLocalWater(activeProfile.waterIntake);
    }
  }, [activeProfile?.waterIntake]);

  const pipWindowRef = useRef<Window | null>(null);

  // Sync ref to access closed handler correctly
  useEffect(() => {
    pipWindowRef.current = pipWindow;
  }, [pipWindow]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
    Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyleEl = targetDoc.createElement('style');
          Array.from(styleSheet.cssRules).forEach((cssRule) => {
            newStyleEl.appendChild(targetDoc.createTextNode(cssRule.cssText));
          });
          targetDoc.head.appendChild(newStyleEl);
        } else if (styleSheet.href) {
          const newLinkEl = targetDoc.createElement('link');
          newLinkEl.rel = 'stylesheet';
          newLinkEl.href = styleSheet.href;
          targetDoc.head.appendChild(newLinkEl);
        }
      } catch (e) {
        if (styleSheet.href) {
          const newLinkEl = targetDoc.createElement('link');
          newLinkEl.rel = 'stylesheet';
          newLinkEl.href = styleSheet.href;
          targetDoc.head.appendChild(newLinkEl);
        }
      }
    });
  };

  const handleTogglePip = async () => {
    if (isOpen) {
      if (pipWindow) {
        pipWindow.close();
      }
      setIsOpen(false);
      setPipWindow(null);
      return;
    }

    if ('documentPictureInPicture' in window) {
      try {
        // Request floating Picture-in-Picture window
        const win = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 380,
        });

        // Set title
        win.document.title = 'PawWiz Companion';

        // Copy styles
        copyStyles(document, win.document);

        // Add a class on body to styled/reset base elements in child window
        win.document.body.className = 'bg-[#FAFAFA] m-0 p-0 overflow-hidden';

        // Listen for close/pagehide
        win.addEventListener('pagehide', () => {
          setIsOpen(false);
          setPipWindow(null);
        });

        setPipWindow(win);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to open Picture-in-Picture window:', err);
        // Fallback to in-app modal
        setIsOpen(true);
      }
    } else {
      // In-app fallback for non-supported browsers
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    if (pipWindow) {
      pipWindow.close();
    }
    setIsOpen(false);
    setPipWindow(null);
  };

  const handleLogClick = (mealId: string) => {
    const defaultFood = activeProfile?.foodPreference || 'mixed';
    setEditingMealId(mealId);
    setSelectedFood(defaultFood);
    setSelectedAmount(1);
    setSelectedUnit('spoon');
  };

  const handleConfirmLog = (mealId: string) => {
    addMeal(mealId, selectedFood, selectedAmount, selectedUnit);
    setEditingMealId(null);
  };

  const handleSkipMeal = (mealId: string) => {
    skipMeal(mealId);
  };

  const handleResetMeal = (mealId: string) => {
    resetMealLog(mealId);
  };


  const handleSliderRelease = () => {
    const diff = localWater - (activeProfile?.waterIntake ?? 0);
    if (diff !== 0) {
      addWater(diff);
    }
  };

  const handleResetWater = () => {
    if (activeProfile?.waterIntake) {
      addWater(-activeProfile.waterIntake);
      setLocalWater(0);
    }
  };

  const weightKg = activeProfile
    ? activeProfile.isKg
      ? activeProfile.weight
      : activeProfile.weight / 2.205
    : 0;

  const defaultWaterGoal = weightKg > 0 ? Math.round(weightKg * 50) : 250;
  const waterGoal = customWaterGoal ?? defaultWaterGoal;
  const waterIntake = activeProfile?.waterIntake ?? 0;

  // Inner interactive layout to render inside portal or fallback card
  const widgetContent = (
    <div className="p-4 bg-white min-h-screen text-slate-800 flex flex-col justify-between font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setSettingsMode(!settingsMode)}
          className={`p-2 border-2 border-slate-900 rounded-xl transition-all shadow-[1.5px_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0_0_#1a1a1a] ${
            settingsMode ? 'bg-[#FFB870]' : 'bg-white hover:bg-slate-50'
          }`}
          title="Toggle companion settings"
        >
          <Sliders className="w-4 h-4 text-slate-900" />
        </button>

        <div className="flex items-center gap-2">
          {/* Overlapping Cat Avatars */}
          <div className="flex -space-x-2">
            {profiles.slice(0, 3).map((p) => {
              const isActive = p.id === activeProfile?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchProfile(p.id)}
                  className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all hover:scale-110 relative ${
                    isActive ? 'border-emerald-500 scale-105 z-10' : 'border-slate-900 bg-white'
                  }`}
                  title={`Switch to ${p.name}`}
                >
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400 border border-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {!pipWindow && (
            <button
              onClick={handleClose}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              title="Close companion"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {settingsMode ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#15AFB4] mb-3">Goal Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  DAILY WATER TARGET
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={waterGoal}
                    onChange={(e) => setCustomWaterGoal(Math.max(50, Number(e.target.value)))}
                    className="w-24 px-2 py-1.5 border-2 border-slate-900 rounded-xl text-xs font-black shadow-[1.5px_2px_0_0_#1a1a1a]"
                  />
                  <span className="text-xs font-bold text-slate-500">ml</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                Calorie targets are calculated using dynamic profiles from the database based on active cat age and life stage.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsMode(false)}
            className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-800 transition-all border-2 border-slate-900 shadow-[2px_3px_0_0_#000] active:translate-y-[2px] active:shadow-none mt-4 cursor-pointer"
          >
            Back to Companion
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Active Cat Overview */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-wide text-slate-900">
                {activeProfile?.name || 'No Cat Selected'}
              </span>
              {activeProfile?.lifeStage && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#e6faf8] text-[#2ec4b6] rounded-full border-2 border-slate-900 shadow-[1px_1px_0_0_#1a1a1a]">
                  {activeProfile.lifeStage}
                </span>
              )}
            </div>
          </div>

          {/* Meals Quick-Log */}
          <div className="space-y-2 mb-3">
            {activeProfile?.loggedMeals.map((m) => {
              const isLogged = m.status === 'logged';
              const isSkipped = m.status === 'skipped';
              const isEditing = editingMealId === m.id;

              if (isEditing) {
                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-2 p-2 border-2 border-slate-900 rounded-xl bg-slate-50 shadow-[1.5px_2px_0_0_#1a1a1a]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">{m.mealName}</span>
                      <button
                        onClick={() => setEditingMealId(null)}
                        className="text-[10px] text-rose-500 font-black uppercase hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={selectedFood}
                        onChange={(e) => setSelectedFood(e.target.value)}
                        className="px-1.5 py-1 border-2 border-slate-900 rounded-lg text-[9px] font-black bg-white"
                      >
                        <option value="dry">Dry Kibble</option>
                        <option value="wet">Wet Food</option>
                        <option value="mixed">Mixed</option>
                        <option value="chicken">Chicken</option>
                        <option value="chicken_thigh">Thigh</option>
                        <option value="fish">Fish</option>
                        <option value="egg">Egg</option>
                        <option value="other">Custom</option>
                      </select>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="any"
                          value={selectedAmount}
                          onChange={(e) => setSelectedAmount(Number(e.target.value))}
                          className="w-10 px-1 py-1 border-2 border-slate-900 rounded-lg text-[9px] font-black text-center bg-white"
                        />
                        <select
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value as any)}
                          className="flex-1 px-1 py-1 border-2 border-slate-900 rounded-lg text-[9px] font-black bg-white"
                        >
                          <option value="spoon">spoon</option>
                          <option value="gram">g</option>
                          <option value="cup">cup</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfirmLog(m.id)}
                      className="w-full py-1 bg-[#4ECDC4] hover:bg-[#3ebeb5] text-slate-900 text-[9px] font-black uppercase rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_#000] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Confirm Log
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 border-2 border-slate-900 rounded-xl bg-white shadow-[1.5px_2px_0_0_#1a1a1a]"
                >
                  <span className="text-xs font-black text-slate-850">{m.mealName}</span>

                  <div className="flex items-center gap-1.5">
                    {isLogged ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {m.kcal} kcal
                      </span>
                    ) : isSkipped ? (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        Skipped
                      </span>
                    ) : null}

                    <div className="flex gap-1">
                      {m.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleLogClick(m.id)}
                            className="px-2 py-1 bg-[#4ECDC4] hover:bg-[#3ebeb5] text-slate-900 text-[9px] font-black uppercase rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_#000] active:translate-y-[1px] active:shadow-none cursor-pointer"
                          >
                            Log
                          </button>
                          <button
                            onClick={() => handleSkipMeal(m.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black uppercase rounded-lg border-2 border-slate-900 shadow-[1px_1px_0_0_#000] active:translate-y-[1px] active:shadow-none cursor-pointer"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleResetMeal(m.id)}
                          className="px-1.5 py-0.5 text-rose-500 hover:bg-rose-50 text-[9px] font-black uppercase rounded border border-rose-200 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Water Tracker */}
          <div className="border-t-2 border-slate-200/60 pt-3 flex flex-col gap-2">
            {/* Header Title */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                ✦ Hydration Tracker
              </span>
            </div>

            {/* Banner when full */}
            {waterIntake >= waterGoal && (
              <div className="px-3 py-1.5 bg-[#e6faf2] border-2 border-emerald-500 rounded-xl text-[9px] font-extrabold text-emerald-800 text-center shadow-[1px_1.5px_0_0_#10b981]">
                All filled up! {activeProfile?.name || 'Your cat'} is perfectly taken care of, thanks to you.
              </div>
            )}

            {/* Target info and Reset button */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-slate-900">{localWater} ml</span>
                <span className="text-[9px] font-bold text-slate-400">/ {waterGoal} ml daily target</span>
              </div>
              
              {localWater > 0 && (
                <button
                  onClick={handleResetWater}
                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-slate-900 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-[1px_1.5px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Draggable range input */}
            <div className="flex items-center gap-3 w-full">
              <input
                type="range"
                min="0"
                max={waterGoal * 2}
                step="10"
                value={localWater}
                onChange={(e) => setLocalWater(parseInt(e.target.value, 10))}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Progress Bar (Neobrutalist blue water bar with animation) */}
            <div className="w-full h-3.5 border-2 border-slate-900 rounded-full bg-slate-100 overflow-hidden shadow-[1.5px_2px_0_0_#1a1a1a] relative">
              <style>{`
                @keyframes wave-flow {
                  0% { background-position-x: 0px; }
                  100% { background-position-x: 40px; }
                }
              `}</style>
              <div
                className="h-full bg-blue-500 transition-all duration-300 border-r-2 border-slate-900 relative overflow-hidden"
                style={{ width: `${Math.min(100, (localWater / waterGoal) * 100)}%` }}
              >
                {localWater > 0 && (
                  <div 
                    className="absolute inset-0 opacity-40 bg-repeat-x"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2500/svg' viewBox='0 0 40 10'%3E%3Cpath d='M0,5 C10,2 10,8 20,5 C30,2 30,8 40,5 L40,10 L0,10 Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                      backgroundSize: '40px 100%',
                      animation: 'wave-flow 1.2s linear infinite',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Info Tip */}
            <div className="p-2 bg-[#f4f8fd] border border-[#e0eaf5] rounded-xl text-[8px] leading-relaxed text-slate-500 font-bold flex gap-1 items-start">
              <span>💡</span>
              <span>Tip: Measuring the water in a cup first before putting it on a bowl is more accurate.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={handleTogglePip}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#FFB870] hover:bg-[#ffa74d] text-slate-900 rounded-full border-2 border-slate-900 shadow-[3px_4px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer transition-all"
        title="Open PawWiz Floating Companion"
      >
        <Monitor className="w-6 h-6" />
      </button>

      {/* Picture-in-Picture window portal */}
      {isOpen && pipWindow && createPortal(widgetContent, pipWindow.document.body)}

      {/* Fallback floating in-app card for non-supported browsers */}
      {isOpen && !pipWindow && (
        <div className="fixed bottom-24 right-6 z-40 w-85 h-96 border-2 border-slate-900 rounded-[2rem] shadow-[4px_5px_0_0_#000] bg-white overflow-hidden animate-fade-in-up">
          {widgetContent}
        </div>
      )}
    </>
  );
}
