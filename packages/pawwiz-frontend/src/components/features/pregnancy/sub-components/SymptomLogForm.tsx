import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { DailyLog } from '../../../../hooks/trackers/usePregnancyTracker.ts';
import ExposureSlider from '../../../ui/smoothui/exposure-slider/Temp.tsx';
import { Droplet, Palette, Scale, Moon, UtensilsCrossed, Home, Milk, Zap, Heart, Activity, VolumeX, Feather } from 'lucide-react';

const getSymptomsForWeek = (week: number) => {
    if (week <= 3) {
        return [
            { label: 'Nausea', icon: Droplet },
            { label: 'Nipple Changes', icon: Palette },
            { label: 'Weight Gain', icon: Scale },
            { label: 'Lethargy', icon: Moon },
        ];
    } else if (week <= 6) {
        return [
            { label: 'Weight Gain', icon: Scale },
            { label: 'Appetite Changes', icon: UtensilsCrossed },
            { label: 'Lethargy', icon: Moon },
            { label: 'Nipple Changes', icon: Palette },
        ];
    } else {
        return [
            { label: 'Nesting', icon: Home },
            { label: 'Milk Production', icon: Milk },
            { label: 'Contractions', icon: Zap },
            { label: 'Appetite Changes', icon: UtensilsCrossed },
        ];
    }
};

interface SymptomLogFormProps {
    isOpen: boolean;
    selectedDateStr: string | null;
    closeBottomSheet: () => void;
    elapsedDayForSelected: number | null;
    currentWeek: number;
    logs: Record<string, DailyLog>;
    saveLogForDate: (dateStr: string, log: DailyLog) => void;
    onDeleteLog: (dateStr: string) => void;
    setIsWeightPickerOpen: (open: boolean) => void;
    hasVetWarningForSelected: boolean;
    hasNauseaInEarlyWeeksForSelected: boolean;
    registeredWeight?: number;
}

