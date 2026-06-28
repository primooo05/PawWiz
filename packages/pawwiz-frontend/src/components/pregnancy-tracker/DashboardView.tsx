import React, { useState, useEffect } from 'react';
import type { DailyLog } from '../../hooks/usePregnancyTracker';
import CycleProgressCard from './CycleProgressCard';
import CalendarModule from './CalendarModule';
import TodaySymptomsCard from './TodaySymptomsCard';
import SymptomLogForm from './SymptomLogForm';
import WeightPickerModal from '../modals/WeightPickerModal';
import ConfirmationDialog from '../modals/ConfirmationDialog';
import { useWeightManager } from '../../hooks/useWeightManager';
import { AnimatePresence } from 'motion/react';

interface DashboardViewProps {
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
    isDateLoggable: (year: number, monthIdx: number, dayNum: number) => boolean;
    todayStr: string;
    todayLog: DailyLog;
    todayLoggable: boolean;
    
    // Derived values from parent/hook
    elapsedDayForSelected?: number | null;
    hasVetWarningForSelected?: boolean;
    hasNauseaInEarlyWeeksForSelected?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
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
    elapsedDayForSelected = null,
    hasVetWarningForSelected = false,
    hasNauseaInEarlyWeeksForSelected = false,
}) => {
    const [isWeightPickerOpen, setIsWeightPickerOpen] = useState(false);
    const [isEduExpanded, setIsEduExpanded] = useState(true);
    const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);

    const activeSummaryDateStr = selectedDateStr || todayStr;
    const activeSummaryLog = logs[activeSummaryDateStr] || { symptoms: [], moods: [] };

    // Weight hook usage
    const activeWeight = selectedDateStr ? logs[selectedDateStr]?.weight : undefined;
    const {
        intVal,
        setIntVal,
        decVal,
        setDecVal,
        unitVal,
        handleUnitChange,
    } = useWeightManager(activeWeight);

    // Sync weight manager state when picker is opened or selected date changes
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
    }, [isWeightPickerOpen, selectedDateStr, logs, unitVal, setIntVal, setDecVal]);

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

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">
                {/* LEFT COLUMN: Molly's Cycle (Soft UI) */}
                <CycleProgressCard
                    progressPercentage={progressPercentage}
                    currentWeek={currentWeek}
                    currentDay={currentDay}
                    daysRemaining={daysRemaining}
                    dueDateString={dueDateString}
                    activeSummaryDateStr={activeSummaryDateStr}
                    todayStr={todayStr}
                    activeSummaryLog={activeSummaryLog}
                    isEduExpanded={isEduExpanded}
                    setIsEduExpanded={setIsEduExpanded}
                    onEditClick={() => setIsConfirmEditOpen(true)}
                />

                {/* RIGHT COLUMN: Calendar & Symptoms */}
                <div className="flex flex-col gap-10 mt-6">
                    {/* Labor Warning Card for Week 8-9 */}
                    {currentWeek >= 8 && (
                        <div className="bg-red-50 border-2 border-red-500 rounded-[2rem] p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">⚠️</span>
                                <h3 className="text-sm font-black text-red-950 uppercase tracking-wider">Labor is Near (Week {currentWeek})</h3>
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
                                        <label key={item.id} className="flex items-center gap-2 text-xs font-bold text-slate-770 cursor-pointer">
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
                    <CalendarModule
                        currentMonthLabel={currentMonthLabel}
                        currentYear={currentYear}
                        changeCalendarMonth={changeCalendarMonth}
                        calendarGrid={calendarGrid}
                        getLocalDateStr={getLocalDateStr}
                        logs={logs}
                        selectedDateStr={selectedDateStr}
                        isDateLoggable={isDateLoggable}
                        openLogForDate={openLogForDate}
                        getWeekMilestone={getWeekMilestone}
                        getElapsedDayLabel={getElapsedDayLabel}
                        getDayBadgeClassName={getDayBadgeClassName}
                        currentMonthIndex={currentMonthIndex}
                    />

                    {/* BOTTOM: Soft Symptoms Card */}
                    <TodaySymptomsCard
                        todayLoggable={todayLoggable}
                        todayStr={todayStr}
                        openLogForDate={openLogForDate}
                        currentWeek={currentWeek}
                        todayLog={todayLog}
                    />
                </div>
            </div>

            {/* Bottom Sheet Drawer for Log entry */}
            <SymptomLogForm
                isOpen={isBottomSheetOpen}
                selectedDateStr={selectedDateStr}
                closeBottomSheet={closeBottomSheet}
                elapsedDayForSelected={elapsedDayForSelected}
                currentWeek={currentWeek}
                logs={logs}
                saveLogForDate={saveLogForDate}
                setIsWeightPickerOpen={setIsWeightPickerOpen}
                hasVetWarningForSelected={hasVetWarningForSelected}
                hasNauseaInEarlyWeeksForSelected={hasNauseaInEarlyWeeksForSelected}
            />

            {/* Weight Picker Modal */}
            <AnimatePresence>
                {isWeightPickerOpen && (
                    <WeightPickerModal
                        isOpen={isWeightPickerOpen}
                        onClose={() => setIsWeightPickerOpen(false)}
                        intVal={intVal}
                        setIntVal={setIntVal}
                        decVal={decVal}
                        setDecVal={setDecVal}
                        unitVal={unitVal}
                        handleUnitChange={handleUnitChange}
                        handleWeightPickerDone={handleWeightPickerDone}
                    />
                )}
            </AnimatePresence>

            <ConfirmationDialog
                isOpen={isConfirmEditOpen}
                title="Edit Mating Date?"
                message="Are you sure you want to edit the mating date? This will recalculate your pregnancy tracker cycle."
                confirmText="Edit"
                cancelText="Keep Tracking"
                onConfirm={() => {
                    setIsConfirmEditOpen(false);
                    setIsTracking(false);
                }}
                onCancel={() => setIsConfirmEditOpen(false)}
            />
        </>
    );
};

export default DashboardView;
