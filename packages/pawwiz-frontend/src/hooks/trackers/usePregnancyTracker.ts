import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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

export interface DailyLog {
    symptoms: string[];
    moods?: string[];
    weight?: number;
    symptomSeverities?: Record<string, 'Mild' | 'Moderate' | 'Severe'>;
    temperature?: number;
}

export const getInitialLogs = (matingDateStr: string): Record<string, DailyLog> => {
    if (!matingDateStr) return {};
    const base = new Date(matingDateStr);

    const getOffsetDateStr = (days: number) => {
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    return {
        [getOffsetDateStr(7)]: {
            symptoms: ['Nesting', 'Pinking Up'],
            moods: ['Quiet'],
            weight: 3.8,
        },
        [getOffsetDateStr(14)]: {
            symptoms: ['Appetite Up', 'Extra Sleep'],
            moods: ['Affectionate'],
            weight: 4.1,
        },
        [getOffsetDateStr(21)]: {
            symptoms: ['Vomiting', 'Weight Gain'],
            moods: ['Calm'],
            weight: 4.2,
        },
    };
};

export function usePregnancyTracker() {
    const location = useLocation();
    const passedDate = location.state?.incomingMatingDate || '';

    const [matingDate, setMatingDate] = useState<string>(passedDate);
    const [isTracking, setIsTracking] = useState<boolean>(!!passedDate);
    const [logs, setLogs] = useState<Record<string, DailyLog>>({});
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

    const trackedDate = matingDate ? new Date(matingDate) : null;
    const initialDisplayDate = trackedDate ?? new Date();
    const [calendarMonthIndex, setCalendarMonthIndex] = useState<number>(initialDisplayDate.getMonth());
    const [calendarYear, setCalendarYear] = useState<number>(initialDisplayDate.getFullYear());


    useEffect(() => {
        if (!trackedDate) return;

        setCalendarMonthIndex(trackedDate.getMonth());
        setCalendarYear(trackedDate.getFullYear());
    }, [matingDate]);

    useEffect(() => {
        if (matingDate) {
            setLogs((prev) => {
                if (Object.keys(prev).length > 0) return prev;
                return getInitialLogs(matingDate);
            });
        }
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

    const getWeekMilestone = (day: number): number | null => {
        const elapsed = getElapsedDayLabel(day);
        if (elapsed === null) return null;
        if ((elapsed - 1) % 7 === 0) {
            return Math.floor((elapsed - 1) / 7) + 1;
        }
        return null;
    };

    const getLocalDateStr = (year: number, monthIdx: number, dayNum: number) => {
        const mm = String(monthIdx + 1).padStart(2, '0');
        const dd = String(dayNum).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    const getDayBadgeClassName = (day: number, isSelected: boolean) => {
        const calendarDate = new Date(currentYear, currentMonthIndex, day);
        const today = new Date();

        let classes = 'relative flex items-center justify-center w-10 h-10 font-black text-lg rounded-full transition-all duration-200 ';

        if (startDate && isSameCalendarDay(calendarDate, startDate)) {
            classes += 'bg-[#15AFB4] text-white border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]';
        } else if (dueDate && isSameCalendarDay(calendarDate, dueDate)) {
            classes += 'bg-[#FF6B6B] text-white border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]';
        } else if (isSameCalendarDay(calendarDate, today)) {
            classes += 'bg-[#FFEA30] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]';
        } else if (startDate && dueDate && calendarDate.getTime() > startDate.getTime() && calendarDate.getTime() < dueDate.getTime()) {
            classes += 'bg-[#EBF7F5] border border-[#15AFB4]/30 text-teal-800';
        } else {
            classes += 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300';
        }

        if (isSelected) {
            classes += ' ring-4 ring-orange-300 border-2 border-slate-900';
        }

        return classes;
    };

    const openLogForDate = (dateStr: string) => {
        setSelectedDateStr(dateStr);
        setIsBottomSheetOpen(true);
    };

    const closeBottomSheet = () => {
        setIsBottomSheetOpen(false);
    };

    const saveLogForDate = (dateStr: string, log: DailyLog) => {
        setLogs((prev) => ({
            ...prev,
            [dateStr]: log,
        }));
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
        const activeLog = logs[dateStr] || { symptoms: [] };
        const isAlreadyLogged = activeLog.symptoms.includes(symptomLabel);
        const nextSymptoms = isAlreadyLogged
            ? activeLog.symptoms.filter((s: string) => s !== symptomLabel)
            : [...activeLog.symptoms, symptomLabel];

        const nextSeverities = { ...(activeLog.symptomSeverities || {}) };
        if (!isAlreadyLogged) {
            nextSeverities[symptomLabel] = 'Mild';
        } else {
            delete nextSeverities[symptomLabel];
        }

        saveLogForDate(dateStr, {
            ...activeLog,
            symptoms: nextSymptoms,
            symptomSeverities: nextSeverities,
        });
    };

    const today = new Date();
    const todayStr = getLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    const todayLog = logs[todayStr] || { symptoms: [], moods: [] };
    const todayLoggable = isDateLoggable(today.getFullYear(), today.getMonth(), today.getDate());

    const [isWeightPickerOpen, setIsWeightPickerOpen] = useState(false);
    const [intVal, setIntVal] = useState(4);
    const [decVal, setDecVal] = useState(0);
    const [unitVal, setUnitVal] = useState<'kg' | 'lbs'>('kg');

    useEffect(() => {
        if (isWeightPickerOpen && selectedDateStr) {
            const activeLog = logs[selectedDateStr];
            if (activeLog && activeLog.weight !== undefined) {
                const w = activeLog.weight;
                if (unitVal === 'lbs') {
                    const totalLbs = w / 0.45359237;
                    setIntVal(Math.floor(totalLbs));
                    setDecVal(Math.round((totalLbs % 1) * 10));
                } else {
                    setIntVal(Math.floor(w));
                    setDecVal(Math.round((w % 1) * 10));
                }
            }
        }
    }, [isWeightPickerOpen, selectedDateStr, logs, unitVal]);

    const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
        if (newUnit === unitVal) return;
        if (newUnit === 'lbs') {
            const currentKg = intVal + decVal / 10;
            const lbs = currentKg / 0.45359237;
            setIntVal(Math.floor(lbs));
            setDecVal(Math.round((lbs % 1) * 10));
        } else {
            const currentLbs = intVal + decVal / 10;
            const kg = currentLbs * 0.45359237;
            setIntVal(Math.floor(kg));
            setDecVal(Math.round((kg % 1) * 10));
        }
        setUnitVal(newUnit);
    };

    const handleWeightPickerDone = () => {
        if (!selectedDateStr) return;
        const currentVal = intVal + decVal / 10;
        let finalWeightKg = currentVal;
        if (unitVal === 'lbs') {
            finalWeightKg = currentVal * 0.45359237;
        }
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

    const activeLogForSelected = selectedDateStr ? (logs[selectedDateStr] || { symptoms: [], symptomSeverities: {} }) : null;
    const hasSevereSymptomForSelected = activeLogForSelected?.symptoms?.some(s => activeLogForSelected.symptomSeverities?.[s] === 'Severe') || false;
    const selectedDateWeek = elapsedDayForSelected !== null ? Math.ceil(elapsedDayForSelected / 7) : currentWeek;
    const hasNauseaInEarlyWeeksForSelected = (selectedDateWeek <= 3 && activeLogForSelected?.symptoms?.includes('Nausea') && activeLogForSelected.symptomSeverities?.['Nausea'] === 'Severe') || false;
    const hasVetWarningForSelected = hasSevereSymptomForSelected || hasNauseaInEarlyWeeksForSelected;

    return {
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
        setLogs,
        selectedDateStr,
        isBottomSheetOpen,
        openLogForDate,
        closeBottomSheet,
        saveLogForDate,
        isDateLoggable,
        toggleSymptom,
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
        elapsedDayForSelected,
        hasVetWarningForSelected,
        hasNauseaInEarlyWeeksForSelected
    };
}
