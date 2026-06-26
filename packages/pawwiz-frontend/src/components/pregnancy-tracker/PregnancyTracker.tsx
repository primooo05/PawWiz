import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';
import BottomNav from '../BottomNav';

import pawWizText from '../../assets/PawWiz_Text_logo.png';

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
    { label: 'Lethargy', icon: '💤' },
    { label: 'Nesting', icon: '🧺', isActive: true }, // Added active state to match mockup
    { label: 'Appetite Up', icon: '🐟' },
    { label: 'Vomiting', icon: '🤢' },
];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const CatPregnancyTracker: React.FC = () => {
    const location = useLocation();
    const passedDate = location.state?.incomingMatingDate || '';

    const [matingDate, setMatingDate] = useState<string>(passedDate);
    const [isTracking, setIsTracking] = useState<boolean>(!!passedDate);

    const trackedDate = matingDate ? new Date(matingDate) : null;
    const initialDisplayDate = trackedDate ?? new Date();
    const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(initialDisplayDate.getMonth());
    const [calendarYear, setCalendarYear] = useState<number>(initialDisplayDate.getFullYear());

    useEffect(() => {
        if (!trackedDate) return;

        setCalendarMonthIndex(trackedDate.getMonth());
        setCalendarYear(trackedDate.getFullYear());
    }, [matingDate]);

    // --- Dynamic Pregnancy Calculations ---
    const GESTATION_DAYS = 65;

    let currentDay = 0;
    let daysRemaining = GESTATION_DAYS;
    let currentWeek = 1;
    let dueDateString = 'TBD';

    if (matingDate) {
        const start = new Date(matingDate);
        const today = new Date();

        const diffTime = Math.abs(today.getTime() - start.getTime());
        currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (currentDay > GESTATION_DAYS) currentDay = GESTATION_DAYS;

        daysRemaining = GESTATION_DAYS - currentDay;
        currentWeek = Math.ceil(currentDay / 7) || 1;

        const dueDate = new Date(start);
        dueDate.setDate(dueDate.getDate() + GESTATION_DAYS);
        dueDateString = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const dueDate = trackedDate ? new Date(trackedDate) : null;

    if (dueDate) {
        dueDate.setDate(dueDate.getDate() + GESTATION_DAYS);
    }

    const progressPercentage = (currentDay / GESTATION_DAYS) * 100;

    const handleStartTracking = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) setIsTracking(true);
    };

    const changeCalendarMonth = (direction: -1 | 1) => {
        setCalendarMonthIndex((previousMonth) => {
            if (direction === -1 && previousMonth === 0) {
                setCalendarYear((previousYear) => previousYear - 1);
                return 11;
            }

            if (direction === 1 && previousMonth === 11) {
                setCalendarYear((previousYear) => previousYear + 1);
                return 0;
            }

            return previousMonth + direction;
        });
    };

    // --- Dynamic Calendar Generation ---
    const currentYear = calendarYear;
    const currentMonthIndex = calendarMonthIndex;
    const currentMonthLabel = MONTHS[currentMonthIndex];

    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

    const calendarBlanks = Array(firstDayOfMonth).fill(null);

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const calendarGrid = [...calendarBlanks, ...calendarDays];
    const startDate = trackedDate ? new Date(trackedDate) : null;

    const isSameCalendarDay = (leftDate: Date, rightDate: Date) =>
        leftDate.getFullYear() === rightDate.getFullYear() &&
        leftDate.getMonth() === rightDate.getMonth() &&
        leftDate.getDate() === rightDate.getDate();

    const getElapsedDayLabel = (day: number) => {
        if (!startDate) return null;

        const calendarDate = new Date(currentYear, currentMonthIndex, day);
        if (dueDate && calendarDate.getTime() > dueDate.getTime()) return null;

        const diffTime = calendarDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return null;

        return diffDays + 1;
    };

    const getDayBadgeClassName = (day: number) => {
        const calendarDate = new Date(currentYear, currentMonthIndex, day);

        if (startDate && isSameCalendarDay(calendarDate, startDate)) {
            return 'bg-[#FFEA30] border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]';
        }

        if (dueDate && isSameCalendarDay(calendarDate, dueDate)) {
            return 'bg-[#FFEA30] border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]';
        }

        return 'bg-white border border-slate-200 text-slate-500';
    };

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
                                        {calendarGrid.map((day, idx) => (
                                            <div key={idx} className="flex justify-center items-center">
                                                {day ? (
                                                    <div className="flex flex-col items-center justify-center gap-1 min-h-12">
                                                        <span className="inline-flex min-h-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none text-slate-400">
                                                            {getElapsedDayLabel(day)}
                                                        </span>
                                                        <div className={`flex items-center justify-center w-10 h-10 font-black text-lg rounded-full ${getDayBadgeClassName(day)}`}>
                                                            {day}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM: Soft Symptoms Card */}
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
                                <h3 className="text-[1.1rem] font-bold text-[#1e293b] mb-6">Log Symptoms for Today</h3>

                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {SYMPTOMS.map((symptom) => (
                                        <button
                                            key={symptom.label}
                                            className={`
                        flex flex-col items-center justify-center min-w-[105px] h-[115px] rounded-[1.5rem] transition-colors border-2
                        ${symptom.isActive
                                                ? 'bg-[#EEF9F8] border-teal-100'
                                                : 'bg-[#F8FAFC] border-transparent hover:border-teal-50 hover:bg-slate-50'}
                      `}
                                        >
                                            <span className="text-3xl mb-3">{symptom.icon}</span>
                                            <span className="text-[11px] font-bold text-slate-700">{symptom.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>

            <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 scale-110 origin-bottom">
                <BottomNav activeItem="calendar" />
            </div>
        </div>
    );
};

export default CatPregnancyTracker;