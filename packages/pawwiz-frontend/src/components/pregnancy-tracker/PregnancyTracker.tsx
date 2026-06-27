import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';
import BottomNav from '../BottomNav';

import { usePregnancyTracker } from '../../hooks/usePregnancyTracker';
import pawWizText from '../../assets/PawWiz_Text_logo.png';

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

// --- Types & Interfaces ---
interface NavItem {
    label: string;
    isActive?: boolean;
}

// --- Mock Data ---
const NAV_ITEMS: NavItem[] = [
    { label: 'HOME' },
    { label: 'MONITORING', isActive: true },
    { label: 'DIET' },
    { label: 'ACTIVITIES' },
];

const SYMPTOMS = [
    { label: 'Nesting', icon: nestingIcon },
    { label: 'Appetite Up', icon: appetiteUpIcon },
    { label: 'Vomiting', icon: vomitingIcon },
    { label: 'Pinking Up', icon: pinkingUpIcon },
    { label: 'Weight Gain', icon: weightGainIcon },
    { label: 'Extra Sleep', icon: sleepIcon },
];

const CatPregnancyTracker: React.FC = () => {
    const {
        matingDate,
        setMatingDate,
        isTracking,
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
        handleStartTracking,
        logs,
        selectedDateStr,
        isBottomSheetOpen,
        openLogForDate,
        closeBottomSheet,
        saveLogForDate,
    } = usePregnancyTracker();

    const toggleSymptom = (dateStr: string, symptomLabel: string) => {
        const activeLog = logs[dateStr] || { symptoms: [], notes: '' };
        const isAlreadyLogged = activeLog.symptoms.includes(symptomLabel);
        const nextSymptoms = isAlreadyLogged
            ? activeLog.symptoms.filter((s: string) => s !== symptomLabel)
            : [...activeLog.symptoms, symptomLabel];
        saveLogForDate(dateStr, {
            ...activeLog,
            symptoms: nextSymptoms,
        });
    };

    const elapsedDayForSelected = selectedDateStr && matingDate ? (() => {
        const base = new Date(matingDate + 'T00:00:00');
        const target = new Date(selectedDateStr + 'T00:00:00');
        const diff = target.getTime() - base.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays + 1 : null;
    })() : null;

    const today = new Date();
    const todayStr = getLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    const todayLog = logs[todayStr] || { symptoms: [] };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20">
            {/* Top Navbar */}
            <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] relative z-20">
                <div className="flex items-center gap-2">
                    <img src={pawWizText} alt="PawWiz" className="h-6 w-auto object-contain ml-1" />
                </div>
                <div className="flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-wide">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.label}
                            className={`hover:text-teal-500 transition-colors ${
                                item.isActive ? 'text-teal-500 border-b-[3px] border-teal-500 pb-1' : ''
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button className="px-8 py-2.5 ml-4 text-slate-900 bg-[#FFEA30] rounded-full hover:bg-yellow-400 transition-colors shadow-sm tracking-widest">
                        SIGN IN
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-[1440px] px-8 py-12 mx-auto">

                {!isTracking ? (
                    // SETUP VIEW
                    <div className="max-w-md mx-auto mt-12 p-10 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border border-slate-50">
                        <div className="text-4xl mb-4">🗓️</div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">Set up Molly's Profile</h2>
                        <p className="text-slate-500 mb-8 text-sm">
                            Enter the date of the first successful mating to establish Day 1 of the cycle.
                        </p>

                        <form onSubmit={handleStartTracking} className="flex flex-col gap-4">
                            <div className="text-left">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                    When did the mating occur?
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={matingDate ? new Date(matingDate + 'T00:00:00') : null}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const formattedDate = date.toISOString().split('T')[0];
                                                setMatingDate(formattedDate);
                                            }
                                        }}
                                        maxDate={new Date()}
                                        className="w-full p-4 pr-12 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium text-slate-700"
                                        placeholderText="Select a date"
                                        dateFormat="MM/dd/yyyy"
                                        calendarClassName="custom-calendar"
                                        renderCustomHeader={({
                                            date,
                                            decreaseMonth,
                                            increaseMonth,
                                            prevMonthButtonDisabled,
                                            nextMonthButtonDisabled,
                                        }) => (
                                            <div className="flex justify-center items-center mb-4">
                                                <div className="px-3 py-1.5 bg-[#FFEA30] border-2 border-slate-900 rounded-full font-bold text-slate-900 flex items-center gap-3 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                                                    <button
                                                        type="button"
                                                        onClick={decreaseMonth}
                                                        disabled={prevMonthButtonDisabled}
                                                        aria-label="Previous Month"
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white text-base font-black leading-none hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {'<'}
                                                    </button>
                                                    <span className="min-w-[130px] text-center text-sm font-black select-none">
                                                        {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={increaseMonth}
                                                        disabled={nextMonthButtonDisabled}
                                                        aria-label="Next Month"
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white text-base font-black leading-none hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {'>'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                            input?.focus();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform pointer-events-auto"
                                    >
                                        📅
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!matingDate}
                                className="mt-4 w-full py-4 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                Calculate Due Date
                            </button>
                        </form>
                    </div>
                ) : (

                    // DASHBOARD VIEW
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">

                        {/* LEFT COLUMN: Molly's Cycle (Soft UI) */}
                        <div className="flex flex-col">
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center border border-slate-50 h-[480px]">

                                <div className="w-full flex justify-between items-center mb-8">
                                    <h2 className="text-[1.35rem] font-bold text-[#1e293b]">Molly's Cycle</h2>
                                    <button
                                        onClick={() => setIsTracking(false)}
                                        className="text-xs font-bold text-teal-400 hover:text-teal-600 transition-colors"
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

                                <div className="w-full grid grid-cols-2 gap-4 text-center mt-auto">
                                    <div className="p-4 bg-[#F2FBF9] rounded-[1.25rem]">
                                        <p className="text-[10px] font-bold text-teal-800/70 mb-1 uppercase tracking-widest">DUE IN</p>
                                        <p className="text-xl font-black text-teal-900">{daysRemaining} Days</p>
                                    </div>
                                    <div className="p-4 bg-[#FFFDF0] rounded-[1.25rem]">
                                        <p className="text-[10px] font-bold text-yellow-800/70 mb-1 uppercase tracking-widest">EST. DUE</p>
                                        <p className="text-sm font-black text-yellow-900 mt-1">{dueDateString}</p>
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

                                            return (
                                                <div key={idx} className="flex justify-center items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openLogForDate(dateStr)}
                                                        className="flex flex-col items-center justify-center gap-1 min-h-[70px] w-full focus:outline-none cursor-pointer"
                                                    >
                                                        {/* Top indicator: Week Milestone or Elapsed Day */}
                                                        <span className={`inline-flex min-h-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-black leading-none ${
                                                            weekMilestone !== null
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
                                <h3 className="text-[1.1rem] font-bold text-[#1e293b] mb-6">Log Symptoms for Today</h3>

                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {SYMPTOMS.map((symptom) => {
                                        const isSymptomLogged = todayLog.symptoms.includes(symptom.label);
                                        return (
                                            <button
                                                key={symptom.label}
                                                type="button"
                                                onClick={() => toggleSymptom(todayStr, symptom.label)}
                                                className={`
                                                    flex flex-col items-center justify-center min-w-[105px] h-[115px] rounded-[1.5rem] transition-colors border-2 cursor-pointer
                                                    ${isSymptomLogged
                                                        ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                        : 'bg-[#F8FAFC] border-transparent hover:border-teal-50 hover:bg-slate-50'}
                                                `}
                                            >
                                                <img src={symptom.icon} alt={symptom.label} className="h-10 w-10 object-contain mb-3" />
                                                <span className="text-[11px] font-bold text-slate-700">{symptom.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

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
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-[1.5rem] transition-colors border-2 cursor-pointer ${
                                                isSymptomLogged
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
                                    const activeLog = logs[selectedDateStr] || { symptoms: [] };
                                    const isMoodSelected = activeLog.mood === moodItem.label;
                                    return (
                                        <button
                                            key={moodItem.label}
                                            type="button"
                                            onClick={() => {
                                                const nextMood = isMoodSelected ? undefined : moodItem.label;
                                                saveLogForDate(selectedDateStr, {
                                                    ...activeLog,
                                                    mood: nextMood,
                                                });
                                            }}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border-2 transition-colors text-left text-sm font-bold cursor-pointer ${
                                                isMoodSelected
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

            <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 scale-110 origin-bottom">
                <BottomNav activeItem="calendar" />
            </div>
        </div>
    );
};

export default CatPregnancyTracker;