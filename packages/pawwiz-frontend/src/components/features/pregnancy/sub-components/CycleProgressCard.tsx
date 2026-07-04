import React from 'react';
import type { DailyLog } from '../../../../hooks/trackers/usePregnancyTracker';
import { Stethoscope, PawPrint, Scale, Thermometer } from 'lucide-react';

const WEEK_DESCRIPTIONS: Record<number, string> = {
    1: "Fertilization occurs. Eggs travel to the uterus. No visible symptoms yet; keep her stress levels low.",
    2: "Blastocysts implant in the uterine lining. The placenta begins to form. You may notice her sleeping slightly more.",
    3: "Fetal development begins. Nipples may start pinking up (turning darker pink and losing hair). Slight nausea might occur.",
    4: "Kittens' organs are forming. You may notice nipple pinking and mild nausea. Avoid rough handling and consult your vet.",
    5: "Fetal structures are fully established; claws and whiskers develop. Her abdomen starts to visibly swell. Increase food portions.",
    6: "Rapid fetal growth. Kittens double in size. Molly becomes visibly rounder and may groom herself more frequently.",
    7: "Kitten hair starts to grow. You might feel movement if you place your hand gently on her belly. Nesting behavior begins.",
    8: "Fetal development is complete. Molly starts producing milk. She may search for a nesting area and show restlessness.",
    9: "Labor is imminent. Kittens are ready to be born. Watch for nesting, temperature drop, and behavioral changes.",
};

interface CycleProgressCardProps {
    progressPercentage: number;
    currentWeek: number;
    currentDay: number;
    daysRemaining: number;
    dueDateString: string;
    activeSummaryDateStr: string;
    todayStr: string;
    activeSummaryLog: DailyLog;
    isEduExpanded: boolean;
    setIsEduExpanded: (val: boolean) => void;
    onEditClick: () => void;
}

