import React, { useState } from 'react';
import { getFelineFeedingGuideDetails } from '../../../hooks/features/useDietRecommender';
import type { MealLog, CatProfile } from '../../../hooks/features/useDietRecommender';
import type { FoodType, MealUnit } from '../../../lib/foods';
import ConfirmationDialog from '../../ui/modals/ConfirmationDialog';
import { Sparkles, CheckCircle2, Calendar } from 'lucide-react';

import MealsTracker from './sub-components/MealsTracker';
import WeekCalendar from './sub-components/WeekCalendar';
import FeedingGuideline from './sub-components/FeedingGuideline';
import CalorieTracker from './sub-components/CalorieTracker';
import WaterTracker from './sub-components/WaterTracker';
import MealLogModal from './sub-components/MealLogModal';
import { defaultTimeForMeal } from './sub-components/mealTime';
import DietAdvisorModal from './sub-components/DietAdvisorModal';
import AnimatedAvatarGroup from '../../ui/smoothui/animated-avatar-group';
import { motion } from 'motion/react';

interface DietDashboardViewProps {
    catName: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: FoodType;
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult' | 'senior';
    age: number;

    profiles: CatProfile[];
    activeProfileId: string;
    switchProfile: (id: string) => void;
    createNewProfile: (name: string) => void;
    addMeal: (mealId: string, foodType: string, amount: number, unit: MealUnit, timestamp?: string, kcal?: number, mealNameOverride?: string) => void;
    addCustomMeal: (mealName: string, foodType: string, amount: number, unit: MealUnit, timestamp?: string, kcal?: number) => void;
    skipMeal: (mealId: string) => void;
    resetMealLog: (mealId: string) => void;
    addWater: (amount: number) => void;
    resetWater: () => void;
    loggedMeals: MealLog[];
    waterIntake: number;
    displayName?: string;
    onEditProfile: () => void;
}

