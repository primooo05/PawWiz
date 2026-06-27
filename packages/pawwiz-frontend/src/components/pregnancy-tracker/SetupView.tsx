import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';

interface SetupViewProps {
    matingDate: string;
    setMatingDate: (date: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
    matingDate,
    setMatingDate,
    onSubmit,
}) => {
    return (
        <div className="max-w-md mx-auto mt-12 p-10 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border border-slate-50">
            <div className="text-4xl mb-4">🗓️</div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Set up Molly's Profile</h2>
            <p className="text-slate-500 mb-8 text-sm">
                Enter the date of the first successful mating to establish Day 1 of the cycle.
            </p>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                        When did the mating occur?
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={matingDate ? new Date(matingDate + 'T00:00:00') : null}
                            onChange={(date: Date | null) => {
                                if (date) {
                                    const formattedDate = date.toISOString().split('T')[0];
                                    setMatingDate(formattedDate);
                                }
                            }}
                            maxDate={new Date()}
                            className="w-full p-4 pr-12 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent font-medium text-slate-700"
                            placeholderText="Select a date"
                            dateFormat="MM/dd/yyyy"
                            calendarClassName="custom-calendar"
                            renderCustomHeader={({
                                date,
                                decreaseMonth,
                                increaseMonth,
                                prevMonthButtonDisabled,
                                nextMonthButtonDisabled,
                            }) => (
                                <div className="flex justify-center items-center mb-4">
                                    <div className="px-3 py-1.5 bg-[#FFEA30] border-2 border-slate-900 rounded-full font-bold text-slate-900 flex items-center gap-3 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                                        <button
                                            type="button"
                                            onClick={decreaseMonth}
                                            disabled={prevMonthButtonDisabled}
                                            aria-label="Previous Month"
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white text-base font-black leading-none hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {'<'}
                                        </button>
                                        <span className="min-w-[130px] text-center text-sm font-black select-none">
                                            {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={increaseMonth}
                                            disabled={nextMonthButtonDisabled}
                                            aria-label="Next Month"
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/20 bg-white text-base font-black leading-none hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {'>'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                input?.focus();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform pointer-events-auto"
                        >
                            📅
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={!matingDate}
                    className="mt-4 w-full py-4 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                    Calculate Due Date
                </button>
            </form>
        </div>
    );
};

export default SetupView;
