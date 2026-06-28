import React from 'react';
import type { DailyLog } from '../../hooks/usePregnancyTracker';

import nestingIcon from '../../assets/nesting.png';
import appetiteUpIcon from '../../assets/appetite-up.png';
import pinkingUpIcon from '../../assets/pinking-up.png';
import sleepIcon from '../../assets/sleep.png';
import vomitingIcon from '../../assets/vomiting.png';
import weightGainIcon from '../../assets/weight-gain.png';
import milkProductionIcon from '../../assets/milk-production.png';
import contractionsIcon from '../../assets/contractions.png';

const getSymptomsForWeek = (week: number) => {
    if (week <= 3) {
        return [
            { label: 'Nausea', icon: vomitingIcon },
            { label: 'Nipple Changes', icon: pinkingUpIcon },
            { label: 'Weight Gain', icon: weightGainIcon },
            { label: 'Lethargy', icon: sleepIcon },
        ];
    } else if (week <= 6) {
        return [
            { label: 'Weight Gain', icon: weightGainIcon },
            { label: 'Appetite Changes', icon: appetiteUpIcon },
            { label: 'Lethargy', icon: sleepIcon },
            { label: 'Nipple Changes', icon: pinkingUpIcon },
        ];
    } else {
        return [
            { label: 'Nesting', icon: nestingIcon },
            { label: 'Milk Production', icon: milkProductionIcon },
            { label: 'Contractions', icon: contractionsIcon },
            { label: 'Appetite Changes', icon: appetiteUpIcon },
        ];
    }
};

interface TodaySymptomsCardProps {
    todayLoggable: boolean;
    todayStr: string;
    openLogForDate: (dateStr: string) => void;
    currentWeek: number;
    todayLog: DailyLog;
}

export const TodaySymptomsCard: React.FC<TodaySymptomsCardProps> = ({
    todayLoggable,
    todayStr,
    openLogForDate,
    currentWeek,
    todayLog,
}) => {
    const safeTodayLog = todayLog || { symptoms: [], symptomSeverities: {} };

    return (
        <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[1.1rem] font-bold text-[#1e293b]">Log Symptoms for Today</h3>
                <button
                    type="button"
                    disabled={!todayLoggable}
                    onClick={() => openLogForDate(todayStr)}
                    className={`px-4 py-2 bg-[#FFEA30] border-2 border-slate-900 text-slate-900 rounded-full text-xs font-black transition-all duration-200 ease-out shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${todayLoggable
                        ? 'hover:bg-yellow-400 hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95 active:shadow-[1px_1px_0_0_rgba(15,23,42,1)] cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                        }`}
                >
                    Log
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {getSymptomsForWeek(currentWeek).map((symptom) => {
                    const isSymptomLogged = (safeTodayLog.symptoms || []).includes(symptom.label);
                    const severity = safeTodayLog.symptomSeverities?.[symptom.label];
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
                            <img
                                src={symptom.icon}
                                alt={symptom.label}
                                className={`h-10 w-10 object-contain mb-3 transition-opacity ${isSymptomLogged ? 'opacity-100' : 'opacity-40'}`}
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
