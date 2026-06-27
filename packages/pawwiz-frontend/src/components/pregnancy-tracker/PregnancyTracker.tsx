import React from 'react';
import BottomNav from '../BottomNav';
import LoadingScreen from '../LoadingScreen';
import SetupView from './SetupView';
import DashboardView from './DashboardView';

import { usePregnancyTracker } from '../../hooks/usePregnancyTracker';

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
        toggleSymptom,
        isDateLoggable,
        todayStr,
        todayLog,
        todayLoggable,
        isWeightPickerOpen,
        setIsWeightPickerOpen,
        intVal,
        setIntVal,
        decVal,
        setDecVal,
        unitVal,
        setUnitVal,
        handleUnitChange,
        handleWeightPickerDone,
    } = usePregnancyTracker();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20">
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
                        isWeightPickerOpen={isWeightPickerOpen}
                        setIsWeightPickerOpen={setIsWeightPickerOpen}
                        intVal={intVal}
                        setIntVal={setIntVal}
                        decVal={decVal}
                        setDecVal={setDecVal}
                        unitVal={unitVal}
                        setUnitVal={setUnitVal}
                        handleUnitChange={handleUnitChange}
                        handleWeightPickerDone={handleWeightPickerDone}
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