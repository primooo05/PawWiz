import React, { useState, useEffect, useRef } from 'react';
import type { DailyLog } from '../../hooks/usePregnancyTracker';

import nestingIcon from '../../assets/nesting.png';
import appetiteUpIcon from '../../assets/appetite-up.png';
import pinkingUpIcon from '../../assets/pinking-up.png';
import sleepIcon from '../../assets/sleep.png';
import vomitingIcon from '../../assets/vomiting.png';
import weightGainIcon from '../../assets/weight-gain.png';
import milkProductionIcon from '../../assets/milk-production.png';
import contractionsIcon from '../../assets/contractions.png';

import affectionateIcon from '../../assets/affectionate.png';
import stressIcon from '../../assets/stress.png';
import quietIcon from '../../assets/quiet.png';
import calmIcon from '../../assets/calm.png';

const SYMPTOMS = [
    { label: 'Nesting', icon: nestingIcon },
    { label: 'Appetite Up', icon: appetiteUpIcon },
    { label: 'Vomiting', icon: vomitingIcon },
    { label: 'Pinking Up', icon: pinkingUpIcon },
    { label: 'Weight Gain', icon: weightGainIcon },
    { label: 'Extra Sleep', icon: sleepIcon },
    { label: 'Nausea', icon: vomitingIcon },
    { label: 'Nipple Changes', icon: pinkingUpIcon },
    { label: 'Lethargy', icon: sleepIcon },
    { label: 'Appetite Changes', icon: appetiteUpIcon },
    { label: 'Restlessness', icon: stressIcon },
    { label: 'Milk Production', icon: milkProductionIcon },
    { label: 'Contractions', icon: contractionsIcon },
];

const getSymptomsForWeek = (week: number) => {
    if (week <= 3) {
        return [
            { label: 'Nausea', icon: vomitingIcon },
            { label: 'Nipple Changes', icon: pinkingUpIcon },
            { label: 'Weight Gain', icon: weightGainIcon },
            { label: 'Lethargy', icon: sleepIcon },
        ];
    } else if (week <= 6) {
        return [
            { label: 'Weight Gain', icon: weightGainIcon },
            { label: 'Appetite Changes', icon: appetiteUpIcon },
            { label: 'Lethargy', icon: sleepIcon },
            { label: 'Nipple Changes', icon: pinkingUpIcon },
        ];
    } else {
        return [
            { label: 'Nesting', icon: nestingIcon },
            { label: 'Milk Production', icon: milkProductionIcon },
            { label: 'Contractions', icon: contractionsIcon },
            { label: 'Appetite Changes', icon: appetiteUpIcon },
        ];
    }
};

const WEEK_DESCRIPTIONS: Record<number, string> = {
    1: "Fertilization occurs. Eggs travel to the uterus. No visible symptoms yet; keep her stress levels low.",
    2: "Blastocysts implant in the uterine lining. The placenta begins to form. You may notice her sleeping slightly more.",
    3: "Fetal development begins. Nipples may start pinking up (turning darker pink and losing hair). Slight nausea might occur.",
    4: "Kittens' organs are forming. You may notice nipple pinking and mild nausea. Avoid rough handling and consult your vet.",
    5: "Fetal structures are fully established; claws and whiskers develop. Her abdomen starts to visibly swell. Increase food portions.",
    6: "Rapid fetal growth. Kittens double in size. Molly becomes visibly rounder and may groom herself more frequently.",
    7: "Kitten hair starts to grow. You might feel movement if you place your hand gently on her belly. Nesting behavior begins.",
    8: "Fetal development is complete. Molly starts producing milk. She may search for a nesting area and show restlessness.",
    9: "Labor is imminent. Kittens are ready to be born. Watch for nesting, temperature drop, and behavioral changes.",
};

