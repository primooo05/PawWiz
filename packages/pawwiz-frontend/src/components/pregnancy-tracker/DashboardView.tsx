import React from 'react';
import type { DailyLog } from '../../hooks/usePregnancyTracker';

// --- Symptom Icon Assets ---
import nestingIcon from '../../assets/nesting.png';
import appetiteUpIcon from '../../assets/appetite-up.png';
import pinkingUpIcon from '../../assets/pinking-up.png';
import sleepIcon from '../../assets/sleep.png';
import vomitingIcon from '../../assets/vomiting.png';
import weightGainIcon from '../../assets/weight-gain.png';

// --- Mood Icon Assets ---
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
];

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
    toggleSymptom,
    isDateLoggable,
    todayStr,
    todayLog,
    todayLoggable,
}) => {
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
                <div className="flex flex-col">
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
                        <div className="relative w-56 h-56 rounded-full border-[14px] border-slate-50 flex items-center justify-center mb-8">
                            <div
                                className="absolute inset-0 rounded-full border-[14px] border-teal-500 border-t-transparent border-l-transparent transform -rotate-45 transition-all duration-1000 ease-out"
                                style={{ clipPath: `polygon(50% 50%, -50% -50%, ${progressPercentage}% -50%, ${progressPercentage}% 150%, -50% 150%)` }}
                            />
                            <div className="text-center z-10 flex flex-col items-center justify-center mt-2">
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

                            <div className="flex flex-col gap-3">
                                {/* Symptoms Summary */}
                                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <span className="text-lg mt-0.5">🩺</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptoms</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {todayLog.symptoms && todayLog.symptoms.length > 0 ? (
                                                todayLog.symptoms.map((s: string) => {
                                                    const sympt = SYMPTOMS.find((item) => item.label === s);
                                                    return (
                                                        <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-full text-[10px] font-black">
                                                            {sympt?.icon && <img src={sympt.icon} alt="" className="h-3 w-3 object-contain" />}
                                                            {s}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-400 italic">No symptoms logged</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Behavior Summary */}
                                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <span className="text-lg mt-0.5">🐾</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Behavior</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {todayLog.moods && todayLog.moods.length > 0 ? (
                                                todayLog.moods.map((m: string) => {
                                                    const moodItem = [
                                                        { label: 'Affectionate', icon: affectionateIcon },
                                                        { label: 'Restless', icon: stressIcon },
                                                        { label: 'Quiet', icon: quietIcon },
                                                        { label: 'Calm', icon: calmIcon },
                                                    ].find((item) => item.label === m);
                                                    return (
                                                        <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-full text-[10px] font-black">
                                                            {moodItem?.icon && <img src={moodItem.icon} alt="" className="h-3.5 w-3.5 object-contain" />}
                                                            {m}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-400 italic">Not logged</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Weight Summary */}
                                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <span className="text-lg mt-0.5">⚖️</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</p>
                                        <p className="text-sm font-black text-slate-800 mt-0.5">
                                            {todayLog.weight !== undefined ? `${todayLog.weight} kg` : <span className="text-xs font-semibold text-slate-400 italic">Not logged</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-10 mt-6">
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
                                className={`px-4 py-2 bg-[#FFEA30] border-2 border-slate-900 text-slate-900 rounded-full text-xs font-black transition-all shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${
                                    todayLoggable
                                        ? 'hover:bg-yellow-400 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(15,23,42,1)] cursor-pointer'
                                        : 'opacity-40 cursor-not-allowed'
                                }`}
                            >
                                Log
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {SYMPTOMS.map((symptom) => {
                                const isSymptomLogged = todayLog.symptoms.includes(symptom.label);
                                return (
                                    <div
                                        key={symptom.label}
                                        className={`
                                            flex flex-col items-center justify-center min-w-[105px] h-[115px] rounded-[1.5rem] transition-colors border-2
                                            ${isSymptomLogged
                                                ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-[#F8FAFC] border-slate-100 text-slate-400'}
                                        `}
                                    >
                                        <img
                                            src={symptom.icon}
                                            alt={symptom.label}
                                            className={`h-10 w-10 object-contain mb-3 transition-opacity ${isSymptomLogged ? 'opacity-100' : 'opacity-40'}`}
                                        />
                                        <span className="text-[11px] font-bold">{symptom.label}</span>
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
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] z-50 p-8 transition-all duration-200">
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
                                {SYMPTOMS.map((symptom) => {
                                    const activeLog = logs[selectedDateStr] || { symptoms: [] };
                                    const isSymptomLogged = activeLog.symptoms.includes(symptom.label);
                                    return (
                                        <button
                                            key={symptom.label}
                                            type="button"
                                            onClick={() => toggleSymptom(selectedDateStr, symptom.label)}
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-[1.5rem] transition-colors border-2 cursor-pointer ${isSymptomLogged
                                                ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-[#F8FAFC] border-slate-100 text-slate-700 hover:border-teal-200'
                                                }`}
                                        >
                                            <img src={symptom.icon} alt={symptom.label} className="h-12 w-12 object-contain mb-1.5" />
                                            <span className="text-[10px] font-black text-center leading-tight break-words max-w-full">{symptom.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

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
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Enter weight..."
                                value={logs[selectedDateStr]?.weight ?? ''}
                                onChange={(e) => {
                                    const activeLog = logs[selectedDateStr] || { symptoms: [] };
                                    const val = parseFloat(e.target.value);
                                    saveLogForDate(selectedDateStr, { ...activeLog, weight: isNaN(val) ? undefined : val });
                                }}
                                className="w-full p-4 bg-slate-50 border border-[#15AFB4]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-slate-700 font-medium"
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
                </>
            )}
        </>
    );
};

export default DashboardView;
