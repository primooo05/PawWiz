import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { MealLog } from '../../../../hooks/features/useDietRecommender';
import {
    FOOD_CATALOG,
    FOOD_OPTIONS,
    UNIT_OPTIONS,
    getUnitConfig,
    calculateKcal,
    calculateCustomKcal,
    convertUnitAmount,
    typicalAmountInUnit,
    formatAmountUnit,
    type FoodType,
    type MealUnit,
} from '../../../../lib/foods';

interface MealLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        mealName: 'Breakfast' | 'Lunch' | 'Dinner',
        foodType: string,
        amount: number,
        unit: MealUnit,
        timestamp: string,
        kcal: number
    ) => void;
    onSkip: (meal: MealLog) => void;
    onReset: (mealId: string) => void;
    isEditing: boolean;
    editingMealId: string | null;
    initialMealName: 'Breakfast' | 'Lunch' | 'Dinner';
    initialTimestamp: string;
    initialFoodType: string;
    initialUnit: MealUnit;
    initialAmount: number;
    catName: string;
    loggedMeals: MealLog[];
}

const isKnownFood = (foodType: string): foodType is FoodType =>
    Object.prototype.hasOwnProperty.call(FOOD_CATALOG, foodType);

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
    // Select value is always a catalog id or 'other'. A custom food name is held
    // separately so the <select> stays controlled.
    const [modalFoodType, setModalFoodType] = useState<FoodType>('dry');
    const [customName, setCustomName] = useState<string>('');
    const [customKcalPer100g, setCustomKcalPer100g] = useState<number>(100);
    const [modalUnit, setModalUnit] = useState<MealUnit>(initialUnit);
    const [modalAmount, setModalAmount] = useState<number>(initialAmount);

    // Sync state when modal is opened. An unknown initialFoodType means the meal
    // was logged as a custom food — restore it into the "Other" path.
    useEffect(() => {
        if (!isOpen) return;
        if (initialFoodType && isKnownFood(initialFoodType) && initialFoodType !== 'other') {
            setModalFoodType(initialFoodType);
            setCustomName('');
            setModalUnit(initialUnit);
        } else if (initialFoodType && initialFoodType !== 'other') {
            setModalFoodType('other');
            setCustomName(initialFoodType);
            setModalUnit('gram');
        } else {
            setModalFoodType('dry');
            setCustomName('');
            setModalUnit(initialUnit);
        }
        setModalAmount(initialAmount);
    }, [isOpen, initialMealName, initialTimestamp, initialFoodType, initialUnit, initialAmount]);

    const isOther = modalFoodType === 'other';
    const unitConfig = getUnitConfig(isOther ? 'gram' : modalUnit);
    const previewKcal = isOther
        ? calculateCustomKcal(modalAmount, customKcalPer100g)
        : calculateKcal(modalFoodType, modalAmount, modalUnit);

    const handleFoodChange = (next: FoodType) => {
        if (next === 'other') {
            // Custom foods are priced from a label value, measured in grams.
            setModalUnit('gram');
            setModalAmount((prev) => convertUnitAmount(modalFoodType, prev, modalUnit, 'gram'));
        }
        setModalFoodType(next);
    };

    // Switching units keeps the portion (grams) roughly constant so the amount
    // doesn't visually "reset" when the user changes how they measure.
    const handleUnitChange = (nextUnit: MealUnit) => {
        setModalAmount((prev) => convertUnitAmount(modalFoodType, prev, modalUnit, nextUnit));
        setModalUnit(nextUnit);
    };

    const handleUseTypical = () => {
        setModalAmount(typicalAmountInUnit(isOther ? 'other' : modalFoodType, isOther ? 'gram' : modalUnit));
    };

    const handleFormSubmit = () => {
        const foodType = isOther ? (customName.trim() || 'Other') : modalFoodType;
        const unit = isOther ? 'gram' : modalUnit;
        onSubmit(initialMealName, foodType, modalAmount, unit, initialTimestamp, previewKcal);
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
                    className="bg-white border-2 border-slate-900 rounded-[2.5rem] max-w-sm w-full p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto max-h-[90vh] overflow-y-auto"
                >
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {isEditing ? `Edit ${initialMealName}` : `Log ${initialMealName}`}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Enter food details for {catName}</p>

                    <div className="space-y-6 text-left">
                        {/* Food selector */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Food</label>
                            <select
                                value={modalFoodType}
                                onChange={(e) => handleFoodChange(e.target.value as FoodType)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 cursor-pointer focus:outline-none focus:bg-white transition-colors"
                            >
                                {FOOD_OPTIONS.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.label}
                                    </option>
                                ))}
                                <option value="other">Other / Custom…</option>
                            </select>
                        </div>

                        {/* Custom food inputs */}
                        {isOther && (
                            <div className="space-y-4 p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Food name</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g. Turkey, homemade stew"
                                        className="w-full px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                        Calories on the label (kcal per 100 g)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={1000}
                                        value={customKcalPer100g || ''}
                                        onChange={(e) => setCustomKcalPer100g(parseFloat(e.target.value) || 0)}
                                        placeholder="e.g. 120"
                                        className="w-full px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                    />
                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed">
                                        Check the packaging for "kcal/100 g" (or ME kcal/kg ÷ 10). Then weigh the portion in grams below.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Unit selector — hidden for custom foods (measured in grams) */}
                        {!isOther && (
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Measure by</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {UNIT_OPTIONS.map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleUnitChange(u.id)}
                                            className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                                                modalUnit === u.id
                                                    ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                                            }`}
                                        >
                                            {u.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Measurement amount */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <span>{isOther ? 'Weight:' : 'Amount:'}</span>
                                <span className="font-extrabold text-[#2ec4b6] uppercase">
                                    {formatAmountUnit(modalAmount, isOther ? 'gram' : modalUnit)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={unitConfig.min}
                                max={unitConfig.max}
                                step={unitConfig.step}
                                value={modalAmount}
                                onChange={(e) => setModalAmount(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                            />
                            <button
                                type="button"
                                onClick={handleUseTypical}
                                className="text-[11px] font-black text-[#2ec4b6] uppercase tracking-wider hover:underline cursor-pointer"
                            >
                                Not sure? Use typical portion
                            </button>
                        </div>

                        {/* Live calorie preview */}
                        <div className="flex justify-between items-center bg-slate-900/5 border-2 border-slate-900 rounded-xl p-3">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Estimated energy</span>
                            <span className="text-lg font-black text-[#20a396]">{previewKcal} kcal</span>
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
                                const targetMeal = loggedMeals.find(m => m.mealName === initialMealName);
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

        </>
    );
};

export default MealLogModal;
