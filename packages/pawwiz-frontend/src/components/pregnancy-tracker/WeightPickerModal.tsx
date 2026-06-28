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

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isProgrammatic) return;
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / 48);
        if (index >= 0 && index < values.length) {
            const val = values[index];
            if (val !== selectedValue) {
                onChange(val);
            }
        }
    };

    useEffect(() => {
        const index = values.indexOf(selectedValue);
        if (index !== -1 && containerRef.current) {
            const targetScrollTop = index * 48;
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
            className={`h-36 overflow-y-scroll scrollbar-none ${className}`}
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: isProgrammatic ? 'none' : 'y mandatory',
            }}
        >
            <div className="h-12 flex-shrink-0" />
            {values.map((val, idx) => {
                const isSelected = val === selectedValue;
                return (
                    <div
                        key={idx}
                        onClick={() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTo({
                                    top: idx * 48,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className={`h-12 flex items-center justify-center text-xl font-bold cursor-pointer transition-opacity duration-150 snap-center select-none ${isSelected ? 'text-slate-900 opacity-100' : 'text-slate-300 opacity-40 hover:opacity-70'
                            }`}
                    >
                        {val}
                    </div>
                );
            })}
            <div className="h-12 flex-shrink-0" />
        </div>
    );
};

interface WeightPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    intVal: number;
    setIntVal: (val: number) => void;
    decVal: number;
    setDecVal: (val: number) => void;
    unitVal: 'kg' | 'lbs';
    handleUnitChange: (unit: 'kg' | 'lbs') => void;
    handleWeightPickerDone: () => void;
}

const intValues = Array.from({ length: 100 }, (_, i) => i);
const decValues = Array.from({ length: 10 }, (_, i) => i);
const unitValues = ['kg', 'lbs'];

export const WeightPickerModal: React.FC<WeightPickerModalProps> = ({
    isOpen,
    onClose,
    intVal,
    setIntVal,
    decVal,
    setDecVal,
    unitVal,
    handleUnitChange,
    handleWeightPickerDone,
}) => {
    if (!isOpen) return null;

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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] cursor-pointer"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="w-full max-w-sm bg-white rounded-[2.5rem] border-2 border-slate-955 shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-8 pointer-events-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <button
                            onClick={onClose}
                            className="text-2xl text-slate-800 hover:text-slate-600 font-sans absolute left-0 cursor-pointer"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 text-center w-full">
                            Log weight
                        </h3>
                    </div>

                    {/* Picker interface */}
                    <div className="relative flex justify-center items-center w-full gap-4 my-8">
                        {/* Highlight active selection area */}
                        <div className="absolute left-0 right-0 h-12 border-t border-b border-[#FF5A79] pointer-events-none" />

                        <ScrollColumn
                            values={intValues}
                            selectedValue={intVal}
                            onChange={setIntVal}
                            className="w-20"
                        />
                        <div className="text-2xl font-bold text-slate-850 self-center">.</div>
                        <ScrollColumn
                            values={decValues}
                            selectedValue={decVal}
                            onChange={setDecVal}
                            className="w-16"
                        />
                        <ScrollColumn
                            values={unitValues}
                            selectedValue={unitVal}
                            onChange={handleUnitChange}
                            className="w-20"
                        />
                    </div>

                    {/* Done button */}
                    <button
                        onClick={handleWeightPickerDone}
                        className="w-full py-4 bg-[#FF5A79] text-white rounded-full font-bold text-lg hover:bg-[#ff4064] transition-colors shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                        Done
                    </button>
                </motion.div>
            </div>
        </>
    );
};

export default WeightPickerModal;
