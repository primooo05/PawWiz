import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
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
        mealName: string,
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
    initialMealName: string;
    initialTimestamp: string;
    initialFoodType: string;
    initialUnit: MealUnit;
    initialAmount: number;
    catName: string;
    loggedMeals: MealLog[];
    /** Show the Breakfast / Lunch / Dinner / Other period picker. Hidden when
     *  the caller already knows which meal slot is being logged (e.g. Quick
     *  Log's dedicated per-meal buttons); shown for the general "Add Meal"
     *  (+) flow where the period hasn't been chosen yet. Defaults to true. */
    showMealPeriodSelector?: boolean;
    /** Called when user clicks "Ask Wiz" — opens the Diet Advisor modal with a pre-filled question */
    onAskWiz?: (question: string) => void;
}

// ─── Household reference objects for no-scale portion estimation ──────────────
interface PortionRef {
    emoji: string;
    label: string;
    sublabel: string;
    grams: number;
}

const PORTION_REFS: PortionRef[] = [
    { emoji: '🏓', label: 'Ping pong ball', sublabel: '≈ 30 g', grams: 30 },
    { emoji: '⛳', label: 'Golf ball',       sublabel: '≈ 45 g', grams: 45 },
    { emoji: '🥚', label: 'Large egg',       sublabel: '≈ 60 g', grams: 60 },
    { emoji: '🍊', label: 'Clementine',      sublabel: '≈ 75 g', grams: 75 },
    { emoji: '🃏', label: 'Deck of cards',   sublabel: '≈ 85 g', grams: 85 },
    { emoji: '🍎', label: 'Medium apple',    sublabel: '≈ 120 g', grams: 120 },
];

const isKnownFood = (foodType: string): foodType is FoodType =>
    Object.prototype.hasOwnProperty.call(FOOD_CATALOG, foodType);

const STANDARD_MEAL_PERIODS = ['Breakfast', 'Lunch', 'Dinner'] as const;
type StandardMealPeriod = typeof STANDARD_MEAL_PERIODS[number];
type MealPeriod = StandardMealPeriod | 'Other';

