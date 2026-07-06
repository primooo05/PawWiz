import React from 'react';
import type { DailyLog } from '../../../../hooks/trackers/usePregnancyTracker';
import { Droplet, Palette, Scale, Moon, UtensilsCrossed, Home, Milk, Zap } from 'lucide-react';
import TodayLogStatus from '../flo/TodayLogStatus';

const getSymptomsForWeek = (week: number) => {
    if (week <= 3) {
        return [
            { label: 'Nausea', icon: Droplet },
            { label: 'Nipple Changes', icon: Palette },
            { label: 'Weight Gain', icon: Scale },
            { label: 'Lethargy', icon: Moon },
        ];
    } else if (week <= 6) {
        return [
            { label: 'Weight Gain', icon: Scale },
            { label: 'Appetite Changes', icon: UtensilsCrossed },
            { label: 'Lethargy', icon: Moon },
            { label: 'Nipple Changes', icon: Palette },
        ];
    } else {
        return [
            { label: 'Nesting Behavior', icon: Home },
            { label: 'Milk Production', icon: Milk },
            { label: 'Contractions', icon: Zap },
            { label: 'Appetite Changes', icon: UtensilsCrossed },
        ];
    }
};

interface TodaySymptomsCardProps {
    todayLoggable: boolean;
    todayStr: string;
    openLogForDate: (dateStr: string) => void;
    currentWeek: number;
    todayLog: DailyLog;
    loggedToday: boolean;
}

export const TodaySymptomsCard: React.FC<TodaySymptomsCardProps> = ({
    todayLoggable,
    todayStr,
    openLogForDate,
    currentWeek,
    todayLog,
    loggedToday,
}) => {
    const safeTodayLog = todayLog || { symptoms: [], symptomSeverities: {} };

    return (
        <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[1.1rem] font-bold text-[#1e293b]">Log Symptoms for Today</h3>
                <TodayLogStatus
                    loggedToday={loggedToday}
                    onClick={() => {
                        if (todayLoggable) {
                            openLogForDate(todayStr);
                        }
                    }}
                    className={!todayLoggable ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
                />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {getSymptomsForWeek(currentWeek).map((symptom) => {
                    const isSymptomLogged = (safeTodayLog.symptoms || []).includes(symptom.label);
                    const severity = safeTodayLog.symptomSeverities?.[symptom.label];
                    const SymptomIcon = symptom.icon;
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
                            <SymptomIcon
                                aria-label={symptom.label}
                                className={`h-10 w-10 mb-3 transition-opacity ${isSymptomLogged ? 'opacity-100' : 'opacity-40'}`}
                                strokeWidth={2}
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
    );
};

export default TodaySymptomsCard;
