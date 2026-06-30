import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ScrollColumnProps {
    values: (string | number)[];
    selectedValue: string | number;
    onChange: (value: any) => void;
    className?: string;
}

const ScrollColumn: React.FC<ScrollColumnProps> = ({ values, selectedValue, onChange, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isProgrammatic, setIsProgrammatic] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isProgrammatic) return;
        const target = e.currentTarget;
        const itemHeight = target.clientHeight / 3;
        if (itemHeight <= 0) return;

        const scrollTop = target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (index >= 0 && index < values.length) {
            const val = values[index];
            if (String(val) !== String(selectedValue)) {
                onChange(val);
            }
        }

        // Align scroll position on scroll end
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            const finalScrollTop = target.scrollTop;
            const finalIndex = Math.round(finalScrollTop / itemHeight);
            if (finalIndex >= 0 && finalIndex < values.length) {
                const val = values[finalIndex];
                onChange(val);
                target.scrollTo({
                    top: finalIndex * itemHeight,
                    behavior: 'smooth'
                });
            }
        }, 150);
    };

    useEffect(() => {
        const index = values.findIndex(v => String(v) === String(selectedValue));
        if (index !== -1 && containerRef.current) {
            const itemHeight = containerRef.current.clientHeight / 3;
            if (itemHeight <= 0) return;
            const targetScrollTop = index * itemHeight;
            if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 2) {
                setIsProgrammatic(true);
                containerRef.current.scrollTop = targetScrollTop;
                const timer = setTimeout(() => {
                    setIsProgrammatic(false);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [selectedValue, values]);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`h-36 overflow-y-scroll scrollbar-none snap-y snap-mandatory ${className}`}
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: isProgrammatic ? 'none' : 'y mandatory',
            }}
        >
            <div className="h-12 flex-shrink-0" />
            {values.map((val, idx) => {
                const isSelected = String(val) === String(selectedValue);
                return (
                    <div
                        key={idx}
                        onClick={() => {
                            if (containerRef.current) {
                                const itemHeight = containerRef.current.clientHeight / 3;
                                containerRef.current.scrollTo({
                                    top: idx * itemHeight,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className={`h-12 flex items-center justify-center text-xl font-bold cursor-pointer transition-opacity duration-150 snap-center select-none ${isSelected ? 'text-slate-900 opacity-100' : 'text-slate-300 opacity-40 hover:opacity-70'
                            }`}
                    >
                        {typeof val === 'number' ? String(val).padStart(2, '0') : val}
                    </div>
                );
            })}
            <div className="h-12 flex-shrink-0" />
        </div>
    );
};

interface TimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    timeValue: string; // "HH:MM" 24h format
    onChange: (time24: string) => void;
    activeColor?: string;
    hoverColor?: string;
    shadowColorClass?: string;
}

const hoursValues = Array.from({ length: 12 }, (_, i) => i + 1);
const minutesValues = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const ampmValues = ['AM', 'PM'];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
    isOpen,
    onClose,
    timeValue,
    onChange,
    activeColor = '#2ec4b6',
    hoverColor = '#20a396',
    shadowColorClass = 'shadow-teal-500/20',
}) => {
    const parseTime = (val24: string) => {
        if (!val24) return { hr: 8, min: '00', ampm: 'AM' };
        const [hStr, mStr] = val24.split(':');
        const h24 = parseInt(hStr, 10);
        const min = String(parseInt(mStr, 10)).padStart(2, '0');
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        let hr = h24 % 12;
        if (hr === 0) hr = 12;
        return { hr, min, ampm };
    };

    const initial = parseTime(timeValue);
    const [selectedHr, setSelectedHr] = useState<number>(initial.hr);
    const [selectedMin, setSelectedMin] = useState<string>(initial.min);
    const [selectedAmpm, setSelectedAmpm] = useState<string>(initial.ampm);

    useEffect(() => {
        if (isOpen) {
            const parsed = parseTime(timeValue);
            setSelectedHr(parsed.hr);
            setSelectedMin(parsed.min);
            setSelectedAmpm(parsed.ampm);
        }
    }, [isOpen, timeValue]);

    if (!isOpen) return null;

    const handleDone = () => {
        let hr24 = selectedHr % 12;
        if (selectedAmpm === 'PM') {
            hr24 += 12;
        }
        const time24Str = `${String(hr24).padStart(2, '0')}:${selectedMin}`;
        onChange(time24Str);
        onClose();
    };

    return (
        <>
            <style>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {/* Modal Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] cursor-pointer"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[160] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="w-full max-w-sm bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-8 pointer-events-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <button
                            onClick={onClose}
                            className="text-2xl text-slate-800 hover:text-slate-600 font-sans absolute left-0 cursor-pointer"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight text-center w-full">
                            Select Time
                        </h3>
                    </div>

                    {/* Picker interface */}
                    <div className="relative flex justify-center items-center w-full gap-4 my-8">
                        {/* Highlight active selection area */}
                        <div className="absolute left-0 right-0 h-12 border-t border-b pointer-events-none" style={{ borderColor: activeColor }} />

                        <ScrollColumn
                            values={hoursValues}
                            selectedValue={selectedHr}
                            onChange={setSelectedHr}
                            className="w-16"
                        />
                        <div className="text-2xl font-bold text-slate-855 self-center">:</div>
                        <ScrollColumn
                            values={minutesValues}
                            selectedValue={selectedMin}
                            onChange={setSelectedMin}
                            className="w-16"
                        />
                        <ScrollColumn
                            values={ampmValues}
                            selectedValue={selectedAmpm}
                            onChange={setSelectedAmpm}
                            className="w-20"
                        />
                    </div>

                    {/* Done button */}
                    <button
                        onClick={handleDone}
                        className={`w-full py-4 text-white rounded-full font-bold text-lg transition-colors shadow-md ${shadowColorClass} cursor-pointer`}
                        style={{
                            backgroundColor: activeColor,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = hoverColor;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = activeColor;
                        }}
                    >
                        Done
                    </button>
                </motion.div>
            </div>
        </>
    );
};

export default TimePickerModal;
