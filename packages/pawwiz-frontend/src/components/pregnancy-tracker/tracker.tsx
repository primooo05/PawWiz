import React, { useState } from 'react';

// --- Types & Interfaces ---
interface NavItem {
    label: string;
    isActive?: boolean;
}

interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    hasEvent?: boolean;
    isSelected?: boolean;
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
    { label: 'Nesting', icon: '🧺' },
    { label: 'Appetite Up', icon: '🐟' },
    { label: 'Vomiting', icon: '🤢' },
];

const CatPregnancyTracker: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<number>(10);

    // Generate a mock calendar grid for a 30-day month
    const calendarDays: CalendarDay[] = Array.from({ length: 35 }, (_, i) => {
        const date = i - 2; // Offset to simulate previous/next month days
        return {
            date: date > 0 && date <= 30 ? date : Math.abs(date) || 31,
            isCurrentMonth: date > 0 && date <= 30,
            hasEvent: [2, 8, 15].includes(date),
            isSelected: date === selectedDate,
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navigation Bar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight">🐾 PawWiz</span>
                </div>
                <div className="flex items-center gap-6 text-sm font-bold text-gray-500 uppercase tracking-wide">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.label}
                            className={`hover:text-teal-500 transition-colors ${
                                item.isActive ? 'text-teal-500 border-b-2 border-teal-500 pb-1' : ''
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button className="px-5 py-2 ml-4 text-gray-900 bg-yellow-300 rounded-full hover:bg-yellow-400 transition-colors">
                        SIGN IN
                    </button>
                </div>
            </nav>

            {/* Main Content Dashboard */}
            <main className="max-w-6xl px-8 py-12 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Progress & Current Status */}
                <div className="flex flex-col gap-6 md:col-span-1">
                    <div className="p-8 bg-white rounded-3xl shadow-sm flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-6">Molly's Cycle</h2>

                        {/* Circular Progress Indicator (CSS implementation) */}
                        <div className="relative w-48 h-48 rounded-full border-[12px] border-gray-100 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 rounded-full border-[12px] border-teal-400 border-t-transparent border-l-transparent transform -rotate-45" />
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-bold uppercase">Week 5/9</p>
                                <p className="text-2xl font-black text-teal-600">Day 35</p>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-teal-50 rounded-2xl">
                                <p className="text-xs font-bold text-gray-500 mb-1">Due In</p>
                                <p className="text-lg font-black">28 Days</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-2xl">
                                <p className="text-xs font-bold text-gray-500 mb-1">Phase</p>
                                <p className="text-lg font-black">Fetal</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <p className="text-xs font-bold text-gray-500 mb-1">Kittens</p>
                                <p className="text-lg font-black">1-6 avg</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle/Right Column: Calendar & Symptoms */}
                <div className="flex flex-col gap-6 md:col-span-2">

                    {/* Calendar Module */}
                    <div className="p-8 bg-white rounded-3xl shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">{'<'}</button>
                            <h2 className="text-xl font-black">October 2026</h2>
                            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">{'>'}</button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center mb-4 text-sm font-bold text-gray-400 uppercase">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
                            {calendarDays.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                                    disabled={!day.isCurrentMonth}
                                    className={`
                    w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center relative font-bold transition-all
                    ${!day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-teal-50'}
                    ${day.isSelected ? 'bg-teal-400 text-white shadow-md hover:bg-teal-500' : ''}
                  `}
                                >
                                    {day.date}
                                    {day.hasEvent && !day.isSelected && (
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full absolute bottom-1"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Tracker / Symptoms */}
                    <div className="p-8 bg-white rounded-3xl shadow-sm">
                        <h3 className="text-lg font-black mb-4">Log Symptoms for Oct {selectedDate}</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {SYMPTOMS.map((symptom) => (
                                <button
                                    key={symptom.label}
                                    className="flex flex-col items-center justify-center w-20 h-24 bg-gray-50 rounded-2xl hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-200 focus:bg-teal-400 focus:text-white"
                                >
                                    <span className="text-2xl mb-2">{symptom.icon}</span>
                                    <span className="text-xs font-bold">{symptom.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Action Guide extracted from the prompt */}
                        <div className="mt-6 p-4 bg-teal-50 rounded-2xl">
                            <h4 className="text-sm font-black text-teal-800 mb-2 uppercase tracking-wide">Action Guide Checklist</h4>
                            <ul className="text-sm text-teal-900 space-y-2 font-medium">
                                <li className="flex items-center gap-2">🐾 Switch to calcium-rich kitten food</li>
                                <li className="flex items-center gap-2">🐾 Feed smaller, frequent portions</li>
                                <li className="flex items-center gap-2">🐾 Provide comfortable floor mats</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CatPregnancyTracker;