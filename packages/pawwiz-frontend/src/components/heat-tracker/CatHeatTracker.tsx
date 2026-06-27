import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CatHeatTracker: React.FC = () => {
    const navigate = useNavigate();

    const [currentDate] = useState(new Date('2026-06-26'));
    const [heatStartDate] = useState(new Date('2026-06-22'));

    const diffTime = Math.abs(currentDate.getTime() - heatStartDate.getTime());
    const currentDayOfHeat = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const weekDays = [
        { day: 'S', date: 21, inHeat: false, isToday: false },
        { day: 'M', date: 22, inHeat: true, isToday: false, hasNote: true },
        { day: 'T', date: 23, inHeat: true, isToday: false },
        { day: 'W', date: 24, inHeat: true, isToday: false },
        { day: 'T', date: 25, inHeat: true, isToday: false },
        { day: 'F', date: 26, inHeat: true, isToday: true },
        { day: 'S', date: 27, inHeat: false, isToday: false },
    ];

    const handleLogMating = () => {
        const formattedDate = currentDate.toISOString().split('T')[0];
        navigate('/pregnancy-tracker', { state: { incomingMatingDate: formattedDate } });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <main className="max-w-6xl mx-auto px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: The Calendar (Spans 8 columns on desktop) */}
                    <div className="lg:col-span-8 bg-gradient-to-br from-pink-100 to-pink-50 border-2 border-slate-900 rounded-[2.5rem] p-10 shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative overflow-hidden flex flex-col justify-between min-h-[450px]">

                        {/* Background Decorative Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        {/* Header Area */}
                        <div className="flex justify-between items-center relative z-10 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-yellow-300 border-2 border-slate-900 rounded-full flex items-center justify-center relative shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    <span className="text-3xl">🐱</span>
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 border-2 border-slate-900 rounded-full"></span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">26 June</h2>
                                    <p className="text-slate-600 font-bold uppercase tracking-wider text-sm">Estrus Cycle</p>
                                </div>
                            </div>

                            <button className="w-14 h-14 bg-white border-2 border-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:-translate-y-1">
                                <span className="text-2xl">📅</span>
                            </button>
                        </div>

                        {/* Horizontal Week View */}
                        <div className="flex justify-between items-end relative z-10 w-full px-4 md:px-12">
                            {weekDays.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-4 w-full">
                  <span className={`text-xs md:text-sm font-black tracking-widest uppercase ${d.isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                    {d.isToday ? 'TODAY' : d.day}
                  </span>

                                    <button
                                        className={`
                      w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-black transition-all border-2
                      ${d.isToday ? 'border-slate-900 bg-pink-500 text-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] scale-110' : ''}
                      ${d.inHeat && !d.isToday ? 'border-pink-300 bg-pink-400 text-white shadow-sm' : ''}
                      ${!d.inHeat ? 'border-transparent text-slate-500 hover:bg-white/50' : ''}
                    `}
                                    >
                                        {d.date}
                                    </button>

                                    <div className={`w-2 h-2 rounded-full ${d.hasNote ? 'bg-slate-400' : 'bg-transparent'}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Status & Actions (Spans 4 columns on desktop) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Status Card */}
                        <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center flex-grow">
                            <h3 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-widest">Heat Cycle</h3>
                            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-10">Day {currentDayOfHeat}</h1>

                            <div className="w-full flex flex-col gap-4">
                                <button
                                    onClick={handleLogMating}
                                    className="w-full py-4 bg-indigo-500 text-white font-black text-lg rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                >
                                    <span className="text-2xl">💕</span> Log Mating Event
                                </button>
                                <button className="w-full py-3 bg-pink-50 text-pink-600 font-black rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-100 transition-all">
                                    Edit cycle dates
                                </button>
                            </div>
                        </div>

                        {/* Insights Card */}
                        <div className="bg-emerald-50 border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                            <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span>💡</span> Cycle Insights
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                Estrus typically lasts <span className="text-pink-600 font-black bg-white px-2 py-0.5 rounded-md border border-slate-200">3 to 14 days</span>. If mating occurs, log it above to automatically start tracking the pregnancy.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CatHeatTracker;