const isStandardPeriod = (name: string): name is StandardMealPeriod =>
    (STANDARD_MEAL_PERIODS as readonly string[]).includes(name);

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
    showMealPeriodSelector = true,
    onAskWiz,
}) => {
    // Select value is always a catalog id or 'other'. A custom food name is held
    // separately so the <select> stays controlled.
    const [modalFoodType, setModalFoodType] = useState<FoodType>('dry');
    const [customName, setCustomName] = useState<string>('');
    const [customKcalPer100g, setCustomKcalPer100g] = useState<number>(100);
    const [modalUnit, setModalUnit] = useState<MealUnit>(initialUnit);
    const [modalAmount, setModalAmount] = useState<number>(initialAmount);
    // Step-by-step Flo-like logging flow: 'food' → 'amount' → 'confirm'
    const [step, setStep] = useState<'food' | 'amount' | 'confirm'>('food');
    // Whether the household visual estimator is shown (Other path, no scale)
    const [showEstimator, setShowEstimator] = useState(false);

    // Which meal period this entry belongs to. "Other" reveals a free-text
    // label input (e.g. "Midnight Snack") instead of the fixed 3 options.
    const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod>('Breakfast');
    const [customPeriodName, setCustomPeriodName] = useState<string>('');

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

        // Restore the meal period. A non-standard initialMealName means the
        // meal was previously logged under a custom label — restore it into
        // the "Other" path so editing shows the label back in the text input.
        if (isStandardPeriod(initialMealName)) {
            setSelectedPeriod(initialMealName);
            setCustomPeriodName('');
        } else {
            setSelectedPeriod('Other');
            setCustomPeriodName(initialMealName || '');
        }

        // Always start at the food-selection step when opening
        setStep('food');
        setShowEstimator(false);
    }, [isOpen, initialMealName, initialTimestamp, initialFoodType, initialUnit, initialAmount]);

    const isOther = modalFoodType === 'other';
    const isCustomPeriod = selectedPeriod === 'Other';
    const effectiveMealName = isCustomPeriod ? customPeriodName.trim() : selectedPeriod;
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

    const canSubmit = !isCustomPeriod || customPeriodName.trim().length > 0;

    const handleFormSubmit = () => {
        if (!canSubmit) return;
        const foodType = isOther ? (customName.trim() || 'Other') : modalFoodType;
        const unit = isOther ? 'gram' : modalUnit;
        onSubmit(effectiveMealName || 'Other', foodType, modalAmount, unit, initialTimestamp, previewKcal);
    };

    // Build the context-aware Ask Wiz question
    const buildWizQuestion = () => {
        const food = isOther
            ? (customName.trim() || 'a custom food')
            : FOOD_CATALOG[modalFoodType]?.label ?? modalFoodType;
        return `I'm logging ${initialMealName} for ${catName} with ${food}. I don't have a measuring tool — what's a good portion estimate for ${catName}'s size?`;
    };

    // Step labels for the progress indicator
    const STEPS = ['Food', 'Amount', 'Confirm'] as const;
    const stepIndex = step === 'food' ? 0 : step === 'amount' ? 1 : 2;

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
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="bg-white border-2 border-slate-900 rounded-[2.5rem] max-w-sm w-full p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto max-h-[90vh] overflow-y-auto"
                >
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">
                        {isEditing
                            ? `Edit ${effectiveMealName || initialMealName}`
                            : showMealPeriodSelector
                                ? 'Log a Meal'
                                : `Log ${initialMealName}`}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        {step === 'food' ? `What did ${catName} eat?` : step === 'amount' ? `How much did ${catName} eat?` : 'Confirm the details'}
                    </p>

                    {/* Flo-like step progress indicator */}
                    <div className="flex items-center gap-1.5 mb-7">
                        {STEPS.map((label, i) => (
                            <React.Fragment key={label}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${i < stepIndex ? 'bg-[#2ec4b6] border-[#2ec4b6] text-white' : i === stepIndex ? 'bg-white border-[#2ec4b6] text-[#2ec4b6]' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                                        {i < stepIndex ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${i === stepIndex ? 'text-[#2ec4b6]' : 'text-slate-400'}`}>{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mb-4 transition-all ${i < stepIndex ? 'bg-[#2ec4b6]' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                    {/* ── Step 1: Food selection ─────────────────────────────── */}
                    {step === 'food' && (
                        <motion.div
                            key="step-food"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 text-left"
                        >
                            {/* Meal period selector — shown when caller hasn't pre-selected a slot */}
                            {showMealPeriodSelector && (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Meal period</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {([...STANDARD_MEAL_PERIODS, 'Other'] as MealPeriod[]).map((period) => (
                                            <button
                                                key={period}
                                                type="button"
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                                                    selectedPeriod === period
                                                        ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                                                }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                    {isCustomPeriod && (
                                        <input
                                            type="text"
                                            value={customPeriodName}
                                            onChange={(e) => setCustomPeriodName(e.target.value)}
                                            placeholder="e.g. Midnight Snack"
                                            className="w-full mt-3 px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors"
                                        />
                                    )}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Food type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FOOD_OPTIONS.map((f) => (
                                        <button key={f.id} type="button" onClick={() => handleFoodChange(f.id)}
                                            className={`py-3 px-3 rounded-xl border-2 font-bold text-xs text-left transition-all cursor-pointer ${modalFoodType === f.id && !isOther ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}
                                        >{f.label}</button>
                                    ))}
                                    <button type="button" onClick={() => handleFoodChange('other')}
                                        className={`py-3 px-3 rounded-xl border-2 font-bold text-xs text-left transition-all cursor-pointer col-span-2 ${isOther ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}
                                    >🍽️ Other / Custom food…</button>
                                </div>
                            </div>
                            {isOther && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl"
                                >
                                    <label className="block text-xs font-black text-amber-700 uppercase tracking-wider">Food name</label>
                                    <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g. Turkey, homemade stew"
                                        className="w-full px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                    />
                                </motion.div>
                            )}
                            <button type="button" onClick={() => setStep('amount')}
                                className="w-full py-3.5 bg-[#2ec4b6] text-white border-2 border-slate-900 rounded-xl font-black hover:bg-[#20a396] shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:shadow-none transition-all cursor-pointer"
                            >Next: Set amount →</button>
                            {(() => {
                                const targetMeal = loggedMeals.find(m => m.id === editingMealId || m.mealName === initialMealName);
                                if (targetMeal && targetMeal.status !== 'skipped') {
                                    return (
                                        <button type="button" onClick={() => onSkip(targetMeal)}
                                            className="w-full py-3 bg-amber-50 text-amber-800 border-2 border-amber-200 rounded-xl font-black hover:bg-amber-100 transition-all cursor-pointer text-center"
                                        >Skip Meal</button>
                                    );
                                }
                                return null;
                            })()}
                            <button type="button" onClick={onClose}
                                className="w-full py-3 border-2 border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all cursor-pointer text-sm"
                            >Cancel</button>
                        </motion.div>
                    )}

                    {/* ── Step 2: Amount / measurement ──────────────────────── */}
                    {step === 'amount' && (
                        <motion.div
                            key="step-amount"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 text-left"
                        >
                            {isOther ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Calories on label <span className="font-bold normal-case">(kcal per 100 g)</span>
                                        </label>
                                        <input type="number" min={1} max={1000} value={customKcalPer100g || ''}
                                            onChange={(e) => setCustomKcalPer100g(parseFloat(e.target.value) || 0)}
                                            placeholder="e.g. 120"
                                            className="w-full px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                        />
                                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed">
                                            Check the packaging for "kcal/100 g". Leave at 100 if unsure.
                                        </p>
                                    </div>
                                    {/* No-scale estimator toggle */}
                                    <button type="button" onClick={() => setShowEstimator(!showEstimator)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-xs font-black text-slate-600 hover:border-[#2ec4b6] hover:text-[#2ec4b6] transition-all cursor-pointer"
                                    >
                                        <span>🫙 No scale? Estimate by eye</span>
                                        <span className="text-[10px]">{showEstimator ? '▲ hide' : '▼ show'}</span>
                                    </button>
                                    <AnimatePresence>
                                    {showEstimator && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-2xl space-y-3">
                                                <p className="text-[10px] font-black text-teal-700 uppercase tracking-wider">
                                                    Pick the closest household object to the portion size:
                                                </p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {PORTION_REFS.map((ref) => (
                                                        <button key={ref.label} type="button"
                                                            onClick={() => { setModalAmount(ref.grams); setShowEstimator(false); }}
                                                            className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all cursor-pointer text-center ${modalAmount === ref.grams ? 'bg-[#EEF9F8] border-teal-400 shadow-[1px_1px_0_0_rgba(15,23,42,1)]' : 'bg-white border-slate-200 hover:border-teal-300'}`}
                                                        >
                                                            <span className="text-xl leading-none mb-1">{ref.emoji}</span>
                                                            <span className="text-[9px] font-black text-slate-700 leading-tight">{ref.label}</span>
                                                            <span className="text-[9px] font-bold text-teal-600 mt-0.5">{ref.sublabel}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[9px] font-bold text-teal-600 leading-relaxed">
                                                    💡 Place the food next to the object to compare. Tap to set the amount.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Measure by</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {UNIT_OPTIONS.map((u) => (
                                            <button key={u.id} type="button" onClick={() => handleUnitChange(u.id)}
                                                className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${modalUnit === u.id ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'}`}
                                            >{u.label}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Amount slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    <span>{isOther ? 'Weight:' : 'Amount:'}</span>
                                    <span className="font-extrabold text-[#2ec4b6] uppercase">
                                        {formatAmountUnit(modalAmount, isOther ? 'gram' : modalUnit)}
                                    </span>
                                </div>
                                <input type="range" min={unitConfig.min} max={unitConfig.max} step={unitConfig.step} value={modalAmount}
                                    onChange={(e) => setModalAmount(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                                />
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={handleUseTypical}
                                        className="text-[11px] font-black text-[#2ec4b6] uppercase tracking-wider hover:underline cursor-pointer"
                                    >Not sure? Use typical portion</button>
                                    {onAskWiz && (
                                        <button type="button" onClick={() => { onAskWiz(buildWizQuestion()); onClose(); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFB870]/20 border border-[#FFB870] rounded-full text-[10px] font-black text-slate-700 hover:bg-[#FFB870]/40 transition-all cursor-pointer"
                                        >
                                            <Sparkles size={10} strokeWidth={2.5} className="text-amber-600" />
                                            Ask Wiz
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Live calorie preview */}
                            <div className="flex justify-between items-center bg-slate-900/5 border-2 border-slate-900 rounded-xl p-3">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Estimated energy</span>
                                <span className="text-lg font-black text-[#20a396]">{previewKcal} kcal</span>
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setStep('food')}
                                    className="flex-1 py-3 border-2 border-slate-900 rounded-xl font-black text-slate-700 hover:bg-slate-50 transition-all cursor-pointer text-sm"
                                >← Back</button>
                                <button type="button" onClick={() => setStep('confirm')}
                                    className="flex-[2] py-3 bg-[#2ec4b6] text-white border-2 border-slate-900 rounded-xl font-black hover:bg-[#20a396] shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:shadow-none transition-all cursor-pointer"
                                >Review →</button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Confirm / summary ──────────────────────────── */}
                    {step === 'confirm' && (
                        <motion.div
                            key="step-confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 text-left"
                        >
                            <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 space-y-3">
                                <p className="text-[10px] font-black text-teal-700 uppercase tracking-wider mb-1">
                                    Meal summary for {catName}
                                </p>
                                <div className="space-y-2 text-sm font-bold text-slate-700">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Meal</span>
                                        <span className="text-slate-900 font-black">{initialMealName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Food</span>
                                        <span className="text-slate-900 font-black">
                                            {isOther ? (customName.trim() || 'Other') : FOOD_CATALOG[modalFoodType]?.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Amount</span>
                                        <span className="text-slate-900 font-black">
                                            {formatAmountUnit(modalAmount, isOther ? 'gram' : modalUnit)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-teal-200">
                                        <span className="text-slate-500">Energy</span>
                                        <span className="text-[#20a396] font-black text-lg">{previewKcal} kcal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button onClick={handleFormSubmit}
                                    className="w-full py-3.5 bg-[#2ec4b6] text-white border-2 border-slate-900 rounded-xl font-black hover:bg-[#20a396] shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:shadow-none transition-all cursor-pointer"
                                >{isEditing ? '✓ Save changes' : '✓ Log Meal'}</button>



                                {isEditing && (
                                    <button type="button" onClick={() => { if (editingMealId) onReset(editingMealId); }}
                                        className="w-full py-3 bg-red-50 text-red-500 border-2 border-red-200 rounded-xl font-black hover:bg-red-100 transition-all cursor-pointer"
                                    >Undo Log</button>
                                )}

                                <button type="button" onClick={() => setStep('amount')}
                                    className="w-full py-3 border-2 border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all cursor-pointer text-sm"
                                >← Edit amount</button>
                            </div>
                        </motion.div>
                    )}

                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );
};

export default MealLogModal;