export const CycleProgressCard: React.FC<CycleProgressCardProps> = ({
    progressPercentage,
    currentWeek,
    currentDay,
    daysRemaining,
    dueDateString,
    activeSummaryDateStr,
    todayStr,
    activeSummaryLog,
    isEduExpanded,
    setIsEduExpanded,
    onEditClick,
}) => {
    return (
        <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center border border-slate-50 h-full w-full">
            <div className="w-full flex justify-between items-center mb-8">
                <h2 className="text-[1.35rem] font-bold text-[#1e293b]">Molly's Cycle</h2>
                <button
                    onClick={onEditClick}
                    className="text-xs font-bold text-teal-400 hover:text-teal-600 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                    Edit Date
                </button>
            </div>

            {/* Circular Progress */}
            <div 
                className="relative w-56 h-56 rounded-full flex items-center justify-center mb-8 shadow-sm border-2 border-slate-900"
                style={{ 
                    background: `conic-gradient(#14b8a6 ${progressPercentage}%, #f8fafc ${progressPercentage}%)` 
                }}
            >
                <div className="w-[188px] h-[188px] bg-white rounded-full flex flex-col items-center justify-center border-2 border-slate-900 shadow-inner z-10">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">WEEK {currentWeek}/9</p>
                    <p className="text-4xl font-black text-teal-500 tracking-tight">Day {currentDay}</p>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-[#F2FBF9] rounded-[1.25rem]">
                    <p className="text-[10px] font-bold text-teal-800/70 mb-1 uppercase tracking-widest">DUE IN</p>
                    <p className="text-xl font-black text-teal-900">{daysRemaining} Days</p>
                </div>
                <div className="p-4 bg-[#FFFDF0] rounded-[1.25rem]">
                    <p className="text-[10px] font-bold text-yellow-800/70 mb-1 uppercase tracking-widest">EST. DUE</p>
                    <p className="text-sm font-black text-yellow-900 mt-1">{dueDateString}</p>
                </div>
            </div>

            <hr className="w-full border-slate-100 my-6" />

            <div className="w-full flex flex-col gap-4 text-left">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {activeSummaryDateStr === todayStr ? "Today's Summary" : `${new Date(activeSummaryDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Summary`}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Symptoms Card */}
                    <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-500">
                                <Stethoscope className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100/50 px-2 py-0.5 rounded-full">
                                {activeSummaryLog.symptoms && activeSummaryLog.symptoms.length > 0 ? `${activeSummaryLog.symptoms.length} Logged` : 'None'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptoms</p>
                            <div className="flex flex-col gap-1 mt-1">
                                {activeSummaryLog.symptoms && activeSummaryLog.symptoms.length > 0 ? (
                                    activeSummaryLog.symptoms.map((s: string) => {
                                        const severity = activeSummaryLog.symptomSeverities?.[s];
                                        return (
                                            <span key={s} className="text-[10px] font-black text-teal-800 leading-tight">
                                                • {s}{severity ? ` (${severity[0]})` : ''}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-[10px] font-semibold text-slate-400 italic">No signs</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Behavior Card */}
                    <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-yellow-600">
                                <PawPrint className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-bold text-yellow-800 bg-yellow-100/50 px-2 py-0.5 rounded-full">
                                {activeSummaryLog.moods && activeSummaryLog.moods.length > 0 ? 'Active' : 'Normal'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Behavior</p>
                            <div className="flex flex-col gap-1 mt-1">
                                {activeSummaryLog.moods && activeSummaryLog.moods.length > 0 ? (
                                    activeSummaryLog.moods.map((m: string) => (
                                        <span key={m} className="text-[10px] font-black text-yellow-900 leading-tight">
                                            • {m}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-semibold text-slate-400 italic">Calm</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weight Card */}
                    <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-sky-500">
                                <Scale className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-100/50 px-2 py-0.5 rounded-full">
                                {activeSummaryLog.weight !== undefined ? 'Logged' : 'None'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</p>
                            <p className="text-base font-black text-slate-800 mt-1">
                                {activeSummaryLog.weight !== undefined ? `${activeSummaryLog.weight} kg` : 'Not logged'}
                            </p>
                        </div>
                    </div>

                    {/* Temperature Card */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                                <Thermometer className="h-5 w-5" strokeWidth={2} />
                            </div>
                            {activeSummaryLog.temperature !== undefined ? (
                                activeSummaryLog.temperature < 37.2 ? (
                                    <span className="text-[10px] font-bold text-red-800 bg-red-100/50 px-2 py-0.5 rounded-full">
                                        Labor Sign
                                    </span>
                                ) : (activeSummaryLog.temperature >= 37.7 && activeSummaryLog.temperature <= 39.2) ? (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                                        Stable
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-orange-850 bg-orange-100/50 px-2 py-0.5 rounded-full">
                                        Warning
                                    </span>
                                )
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    None
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</p>
                            <p className="text-base font-black text-slate-800 mt-1">
                                {activeSummaryLog.temperature !== undefined ? `${activeSummaryLog.temperature} °C` : 'Not logged'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expandable Weekly Educational Insights Card */}
                <div className="w-full mt-5 bg-white border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                    <button
                        type="button"
                        onClick={() => setIsEduExpanded(!isEduExpanded)}
                        className="w-full px-5 py-4 flex items-center justify-between text-xs font-black text-slate-900 bg-[#40C48E] hover:opacity-95 transition-opacity cursor-pointer border-b-2 border-slate-900"
                    >
                        <span className="tracking-wide"> WEEK {currentWeek} DEVELOPMENT</span>
                        <span className="text-[10px]">{isEduExpanded ? '▼' : '▶'}</span>
                    </button>
                    {isEduExpanded && (
                        <div className="p-5 text-xs font-semibold text-slate-700 leading-relaxed bg-white animate-fadeIn">
                            {WEEK_DESCRIPTIONS[currentWeek] || "Molly is growing her kittens. Keep her comfortable and fed with high-quality kitten formula."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CycleProgressCard;
