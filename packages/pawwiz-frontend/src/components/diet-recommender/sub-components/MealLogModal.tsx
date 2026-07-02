import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MealLog } from '../../../hooks/useDietRecommender';
import TimePickerModal from '../../modals/TimePickerModal';

interface MealLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        mealName: 'Breakfast' | 'Lunch' | 'Dinner',
        foodType: 'dry' | 'wet',
        amount: number,
        unit: 'spoon' | 'cup',
        timestamp: string
    ) => void;
    onSkip: (meal: MealLog) => void;
    onReset: (mealId: string) => void;
    isEditing: boolean;
    editingMealId: string | null;
    initialMealName: 'Breakfast' | 'Lunch' | 'Dinner';
    initialTimestamp: string;
    initialFoodType: 'dry' | 'wet';
    initialUnit: 'spoon' | 'cup';
    initialAmount: number;
    catName: string;
    loggedMeals: MealLog[];
}

export const MealLogModal: React.FC<MealLogModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onSkip,
    onReset,
    isEditing,
    editingMealId,
    initialMealName,
    initialTimestamp,
    initialFoodType,
    initialUnit,
    initialAmount,
    catName,
    loggedMeals,
}) => {
    const [modalMealName, setModalMealName] = useState<'Breakfast' | 'Lunch' | 'Dinner'>(initialMealName);
    const [modalTimestamp, setModalTimestamp] = useState<string>(initialTimestamp);
    const [modalFoodType, setModalFoodType] = useState<'dry' | 'wet'>(initialFoodType);
    const [modalUnit, setModalUnit] = useState<'spoon' | 'cup'>(initialUnit);
    const [modalAmount, setModalAmount] = useState<number>(initialAmount);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    
    // Sync state when modal is opened or values change
    useEffect(() => {
        if (isOpen) {
            setModalMealName(initialMealName);
            setModalTimestamp(initialTimestamp);
            setModalFoodType(initialFoodType);
            setModalUnit(initialUnit);
            setModalAmount(initialAmount);
        }
    }, [isOpen, initialMealName, initialTimestamp, initialFoodType, initialUnit, initialAmount]);

    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hoursStr, minutesStr] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'pm' : 'am';
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        return `${displayHours}:${minutesStr}${ampm}`;
    };

    const handleFormSubmit = () => {
        onSubmit(modalMealName, modalFoodType, modalAmount, modalUnit, formatTime12h(modalTimestamp));
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] cursor-pointer"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[90] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="bg-white border-2 border-slate-900 rounded-[2.5rem] max-w-sm w-full p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto"
                >
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {isEditing ? 'Edit meal details' : 'Log Daily Meal'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Enter food details for {catName}</p>

                    <div className="space-y-6 text-left">
                        {/* What Meal */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Meal Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Breakfast', 'Lunch', 'Dinner'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setModalMealName(m)}
                                        className={`py-2.5 rounded-xl border-2 font-bold text-xs capitalize transition-all cursor-pointer ${
                                            modalMealName === m
                                                ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-slate-50 border-slate-150 text-slate-600 hover:border-slate-205'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Input */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Time</label>
                            <button
                                type="button"
                                onClick={() => setIsTimePickerOpen(true)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm text-slate-700 font-medium flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors focus:outline-none focus:border-[#2ec4b6]"
                            >
                                <span>
                                    {modalTimestamp ? formatTime12h(modalTimestamp) : 'Tap to select time...'}
                                </span>
                                <span className="text-slate-400">🕒</span>
                            </button>
                        </div>

                        {/* Food Type (Wet or Dry) */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Food Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['dry', 'wet'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setModalFoodType(t)}
                                        className={`py-2.5 rounded-xl border-2 font-bold text-xs capitalize transition-all cursor-pointer ${
                                            modalFoodType === t
                                                ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                : 'bg-slate-50 border-slate-150 text-slate-600 hover:border-slate-205'
                                        }`}
                                    >
                                        {t === 'dry' ? 'Dry Kibble' : 'Wet Food'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Measurement Size */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <span>Measurement:</span>
                                <span className="font-extrabold text-[#2ec4b6] uppercase">
                                    {modalAmount.toFixed(2)} {modalAmount === 1 ? 'spoon' : 'spoons'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.25"
                                max="10"
                                step="0.25"
                                value={modalAmount}
                                onChange={(e) => setModalAmount(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={handleFormSubmit}
                                className="w-full py-3 bg-[#2ec4b6] text-white border-2 border-slate-900 rounded-xl font-black hover:bg-[#20a396] shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:shadow-none transition-all cursor-pointer"
                            >
                                {isEditing ? 'Save changes' : 'Log Meal'}
                            </button>
                            {!isEditing && (() => {
                                const targetMeal = loggedMeals.find(m => m.mealName === modalMealName);
                                if (targetMeal?.status === 'pending') {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => onSkip(targetMeal)}
                                            className="w-full py-3 bg-amber-50 text-amber-800 border-2 border-amber-200 rounded-xl font-black hover:bg-amber-100 transition-all cursor-pointer text-center"
                                        >
                                            Skip Meal
                                        </button>
                                    );
                                }
                                return null;
                            })()}
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (editingMealId) {
                                            onReset(editingMealId);
                                        }
                                    }}
                                    className="w-full py-3 bg-red-50 text-red-500 border-2 border-red-200 rounded-xl font-black hover:bg-red-100 transition-all cursor-pointer"
                                >
                                    Undo Log
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 border-2 border-slate-900 rounded-xl font-black text-slate-850 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Time Picker Modal */}
            <AnimatePresence>
                {isTimePickerOpen && (
                    <TimePickerModal
                        isOpen={isTimePickerOpen}
                        onClose={() => setIsTimePickerOpen(false)}
                        timeValue={modalTimestamp}
                        onChange={(newTime) => setModalTimestamp(newTime)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default MealLogModal;