export const DietDashboardView: React.FC<DietDashboardViewProps> = ({
    catName,
    gender,
    weight,
    isKg,
    foodPreference,
    isSpayedNeutered,
    activeLifeStage,
    age,
    profiles,
    activeProfileId,
    switchProfile,
    addMeal,
    addCustomMeal,
    skipMeal,
    resetMealLog,
    addWater,
    resetWater,
    loggedMeals,
    waterIntake,
    displayName,
    onEditProfile,
}) => {
    const [isAskAiOpen, setIsAskAiOpen] = useState(false);
    const [wizPrefillQuestion, setWizPrefillQuestion] = useState<string | undefined>(undefined);

    // Modal state
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
    const [modalMealName, setModalMealName] = useState<string>('Breakfast');
    const [modalTimestamp, setModalTimestamp] = useState<string>('08:00');
    const [modalFoodType, setModalFoodType] = useState<FoodType>('dry');
    const [modalUnit, setModalUnit] = useState<MealUnit>('spoon');
    const [modalAmount, setModalAmount] = useState<number>(3);
    const [isEditingMeal, setIsEditingMeal] = useState(false);
    const [editingMealId, setEditingMealId] = useState<string | null>(null);

    // Skip Confirmation Dialog states
    const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
    const [mealToSkip, setMealToSkip] = useState<MealLog | null>(null);
    const [isConfirmCompletedMealsOpen, setIsConfirmCompletedMealsOpen] = useState(false);

    // Nutrition formulas (weight normalized to kg)
    const weightInKg = isKg ? weight : weight * 0.45359237;
    const feedingGuide = getFelineFeedingGuideDetails(activeLifeStage, weightInKg, foodPreference);
    const dailyCalories = feedingGuide.dailyCalories;

    // Water target (kitten: approx. 70ml per kg; adult/senior: approx. 50ml per kg)
    const waterTarget = activeLifeStage === 'kitten'
        ? Math.round(weightInKg * 70)
        : Math.round(weightInKg * 50);

    const totalLoggedCalories = loggedMeals.reduce((sum, m) => sum + m.kcal, 0);
    const remainingCalories = Math.max(0, dailyCalories - totalLoggedCalories);

    const handleOpenSkipConfirmation = (meal: MealLog) => {
        setMealToSkip(meal);
        setIsSkipConfirmOpen(true);
        setIsAddMealModalOpen(false);
    };

    const handleConfirmSkip = () => {
        if (mealToSkip) {
            skipMeal(mealToSkip.id);
            setIsSkipConfirmOpen(false);
            setMealToSkip(null);
        }
    };

    const STANDARD_MEAL_IDS: Record<string, string> = { Breakfast: '1', Lunch: '2', Dinner: '3' };

    const handleMealModalSubmit = (
        mealName: string,
        foodType: string,
        amount: number,
        unit: MealUnit,
        formattedTimestamp: string,
        kcal: number
    ) => {
        const targetMealId = STANDARD_MEAL_IDS[mealName];

        if (isEditingMeal && editingMealId) {
            // Editing an existing entry — update its row directly. If the meal
            // period was switched to a *different* standard slot, free the old
            // slot first. If it's still a custom period, pass mealName so a
            // rename (e.g. "Midnight Snack" → "Late Snack") is saved too.
            if (targetMealId && targetMealId !== editingMealId) {
                resetMealLog(editingMealId);
                addMeal(targetMealId, foodType, amount, unit, formattedTimestamp, kcal);
            } else if (!targetMealId) {
                addMeal(editingMealId, foodType, amount, unit, formattedTimestamp, kcal, mealName);
            } else {
                addMeal(editingMealId, foodType, amount, unit, formattedTimestamp, kcal);
            }
        } else if (targetMealId) {
            // New log into a standard Breakfast/Lunch/Dinner slot
            addMeal(targetMealId, foodType, amount, unit, formattedTimestamp, kcal);
        } else {
            // New log under a custom meal period (e.g. "Midnight Snack")
            addCustomMeal(mealName, foodType, amount, unit, formattedTimestamp, kcal);
        }
        setIsAddMealModalOpen(false);
    };

    const openAddMealModal = () => {
        setModalMealName('Breakfast');
        setModalTimestamp(defaultTimeForMeal('Breakfast'));
        setModalFoodType('dry');
        setModalUnit('spoon');
        setModalAmount(3);
        setIsEditingMeal(false);
        setEditingMealId(null);
        setIsAddMealModalOpen(true);
    };

    const handleAddMealClick = () => {
        const hasPending = loggedMeals.some(m => m.status === 'pending');
        if (!hasPending) {
            setIsConfirmCompletedMealsOpen(true);
        } else {
            openAddMealModal();
        }
    };

    const handleEditMealClick = (meal: MealLog) => {
        setModalMealName(meal.mealName);
        setModalTimestamp(defaultTimeForMeal(meal.mealName, meal.timestamp ?? undefined));
        setModalFoodType((meal.foodType as FoodType) ?? 'dry');
        setModalUnit((meal.unit as MealUnit) ?? 'spoon');
        setModalAmount(meal.amount || 3);
        setIsEditingMeal(true);
        setEditingMealId(meal.id);
        setIsAddMealModalOpen(true);
    };

    const handleUndoLog = (mealId: string) => {
        resetMealLog(mealId);
        setIsAddMealModalOpen(false);
    };

    const possessivePronoun = gender === 'male' ? 'his' : 'her';
    const subjectPronoun = gender === 'male' ? 'He' : 'She';

    const avatarDataList = profiles.map(p => ({
        id: p.id,
        name: p.name,
        src: p.photoUrl || undefined,
        alt: p.name,
        isActive: p.id === activeProfileId,
        isNew: !p.isTracking
    }));

    const getGreeting = () => {
        const hour = new Date().getHours();
        const owner = displayName || "Parent";
        if (hour >= 5 && hour < 11) {
            return {
                title: `Good morning, ${owner}!`,
                subtitle: `Ready for breakfast time with ${catName}?`
            };
        } else if (hour >= 11 && hour < 17) {
            return {
                title: `Hi ${owner}!`,
                subtitle: `How is ${catName}'s day going so far?`
            };
        } else if (hour >= 17 && hour < 22) {
            return {
                title: `Good evening, ${owner}.`,
                subtitle: `Time to wrap up ${catName}'s meals for today!`
            };
        } else {
            return {
                title: `Hello, ${owner}!`,
                subtitle: `Checking in on ${catName}'s health tonight.`
            };
        }
    };

    const greeting = getGreeting();

    const mealsLoggedToday = loggedMeals.filter(m => m.status === 'logged').length;
    const mealsPendingToday = loggedMeals.filter(m => m.status === 'pending').length;

    const successDaysList = React.useMemo(() => {
        const localDays = (() => {
            try {
                return JSON.parse(localStorage.getItem(`diet_success_days_${activeProfileId}`) || '[]');
            } catch (e) {
                return [];
            }
        })();
        const currentProfile = profiles.find(p => p.id === activeProfileId);
        const dbDays = currentProfile?.successDays || [];
        return Array.from(new Set([...localDays, ...dbDays]));
    }, [activeProfileId, profiles, loggedMeals]);

    return (
        <div className="flex flex-col gap-8 w-full flex-grow text-slate-800 max-w-7xl mx-auto pb-28 px-4 sm:px-6 lg:px-8">
            {/* Header Greeting Row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{greeting.title}</h1>
                        <button
                            type="button"
                            onClick={onEditProfile}
                            className="px-3 py-1 bg-[#EEF9F8] border border-teal-400 text-teal-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-[2px_2px_0_0_#0f172a] hover:bg-teal-50 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0"
                        >
                            Edit Profile
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{greeting.subtitle}</p>
                </div>

                {/* Profile Switcher via AnimatedAvatarGroup */}
                <div className="relative self-stretch sm:self-auto flex items-center">
                    <AnimatedAvatarGroup
                        avatars={avatarDataList}
                        onAvatarClick={(id) => switchProfile(id)}
                    />
                </div>
            </div>

            {/* Week Calendar (Full Width at Top) */}
            <motion.div
                key={`calendar-${activeProfileId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.02 }}
                className="w-full"
            >
                <WeekCalendar successDays={successDaysList} />
            </motion.div>

            {/* ROW 1: Feeding Guideline (full width) */}
            <motion.div
                key={`guideline-${activeProfileId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                className="w-full"
            >
                <FeedingGuideline
                    lifeStage={activeLifeStage}
                    weight={weight}
                    isKg={isKg}
                    foodPreference={foodPreference}
                />
            </motion.div>

            {/* ROW 2: Meals (left, larger) | Calorie Tracker (right, stretches to fill the row) */}
            <div className="grid grid-cols-1 lg:grid-cols-[6.5fr_3.5fr] gap-8 items-stretch w-full">
                <motion.div
                    key={`tracker-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
                >
                    <MealsTracker
                        loggedMeals={loggedMeals}
                        onAddMeal={handleAddMealClick}
                        onEditMeal={handleEditMealClick}
                        onUndoSkip={(mealId) => resetMealLog(mealId)}
                        catName={catName}
                    />
                </motion.div>

                <motion.div
                    key={`calorie-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                    className="h-full"
                >
                    <CalorieTracker dailyCalories={dailyCalories} totalLoggedCalories={totalLoggedCalories} catName={catName} />
                </motion.div>
            </div>

            {/* ROW 3: Water intake bar (full width) */}
            <div className="w-full">
                <motion.div
                    key={`water-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
                >
                    <WaterTracker
                        waterIntake={waterIntake}
                        waterTarget={waterTarget}
                        addWater={addWater}
                        resetWater={resetWater}
                        catName={catName}
                    />
                </motion.div>
            </div>

            {/* BOTTOM / ROW 4: Summary */}
            <div className="w-full mt-4">
                {/* Meals Summary Card */}
                <motion.div
                    key={`summary-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.25 }}
                    className="p-6 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] w-full"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 bg-[#ffb870] rotate-45" />
                            <span className="text-[10px] font-black tracking-widest text-[#ffb870] uppercase">Today's Summary</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                            Diet Overview
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Logged Meals</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{mealsLoggedToday} / {loggedMeals.length}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Remaining Meals</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{mealsPendingToday} pending</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Dialogs */}
            <ConfirmationDialog
                isOpen={isSkipConfirmOpen}
                title={`Skip ${mealToSkip?.mealName}?`}
                message={`Are you sure ${catName} will skip ${possessivePronoun} ${mealToSkip?.mealName.toLowerCase()}? ${subjectPronoun} still needs to take ${remainingCalories} kcal.`}
                confirmText="Skip Meal"
                cancelText="Cancel"
                onConfirm={handleConfirmSkip}
                onCancel={() => {
                    setIsSkipConfirmOpen(false);
                    setMealToSkip(null);
                }}
            />

            <ConfirmationDialog
                isOpen={isConfirmCompletedMealsOpen}
                title="Meals Completed"
                message={`${catName} just completed ${possessivePronoun} meals today, are you sure you want to add more meal`}
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => {
                    setIsConfirmCompletedMealsOpen(false);
                    openAddMealModal();
                }}
                onCancel={() => setIsConfirmCompletedMealsOpen(false)}
            />

            {/* Add/Edit Meal Modal */}
            <MealLogModal
                isOpen={isAddMealModalOpen}
                onClose={() => setIsAddMealModalOpen(false)}
                onSubmit={handleMealModalSubmit}
                onSkip={handleOpenSkipConfirmation}
                onReset={handleUndoLog}
                isEditing={isEditingMeal}
                editingMealId={editingMealId}
                initialMealName={modalMealName}
                initialTimestamp={modalTimestamp}
                initialFoodType={modalFoodType}
                initialUnit={modalUnit}
                initialAmount={modalAmount}
                catName={catName}
                loggedMeals={loggedMeals}
                onAskWiz={(question) => {
                    setWizPrefillQuestion(question);
                    setIsAskAiOpen(true);
                }}
            />

            {/* Floating Ask AI button */}
            <button
                type="button"
                onClick={() => setIsAskAiOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-white border-2 border-slate-900 rounded-full pl-2 pr-5 py-2 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:scale-95 transition-all cursor-pointer"
            >
                <span className="w-8 h-8 rounded-full bg-[#FFB870] border-2 border-slate-900 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={15} className="text-slate-900" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-black text-slate-900">Ask Wiz</span>
            </button>

            <DietAdvisorModal
                isOpen={isAskAiOpen}
                onClose={() => { setIsAskAiOpen(false); setWizPrefillQuestion(undefined); }}
                catContext={{
                    catName,
                    gender,
                    lifeStage: activeLifeStage,
                    age,
                    weight,
                    isKg,
                    foodPreference,
                    isSpayedNeutered,
                    dailyCalories,
                    totalLoggedCalories,
                    waterIntake,
                    waterTarget,
                    mealsLoggedToday,
                    mealsPendingToday,
                }}
                prefillQuestion={wizPrefillQuestion}
            />
        </div>
    );
};

export default DietDashboardView;
