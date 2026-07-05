import React, { useState, useEffect } from 'react';

interface WaterTrackerProps {
    waterIntake: number;
    waterTarget: number;
    addWater: (amount: number) => void;
    resetWater: () => void;
    catName?: string;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
    waterIntake,
    waterTarget,
    addWater,
    resetWater,
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

    return (
        <div className="p-6 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col gap-4 w-full animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rotate-45" />
                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Hydration Tracker</span>
            </div>

            {localWater >= waterTarget && (
                <div className="bg-[#40C48E]/10 border border-[#40C48E] text-[#1b5c3e] rounded-2xl p-3 text-xs font-black text-center flex items-center justify-center gap-2 animate-fadeIn">
                    All filled up! {catName} is perfectly taken care of, thanks to you.
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{localWater} ml</span>
                    <span className="text-xs font-bold text-slate-400">/ {waterTarget} ml daily target</span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        resetWater();
                        setLocalWater(0);
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                    Reset
                </button>
            </div>

            <div className="flex items-center gap-3 w-full">
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
            <div className="w-full bg-slate-100 border-2 border-slate-900 h-5 rounded-full overflow-hidden relative">
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
            <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/30 text-xs text-slate-700 flex items-start gap-2.5">
                <span className="text-sm mt-0.5">💡</span>
                <p className="leading-relaxed font-bold text-slate-700">
                    <strong className="text-blue-900 font-black">Tip:</strong> Measuring the water in a cup first before putting it on a bowl is more accurate.
                </p>
            </div>
        </div>
    );
};

export default WaterTracker;
