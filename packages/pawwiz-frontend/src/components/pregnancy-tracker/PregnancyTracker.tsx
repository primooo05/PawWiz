import React from 'react';
import BottomNav from '../BottomNav';
import LoadingScreen from '../LoadingScreen';
import SetupView from './SetupView';
import DashboardView from './DashboardView';

import { usePregnancyTracker } from '../../hooks/usePregnancyTracker';
import pawWizText from '../../assets/PawWiz_Text_logo.png';

interface NavItem {
    label: string;
    isActive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'HOME' },
    { label: 'MONITORING', isActive: true },
    { label: 'DIET' },
    { label: 'ACTIVITIES' },
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
        logs,
        selectedDateStr,
        isBottomSheetOpen,
        openLogForDate,
        closeBottomSheet,
        saveLogForDate,
    } = usePregnancyTracker();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
        }
    };

    const isDateLoggable = (year: number, monthIdx: number, dayNum: number) => {
        if (!matingDate) return false;
        const calendarDate = new Date(year, monthIdx, dayNum);
        calendarDate.setHours(0, 0, 0, 0);

        const baseDate = new Date(matingDate + 'T00:00:00');
        baseDate.setHours(0, 0, 0, 0);

        const todayVal = new Date();
        todayVal.setHours(0, 0, 0, 0);

        if (calendarDate.getTime() > todayVal.getTime()) {
            return false;
        }

        const diffTime = calendarDate.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays < 65;
    };

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

    const today = new Date();
    const todayStr = getLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    const todayLog = logs[todayStr] || { symptoms: [], moods: [] };
    const todayLoggable = isDateLoggable(today.getFullYear(), today.getMonth(), today.getDate());

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
                            className={`hover:text-teal-500 transition-colors ${item.isActive ? 'text-teal-500 border-b-[3px] border-teal-500 pb-1' : ''
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
                    <SetupView
                        matingDate={matingDate}
                        setMatingDate={setMatingDate}
                        onSubmit={startTrackingWithLoading}
                    />
                ) : (
                    <DashboardView
                        matingDate={matingDate}
                        setIsTracking={setIsTracking}
                        currentDay={currentDay}
                        daysRemaining={daysRemaining}
                        currentWeek={currentWeek}
                        dueDateString={dueDateString}
                        progressPercentage={progressPercentage}
                        currentYear={currentYear}
                        currentMonthIndex={currentMonthIndex}
                        currentMonthLabel={currentMonthLabel}
                        calendarGrid={calendarGrid}
                        changeCalendarMonth={changeCalendarMonth}
                        getElapsedDayLabel={getElapsedDayLabel}
                        getWeekMilestone={getWeekMilestone}
                        getLocalDateStr={getLocalDateStr}
                        getDayBadgeClassName={getDayBadgeClassName}
                        logs={logs}
                        selectedDateStr={selectedDateStr}
                        isBottomSheetOpen={isBottomSheetOpen}
                        openLogForDate={openLogForDate}
                        closeBottomSheet={closeBottomSheet}
                        saveLogForDate={saveLogForDate}
                        toggleSymptom={toggleSymptom}
                        isDateLoggable={isDateLoggable}
                        todayStr={todayStr}
                        todayLog={todayLog}
                        todayLoggable={todayLoggable}
                    />
                )}
            </main>

            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="calendar" className="w-full max-w-sm md:w-auto md:scale-110" />
            </div>

            {isLoading && (
                <LoadingScreen
                    durationMs={7000}
                    onComplete={() => {
                        setIsLoading(false);
                        setIsTracking(true);
                    }}
                />
            )}
        </div>
    );
};

export default CatPregnancyTracker;