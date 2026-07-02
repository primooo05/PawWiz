import React from 'react';
import BottomNav from '../BottomNav';
import LoadingScreen from '../LoadingScreen';
import SetupView from './SetupView';
import DashboardView from './DashboardView';

import { usePregnancyTracker } from '../../hooks/usePregnancyTracker';
import { useNavigate } from 'react-router-dom';

const CatPregnancyTracker: React.FC = () => {
    const navigate = useNavigate();
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
        isDateLoggable,
        todayStr,
        todayLog,
        todayLoggable,
        elapsedDayForSelected,
        hasVetWarningForSelected,
        hasNauseaInEarlyWeeksForSelected,
    } = usePregnancyTracker();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
        }
    };

    const handleNavigation = (item: string) => {
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/dashboard');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        } else if (item === 'settings') {
            navigate('/settings');
        } else if (item === 'plant') {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
            {/* Main Content Area */}
            <main className={!isTracking ? "max-w-[1440px] w-full px-8 py-12 mx-auto" : "w-full px-4 sm:px-6 md:px-8 py-6 flex-grow flex flex-col justify-stretch"}>
                {!isTracking ? (
                    <SetupView
                        matingDate={matingDate}
                        setMatingDate={setMatingDate}
                        onSubmit={startTrackingWithLoading}
                    />
                ) : (
                    <DashboardView
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
                        isDateLoggable={isDateLoggable}
                        todayStr={todayStr}
                        todayLog={todayLog}
                        todayLoggable={todayLoggable}
                        elapsedDayForSelected={elapsedDayForSelected}
                        hasVetWarningForSelected={hasVetWarningForSelected}
                        hasNauseaInEarlyWeeksForSelected={hasNauseaInEarlyWeeksForSelected}
                    />
                )}
            </main>

            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
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