interface DashboardViewProps {
    matingDate: string;
    setIsTracking: (tracking: boolean) => void;
    currentDay: number;
    daysRemaining: number;
    currentWeek: number;
    dueDateString: string;
    progressPercentage: number;
    currentYear: number;
    currentMonthIndex: number;
    currentMonthLabel: string;
    calendarGrid: (number | null)[];
    changeCalendarMonth: (direction: -1 | 1) => void;
    getElapsedDayLabel: (day: number) => number | null;
    getWeekMilestone: (day: number) => number | null;
    getLocalDateStr: (year: number, monthIdx: number, dayNum: number) => string;
    getDayBadgeClassName: (day: number, isSelected: boolean) => string;
    logs: Record<string, DailyLog>;
    selectedDateStr: string | null;
    isBottomSheetOpen: boolean;
    openLogForDate: (dateStr: string) => void;
    closeBottomSheet: () => void;
    saveLogForDate: (dateStr: string, log: DailyLog) => void;
    toggleSymptom: (dateStr: string, symptomLabel: string) => void;
    isDateLoggable: (year: number, monthIdx: number, dayNum: number) => boolean;
    todayStr: string;
    todayLog: DailyLog;
    todayLoggable: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    matingDate,
    setIsTracking,
    currentDay,
    daysRemaining,
    currentWeek,
    dueDateString,
    progressPercentage,
    currentYear,
    currentMonthIndex,
    currentMonthLabel,
    calendarGrid,
    changeCalendarMonth,
    getElapsedDayLabel,
    getWeekMilestone,
    getLocalDateStr,
    getDayBadgeClassName,
    logs,
    selectedDateStr,
    isBottomSheetOpen,
    openLogForDate,
    closeBottomSheet,
    saveLogForDate,
    isDateLoggable,
    todayStr,
    todayLog,
    todayLoggable,
}) => {
    const [isWeightPickerOpen, setIsWeightPickerOpen] = useState(false);
    const [intVal, setIntVal] = useState(4);
    const [decVal, setDecVal] = useState(0);
    const [unitVal, setUnitVal] = useState<'kg' | 'lbs'>('kg');
    const [isEduExpanded, setIsEduExpanded] = useState(true);

    useEffect(() => {
        if (isWeightPickerOpen && selectedDateStr) {
            const weight = logs[selectedDateStr]?.weight;
            if (weight !== undefined) {
                if (unitVal === 'kg') {
                    setIntVal(Math.floor(weight));
                    setDecVal(Math.round((weight - Math.floor(weight)) * 10) % 10);
                } else {
                    const weightInLbs = weight / 0.45359237;
                    setIntVal(Math.floor(weightInLbs));
                    setDecVal(Math.round((weightInLbs - Math.floor(weightInLbs)) * 10) % 10);
                }
            } else {
                setIntVal(unitVal === 'kg' ? 4 : 8);
                setDecVal(0);
            }
        }
    }, [isWeightPickerOpen, selectedDateStr]);

    const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
        if (newUnit === unitVal) return;
        if (newUnit === 'lbs') {
            const currentKg = intVal + decVal / 10;
            const targetLbs = currentKg / 0.45359237;
            const newInt = Math.floor(targetLbs);
            const newDec = Math.round((targetLbs - newInt) * 10) % 10;
            setIntVal(newInt);
            setDecVal(newDec);
        } else {
            const currentLbs = intVal + decVal / 10;
            const targetKg = currentLbs * 0.45359237;
            const newInt = Math.floor(targetKg);
            const newDec = Math.round((targetKg - newInt) * 10) % 10;
            setIntVal(newInt);
            setDecVal(newDec);
        }
        setUnitVal(newUnit);
    };

    const handleWeightPickerDone = () => {
        if (!selectedDateStr) return;
        const rawVal = intVal + decVal / 10;
        const finalWeightKg = unitVal === 'kg' ? rawVal : rawVal * 0.45359237;
        const activeLog = logs[selectedDateStr] || { symptoms: [] };
        saveLogForDate(selectedDateStr, {
            ...activeLog,
            weight: parseFloat(finalWeightKg.toFixed(1))
        });
        setIsWeightPickerOpen(false);
    };

    const elapsedDayForSelected = selectedDateStr && matingDate ? (() => {
        const base = new Date(matingDate + 'T00:00:00');
        const target = new Date(selectedDateStr + 'T00:00:00');
        const diff = target.getTime() - base.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays + 1 : null;
    })() : null;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">
                {/* LEFT COLUMN: Molly's Cycle (Soft UI) */}
                <div className="flex flex-col gap-6">
                    <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center border border-slate-50">
                        <div className="w-full flex justify-between items-center mb-8">
                            <h2 className="text-[1.35rem] font-bold text-[#1e293b]">Molly's Cycle</h2>
                            <button
                                onClick={() => setIsTracking(false)}
                                className="text-xs font-bold text-teal-400 hover:text-teal-600 transition-colors cursor-pointer"
                            >
                                Edit Date
                            </button>
                        </div>

                        {/* Circular Progress */}
                        <div 
                            className="relative w-56 h-56 rounded-full flex items-center justify-center mb-8 shadow-sm border-2 border-slate-900"
                            style={{ 
                                background: `conic-gradient(#14b8a6 ${progressPercentage}%, #f8fafc ${progressPercentage}%)` 
                            }}
                        >
                            <div className="w-[188px] h-[188px] bg-white rounded-full flex flex-col items-center justify-center border-2 border-slate-900 shadow-inner z-10">
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">WEEK {currentWeek}/9</p>
                                <p className="text-4xl font-black text-teal-500 tracking-tight">Day {currentDay}</p>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-[#F2FBF9] rounded-[1.25rem]">
                                <p className="text-[10px] font-bold text-teal-800/70 mb-1 uppercase tracking-widest">DUE IN</p>
                                <p className="text-xl font-black text-teal-900">{daysRemaining} Days</p>
                            </div>
                            <div className="p-4 bg-[#FFFDF0] rounded-[1.25rem]">
                                <p className="text-[10px] font-bold text-yellow-800/70 mb-1 uppercase tracking-widest">EST. DUE</p>
                                <p className="text-sm font-black text-yellow-900 mt-1">{dueDateString}</p>
                            </div>
                        </div>

                        <hr className="w-full border-slate-100 my-6" />

                        <div className="w-full flex flex-col gap-4 text-left">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Summary</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Symptoms Card */}
                                <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                                            🩺
                                        </div>
                                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/50 px-2 py-0.5 rounded-full">
                                            {todayLog.symptoms && todayLog.symptoms.length > 0 ? `${todayLog.symptoms.length} Logged` : 'None'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptoms</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            {todayLog.symptoms && todayLog.symptoms.length > 0 ? (
                                                todayLog.symptoms.map((s: string) => {
                                                    const severity = todayLog.symptomSeverities?.[s];
                                                    return (
                                                        <span key={s} className="text-[10px] font-black text-teal-800 leading-tight">
                                                            • {s}{severity ? ` (${severity[0]})` : ''}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-[10px] font-semibold text-slate-400 italic">No signs</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Behavior Card */}
                                <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                                            🐾
                                        </div>
                                        <span className="text-[10px] font-bold text-yellow-800 bg-yellow-100/50 px-2 py-0.5 rounded-full">
                                            {todayLog.moods && todayLog.moods.length > 0 ? 'Active' : 'Normal'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Behavior</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            {todayLog.moods && todayLog.moods.length > 0 ? (
                                                todayLog.moods.map((m: string) => (
                                                    <span key={m} className="text-[10px] font-black text-yellow-900 leading-tight">
                                                        • {m}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-semibold text-slate-400 italic">Calm</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Weight Card */}
                                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                                            ⚖️
                                        </div>
                                        <span className="text-[10px] font-bold text-sky-800 bg-sky-100/50 px-2 py-0.5 rounded-full">
                                            {todayLog.weight !== undefined ? 'Logged' : 'None'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</p>
                                        <p className="text-base font-black text-slate-800 mt-1">
                                            {todayLog.weight !== undefined ? `${todayLog.weight} kg` : 'Not logged'}
                                        </p>
                                    </div>
                                </div>

                                {/* Temperature Card */}
                                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                                            🌡️
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                                            {todayLog.temperature !== undefined
                                                ? todayLog.temperature < 37.2
                                                    ? 'Labor Sign'
                                                    : 'Stable'
                                                : 'None'
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</p>
                                        <p className="text-base font-black text-slate-800 mt-1">
                                            {todayLog.temperature !== undefined ? `${todayLog.temperature} °C` : 'Not logged'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Weekly Educational Insights Card */}
                            <div className="w-full mt-5 bg-white border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                <button
                                    type="button"
                                    onClick={() => setIsEduExpanded(!isEduExpanded)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-xs font-black text-slate-900 bg-[#40C48E] hover:opacity-95 transition-opacity cursor-pointer border-b-2 border-slate-900"
                                >
                                    <span className="tracking-wide"> WEEK {currentWeek} DEVELOPMENT</span>
                                    <span className="text-[10px]">{isEduExpanded ? '▼' : '▶'}</span>
                                </button>
                                {isEduExpanded && (
                                    <div className="p-5 text-xs font-semibold text-slate-700 leading-relaxed bg-white">
                                        {WEEK_DESCRIPTIONS[currentWeek] || "Molly is growing her kittens. Keep her comfortable and fed with high-quality kitten formula."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-10 mt-6">
                    {/* Labor Warning Card for Week 8-9 */}
                    {currentWeek >= 8 && (
                        <div className="bg-red-50 border-2 border-red-500 rounded-[2rem] p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">⚠️</span>
                                <h3 className="text-sm font-black text-red-900 uppercase tracking-wider">Labor is Near (Week {currentWeek})</h3>
                            </div>
                            <p className="text-xs text-red-800 font-bold mb-4">
                                Watch for signs: temperature drop below 99°F, intense nesting, loss of appetite, and restlessness.
                            </p>
                            <div className="bg-white rounded-2xl p-4 border border-red-200">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">What to Prepare:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'birthing_box', label: '📦 Quiet Birthing Box' },
                                        { id: 'vet_number', label: '📞 Emergency Vet #' },
                                        { id: 'warmth', label: '🔥 Heating Pad & Blankets' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked={localStorage.getItem(`prep_${item.id}`) === 'true'}
                                                onChange={(e) => {
                                                    localStorage.setItem(`prep_${item.id}`, e.target.checked ? 'true' : 'false');
                                                }}
                                                className="rounded border-slate-300 text-red-500 focus:ring-red-400 h-4 w-4"
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TOP: Bold Calendar Wrapper */}
                    <div className="relative flex flex-col items-center">
                        {/* Floating Month Navigator */}
                        <div className="absolute -top-5 z-10">
                            <div className="px-3 py-1.5 bg-[#FFEA30] border-2 border-slate-900 rounded-full font-bold text-slate-900 flex items-center gap-3 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                                <button
                                    type="button"
                                    onClick={() => changeCalendarMonth(-1)}
                                    aria-label="Previous month"
                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white/90 text-base leading-none hover:bg-white"
                                >
                                    {'<'}
                                </button>
                                <span className="min-w-[140px] text-center text-sm">
                                    {currentMonthLabel} {currentYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => changeCalendarMonth(1)}
                                    aria-label="Next month"
                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white/90 text-base leading-none hover:bg-white"
                                >
                                    {'>'}
                                </button>
                            </div>
                        </div>

                        {/* Calendar Container */}
                        <div className="w-full bg-white border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                            {/* Green Header */}
                            <div className="bg-[#40C48E] border-b-2 border-slate-900 pt-8 pb-4 px-6 grid grid-cols-7 text-center">
                                {['S', 'M', 'T', 'W', 'TH', 'F', 'S'].map(day => (
                                    <span key={day} className="font-bold text-slate-900">{day}</span>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-y-6 py-8 px-6 text-center bg-white min-h-[220px]">
                                {calendarGrid.map((day, idx) => {
                                    if (!day) {
                                        return <div key={idx} className="w-10 h-10"></div>;
                                    }

                                    const dateStr = getLocalDateStr(currentYear, currentMonthIndex, day);
                                    const log = logs[dateStr];
                                    const hasSymptoms = log && log.symptoms && log.symptoms.length > 0;
                                    const weekMilestone = getWeekMilestone(day);
                                    const isSelected = dateStr === selectedDateStr;
                                    const loggable = isDateLoggable(currentYear, currentMonthIndex, day);

                                    return (
                                        <div key={idx} className="flex justify-center items-center">
                                            <button
                                                type="button"
                                                disabled={!loggable}
                                                onClick={() => openLogForDate(dateStr)}
                                                className={`flex flex-col items-center justify-center gap-1 min-h-[70px] w-full focus:outline-none ${loggable ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-40'}`}
                                            >
                                                {/* Top indicator: Week Milestone or Elapsed Day */}
                                                <span className={`inline-flex min-h-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-black leading-none ${weekMilestone !== null
                                                    ? 'bg-[#FFEA30] text-slate-900 border border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] font-extrabold'
                                                    : 'text-slate-400'
                                                    }`}>
                                                    {weekMilestone !== null ? `W${weekMilestone}` : getElapsedDayLabel(day)}
                                                </span>

                                                {/* Badge Circle */}
                                                <div className={getDayBadgeClassName(day, isSelected)}>
                                                    {day}
                                                </div>

                                                {/* Bottom indicators: dot for symptoms */}
                                                <div className="h-2 flex items-center justify-center">
                                                    {hasSymptoms && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM: Soft Symptoms Card */}
                    <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[1.1rem] font-bold text-[#1e293b]">Log Symptoms for Today</h3>
                            <button
                                type="button"
                                disabled={!todayLoggable}
                                onClick={() => openLogForDate(todayStr)}
                                className={`px-4 py-2 bg-[#FFEA30] border-2 border-slate-900 text-slate-900 rounded-full text-xs font-black transition-all shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${todayLoggable
                                    ? 'hover:bg-yellow-400 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(15,23,42,1)] cursor-pointer'
                                    : 'opacity-40 cursor-not-allowed'
                                    }`}
                            >
                                Log
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {getSymptomsForWeek(currentWeek).map((symptom) => {
                                const isSymptomLogged = todayLog.symptoms.includes(symptom.label);
                                const severity = todayLog.symptomSeverities?.[symptom.label];
                                return (
                                    <div
                                        key={symptom.label}
                                        className={`
                                            flex flex-col items-center justify-center min-w-[105px] h-[115px] rounded-[1.5rem] transition-colors border-2
                                            ${isSymptomLogged
                                                ? severity === 'Severe'
                                                    ? 'bg-red-50 border-red-400 text-red-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                    : severity === 'Moderate'
                                                        ? 'bg-orange-50 border-orange-400 text-orange-850 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                        : 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-[#F8FAFC] border-slate-100 text-slate-400'}
                                        `}
                                    >
                                        <img
                                            src={symptom.icon}
                                            alt={symptom.label}
                                            className={`h-10 w-10 object-contain mb-3 transition-opacity ${isSymptomLogged ? 'opacity-100' : 'opacity-40'}`}
                                        />
                                        <span className="text-[11px] font-bold">{symptom.label}</span>
                                        {isSymptomLogged && severity && (
                                            <span className="text-[9px] font-black uppercase mt-1 opacity-90">({severity})</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet Drawer for Log entry */}
            {isBottomSheetOpen && selectedDateStr && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
                        onClick={closeBottomSheet}
                    />

                    {/* Centered Modal Container */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] z-50 p-8 transition-all duration-200 max-h-[90vh] overflow-y-auto">
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
                                onClick={closeBottomSheet}
                                className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold font-sans"
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
                                {getSymptomsForWeek(elapsedDayForSelected !== null ? Math.ceil(elapsedDayForSelected / 7) : currentWeek).map((symptom) => {
                                    const activeLog = logs[selectedDateStr] || { symptoms: [], symptomSeverities: {} };
                                    const isSymptomLogged = activeLog.symptoms.includes(symptom.label);
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
                                                saveLogForDate(selectedDateStr, {
                                                    ...activeLog,
                                                    symptoms: nextSymptoms,
                                                    symptomSeverities: nextSeverities,
                                                });
                                            }}
                                            className={`flex flex-col items-center justify-center p-3 rounded-[1.5rem] transition-colors border-2 cursor-pointer ${isSymptomLogged
                                                ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-[#F8FAFC] border-slate-100 text-slate-700 hover:border-teal-200'
                                                }`}
                                        >
                                            <img src={symptom.icon} alt={symptom.label} className="h-10 w-10 object-contain mb-1" />
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
                        {(() => {
                            const activeLog = logs[selectedDateStr] || { symptoms: [], symptomSeverities: {} };
                            const hasSevereSymptom = activeLog.symptoms?.some(s => activeLog.symptomSeverities?.[s] === 'Severe');
                            const selectedDateWeek = elapsedDayForSelected !== null ? Math.ceil(elapsedDayForSelected / 7) : currentWeek;
                            const hasNauseaInEarlyWeeks = selectedDateWeek <= 3 && activeLog.symptoms?.includes('Nausea') && activeLog.symptomSeverities?.['Nausea'] === 'Severe';

                            if (hasSevereSymptom) {
                                return (
                                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-start gap-3">
                                        <span className="text-xl">⚠️</span>
                                        <div>
                                            <p className="text-xs font-black text-red-950 uppercase tracking-wider">Vet Attention Recommended</p>
                                            <p className="text-[10px] text-red-800 font-bold mt-1 leading-relaxed">
                                                {hasNauseaInEarlyWeeks
                                                    ? "Severe nausea/vomiting in early pregnancy (Weeks 1-3) can signal complications like dehydration or infection. Please consider contacting a veterinarian immediately."
                                                    : "One or more symptoms are marked as Severe. We recommend contacting your veterinarian to ensure Molly's safety."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Severity Adjusters */}
                        {(() => {
                            const activeLog = logs[selectedDateStr] || { symptoms: [], symptomSeverities: {} };
                            if (!activeLog.symptoms || activeLog.symptoms.length === 0) return null;
                            return (
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
                                                                    saveLogForDate(selectedDateStr, {
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
                            );
                        })()}

                        {/* Mood & Behavior Toggles */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                Mood & Behavior
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Affectionate', icon: affectionateIcon },
                                    { label: 'Restless', icon: stressIcon },
                                    { label: 'Quiet', icon: quietIcon },
                                    { label: 'Calm', icon: calmIcon },
                                ].map((moodItem) => {
                                    const activeLog = logs[selectedDateStr] || { symptoms: [], moods: [] };
                                    const isMoodSelected = activeLog.moods?.includes(moodItem.label) || false;
                                    return (
                                        <button
                                            key={moodItem.label}
                                            type="button"
                                            onClick={() => {
                                                const currentMoods = activeLog.moods || [];
                                                const nextMoods = isMoodSelected
                                                    ? currentMoods.filter((m) => m !== moodItem.label)
                                                    : [...currentMoods, moodItem.label];
                                                saveLogForDate(selectedDateStr, {
                                                    ...activeLog,
                                                    moods: nextMoods,
                                                });
                                            }}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border-2 transition-colors text-left text-sm font-bold cursor-pointer ${isMoodSelected
                                                ? 'bg-[#FFFDF0] border-yellow-400 text-yellow-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-[#F8FAFC] border-slate-100 text-slate-700 hover:border-yellow-100'
                                                }`}
                                        >
                                            <img src={moodItem.icon} alt={moodItem.label} className="h-8 w-8 object-contain" />
                                            <span>{moodItem.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weight Input */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                Weight
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsWeightPickerOpen(true)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm text-slate-700 font-medium flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <span>
                                    {logs[selectedDateStr]?.weight !== undefined
                                        ? `${logs[selectedDateStr].weight} kg`
                                        : 'Tap to log weight...'}
                                </span>
                                <span className="text-slate-400">⚖️</span>
                            </button>
                        </div>

                        {/* Temperature Input */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                Temperature (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 38.4"
                                value={logs[selectedDateStr]?.temperature ?? ''}
                                onChange={(e) => {
                                    const activeLog = logs[selectedDateStr] || { symptoms: [] };
                                    const val = parseFloat(e.target.value);
                                    saveLogForDate(selectedDateStr, { ...activeLog, temperature: isNaN(val) ? undefined : val });
                                }}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-slate-700 font-medium"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={closeBottomSheet}
                            className="w-full py-4 bg-[#FFEA30] text-slate-900 border-2 border-slate-900 rounded-2xl font-bold shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-yellow-400 transition-colors text-center cursor-pointer"
                        >
                            Done
                        </button>
                    </div>

                    {/* Weight Picker Modal */}
                    {isWeightPickerOpen && (
                        <>
                            <style>{`
                                .scrollbar-none::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            {/* Modal Backdrop */}
                            <div
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity"
                                onClick={() => setIsWeightPickerOpen(false)}
                            />

                            {/* Modal content */}
                            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2.5rem] border-2 border-slate-950 shadow-[4px_4px_0_0_rgba(15,23,42,1)] z-[70] p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8 relative">
                                    <button
                                        onClick={() => setIsWeightPickerOpen(false)}
                                        className="text-2xl text-slate-800 hover:text-slate-600 font-sans absolute left-0"
                                    >
                                        ✕
                                    </button>
                                    <h3 className="text-xl font-bold text-slate-800 text-center w-full">
                                        Log your weight
                                    </h3>
                                </div>

                                {/* Picker interface */}
                                <div className="relative flex justify-center items-center w-full gap-4 my-8">
                                    {/* Highlight active selection area */}
                                    <div className="absolute left-0 right-0 h-12 border-t border-b border-[#FF5A79] pointer-events-none" />

                                    <ScrollColumn
                                        values={intValues}
                                        selectedValue={intVal}
                                        onChange={setIntVal}
                                        className="w-20"
                                    />
                                    <div className="text-2xl font-bold text-slate-850 self-center">.</div>
                                    <ScrollColumn
                                        values={decValues}
                                        selectedValue={decVal}
                                        onChange={setDecVal}
                                        className="w-16"
                                    />
                                    <ScrollColumn
                                        values={unitValues}
                                        selectedValue={unitVal}
                                        onChange={handleUnitChange}
                                        className="w-20"
                                    />
                                </div>

                                {/* Done button */}
                                <button
                                    onClick={handleWeightPickerDone}
                                    className="w-full py-4 bg-[#FF5A79] text-white rounded-full font-bold text-lg hover:bg-[#ff4064] transition-colors shadow-md shadow-pink-500/20 cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
};

const intValues = Array.from({ length: 100 }, (_, i) => i);
const decValues = Array.from({ length: 10 }, (_, i) => i);
const unitValues = ['kg', 'lbs'];

interface ScrollColumnProps {
    values: (string | number)[];
    selectedValue: string | number;
    onChange: (value: any) => void;
    className?: string;
}

const ScrollColumn: React.FC<ScrollColumnProps> = ({ values, selectedValue, onChange, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / 48);
        if (index >= 0 && index < values.length) {
            const val = values[index];
            if (val !== selectedValue) {
                onChange(val);
            }
        }
    };

    useEffect(() => {
        const index = values.indexOf(selectedValue);
        if (index !== -1 && containerRef.current) {
            const targetScrollTop = index * 48;
            if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 2) {
                containerRef.current.scrollTop = targetScrollTop;
            }
        }
    }, [selectedValue, values]);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`h-36 overflow-y-scroll snap-y snap-mandatory scrollbar-none ${className}`}
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <div className="h-12 flex-shrink-0" />
            {values.map((val, idx) => {
                const isSelected = val === selectedValue;
                return (
                    <div
                        key={idx}
                        onClick={() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTo({
                                    top: idx * 48,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className={`h-12 flex items-center justify-center text-xl font-bold cursor-pointer transition-opacity duration-150 snap-center select-none ${isSelected ? 'text-slate-900 opacity-100' : 'text-slate-300 opacity-40 hover:opacity-70'
                            }`}
                    >
                        {val}
                    </div>
                );
            })}
            <div className="h-12 flex-shrink-0" />
        </div>
    );
};

export default DashboardView;