export const SymptomLogForm: React.FC<SymptomLogFormProps> = ({
    isOpen,
    selectedDateStr,
    closeBottomSheet,
    elapsedDayForSelected,
    currentWeek,
    logs,
    saveLogForDate,
    onDeleteLog,
    setIsWeightPickerOpen,
    hasVetWarningForSelected,
    hasNauseaInEarlyWeeksForSelected,
    registeredWeight,
}) => {
    if (!selectedDateStr) return null;

    const [tempUnit, setTempUnit] = React.useState<'C' | 'F'>('C');
    const [draftLog, setDraftLog] = React.useState<DailyLog>({ symptoms: [], moods: [], symptomSeverities: {} });

    React.useEffect(() => {
        if (isOpen && selectedDateStr) {
            setDraftLog(logs[selectedDateStr] || { symptoms: [], moods: [], symptomSeverities: {} });
        }
    }, [isOpen, selectedDateStr, logs]);

    const activeLog = {
        symptoms: [],
        moods: [],
        symptomSeverities: {},
        ...draftLog
    };

    const selectedDateWeek = elapsedDayForSelected !== null ? Math.ceil(elapsedDayForSelected / 7) : currentWeek;
    const hasLog = !!(
        (activeLog.symptoms && activeLog.symptoms.length > 0) ||
        (activeLog.moods && activeLog.moods.length > 0) ||
        activeLog.weight !== undefined ||
        activeLog.temperature !== undefined
    );

    const handleSaveAndClose = () => {
        saveLogForDate(selectedDateStr, activeLog);
        closeBottomSheet();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                     {/* Backdrop */}
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 cursor-pointer"
                        onClick={handleSaveAndClose}
                    />

                    {/* Centered Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="w-full max-w-lg bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-8 max-h-[90vh] overflow-y-auto pointer-events-auto"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        {elapsedDayForSelected !== null
                                            ? `Pregnancy Day ${elapsedDayForSelected} (Week ${Math.ceil(elapsedDayForSelected / 7)})`
                                            : 'Log Entry'}
                                    </h4>
                                    <h3 className="text-xl font-black text-slate-900 mt-1">
                                        {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleSaveAndClose}
                                    className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold font-sans cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Symptoms Toggles */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                    Symptoms
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {getSymptomsForWeek(selectedDateWeek).map((symptom) => {
                                        const isSymptomLogged = activeLog.symptoms.includes(symptom.label);
                                        const SymptomIcon = symptom.icon;
                                        return (
                                            <button
                                                key={symptom.label}
                                                type="button"
                                                onClick={() => {
                                                    const currentSymptoms = activeLog.symptoms || [];
                                                    const nextSymptoms = isSymptomLogged
                                                        ? currentSymptoms.filter((s) => s !== symptom.label)
                                                        : [...currentSymptoms, symptom.label];
                                                    const nextSeverities = { ...(activeLog.symptomSeverities || {}) };
                                                    if (!isSymptomLogged) {
                                                        nextSeverities[symptom.label] = 'Mild';
                                                    } else {
                                                        delete nextSeverities[symptom.label];
                                                    }
                                                    setDraftLog({
                                                        ...activeLog,
                                                        symptoms: nextSymptoms,
                                                        symptomSeverities: nextSeverities,
                                                    });
                                                }}
                                                className={`flex flex-col items-center justify-center p-3 rounded-[1.5rem] transition-all duration-200 ease-out hover:scale-105 active:scale-95 border-2 cursor-pointer ${isSymptomLogged
                                                    ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                    : 'bg-[#F8FAFC] border-slate-100 text-slate-700 hover:border-teal-200'
                                                    }`}
                                            >
                                                <SymptomIcon aria-label={symptom.label} className="h-10 w-10 mb-1" strokeWidth={2} />
                                                <span className="text-[10px] font-black text-center leading-tight break-words max-w-full">{symptom.label}</span>
                                                {isSymptomLogged && (
                                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full mt-1 ${activeLog.symptomSeverities?.[symptom.label] === 'Severe'
                                                        ? 'bg-red-100 text-red-700'
                                                        : activeLog.symptomSeverities?.[symptom.label] === 'Moderate'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-teal-100 text-teal-700'
                                                        }`}>
                                                        {activeLog.symptomSeverities?.[symptom.label] || 'Mild'}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Vet Alert Warning */}
                            {hasVetWarningForSelected && (
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-start gap-3 animate-fadeIn">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <p className="text-xs font-black text-red-950 uppercase tracking-wider">Vet Attention Recommended</p>
                                        <p className="text-[10px] text-red-800 font-bold mt-1 leading-relaxed">
                                            {hasNauseaInEarlyWeeksForSelected
                                                ? "Severe nausea/vomiting in early pregnancy (Weeks 1-3) can signal complications like dehydration or infection. Please consider contacting a veterinarian immediately."
                                                : "One or more symptoms are marked as Severe. We recommend contacting your veterinarian to ensure Molly's safety."
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Severity Adjusters */}
                            {activeLog.symptoms && activeLog.symptoms.length > 0 && (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                        Adjust Severity
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {activeLog.symptoms.map((s) => {
                                            const currentSeverity = activeLog.symptomSeverities?.[s] || 'Mild';
                                            return (
                                                <div key={s} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-750">{s}</span>
                                                    <div className="flex gap-1.5">
                                                        {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                                                            <button
                                                                key={sev}
                                                                type="button"
                                                                onClick={() => {
                                                                    const nextSeverities = { ...(activeLog.symptomSeverities || {}) };
                                                                    nextSeverities[s] = sev;
                                                                    setDraftLog({
                                                                        ...activeLog,
                                                                        symptomSeverities: nextSeverities,
                                                                    });
                                                                }}
                                                                className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${currentSeverity === sev
                                                                    ? sev === 'Severe'
                                                                        ? 'bg-red-500 border-red-600 text-white shadow-sm'
                                                                        : sev === 'Moderate'
                                                                            ? 'bg-orange-400 border-orange-500 text-white shadow-sm'
                                                                            : 'bg-teal-500 border-teal-600 text-white shadow-sm'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {sev}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Mood & Behavior Toggles */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                    Mood & Behavior
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Affectionate', icon: Heart },
                                        { label: 'Restless', icon: Activity },
                                        { label: 'Quiet', icon: VolumeX },
                                        { label: 'Calm', icon: Feather },
                                    ].map((moodItem) => {
                                        const isMoodSelected = activeLog.moods?.includes(moodItem.label) || false;
                                        const MoodIcon = moodItem.icon;
                                        return (
                                            <button
                                                key={moodItem.label}
                                                type="button"
                                                onClick={() => {
                                                    const currentMoods = activeLog.moods || [];
                                                    const nextMoods = isMoodSelected
                                                        ? currentMoods.filter((m) => m !== moodItem.label)
                                                        : [...currentMoods, moodItem.label];
                                                    setDraftLog({
                                                        ...activeLog,
                                                        moods: nextMoods,
                                                    });
                                                }}
                                                className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border-2 transition-colors text-left text-sm font-bold cursor-pointer ${isMoodSelected
                                                    ? 'bg-[#FFFDF0] border-yellow-400 text-yellow-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]'
                                                    : 'bg-[#F8FAFC] border-slate-100 text-slate-700 hover:border-yellow-100'
                                                    }`}
                                            >
                                                <MoodIcon aria-label={moodItem.label} className="h-8 w-8" strokeWidth={2} />
                                                <span>{moodItem.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weight Input */}
                            <div className="mb-6 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    <span>Weight</span>
                                    <span className="font-black text-sm text-[#14b8a6]">
                                        {(activeLog.weight !== undefined ? activeLog.weight : (registeredWeight || 4.0)).toFixed(1)} kg
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="13.0"
                                    step="0.1"
                                    value={activeLog.weight !== undefined ? activeLog.weight : (registeredWeight || 4.0)}
                                    onChange={(e) => {
                                        const w = parseFloat(e.target.value);
                                        setDraftLog({ ...activeLog, weight: w });
                                    }}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                                />
                            </div>

                            {/* Temperature Slider */}
                            <div className="mb-8 w-full flex flex-col items-center">
                                <div className="flex justify-between items-center w-full mb-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        Temperature
                                    </label>
                                    <div className="flex bg-slate-100 rounded-full p-0.5 border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setTempUnit('C')}
                                            className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-colors cursor-pointer ${tempUnit === 'C' ? 'bg-[#14b8a6] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            °C
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTempUnit('F')}
                                            className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-colors cursor-pointer ${tempUnit === 'F' ? 'bg-[#14b8a6] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            °F
                                        </button>
                                    </div>
                                </div>
                                <ExposureSlider
                                    key={tempUnit}
                                    min={tempUnit === 'C' ? 350 : 950}
                                    max={tempUnit === 'C' ? 420 : 1076}
                                    step={1}
                                    defaultValue={
                                        tempUnit === 'C'
                                            ? (activeLog.temperature ? Math.round(activeLog.temperature * 10) : 380)
                                            : Math.round(((activeLog.temperature || 38.0) * 1.8 + 32) * 10)
                                    }
                                    onChange={(val) => {
                                        const celsius = tempUnit === 'C' ? val / 10 : ((val / 10) - 32) / 1.8;
                                        setDraftLog({ ...activeLog, temperature: parseFloat(celsius.toFixed(1)) });
                                    }}
                                    formatValue={(val) => `${(val / 10).toFixed(1)} °${tempUnit}`}
                                    accentColor="#14b8a6"
                                    className="w-full text-slate-800"
                                />
                                {activeLog.temperature !== undefined && (activeLog.temperature < 37.7 || activeLog.temperature > 39.2) && (
                                    <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-2xl flex items-start gap-3 text-left w-full animate-fadeIn">
                                        <span className="text-xl">⚠️</span>
                                        <div>
                                            <p className="text-xs font-black text-orange-950 uppercase tracking-wider">
                                                {activeLog.temperature < 37.2 ? "Labor Indication" : "Abnormal Temperature"}
                                            </p>
                                            <p className="text-[10px] text-orange-800 font-bold mt-1 leading-relaxed">
                                                {activeLog.temperature < 37.2
                                                    ? `Molly's temperature is ${(activeLog.temperature * 1.8 + 32).toFixed(1)}°F (${activeLog.temperature}°C). A drop below 99.0°F (37.2°C) is a strong indicator that labor will begin within 12 to 24 hours.`
                                                    : `A healthy cat's normal body temperature ranges from 100.0°F to 102.5°F (37.7°C to 39.2°C). Molly's temperature is currently ${(activeLog.temperature * 1.8 + 32).toFixed(1)}°F (${activeLog.temperature}°C), which is outside the normal stable range.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {hasLog && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onDeleteLog(selectedDateStr);
                                        closeBottomSheet();
                                    }}
                                    className="w-full py-4 mb-3 bg-red-50 text-red-500 border-2 border-red-200 rounded-2xl font-black hover:bg-red-100 transition-all cursor-pointer text-center text-sm"
                                >
                                    Undo Log
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleSaveAndClose}
                                className="w-full py-4 bg-[#FFEA30] text-slate-900 border-2 border-slate-900 rounded-2xl font-bold shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-yellow-400 transition-colors text-center cursor-pointer"
                            >
                                Done
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SymptomLogForm;
