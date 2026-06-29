import React, { useState } from 'react';
import type { AgeBracketDetails, MealLog, CatProfile } from '../../hooks/useDietRecommender';
import ConfirmationDialog from '../modals/ConfirmationDialog';

// Import subcomponents
import ProfileCard from './sub-components/ProfileCard';
import MealsTracker from './sub-components/MealsTracker';
import WeeklyCalendar from './sub-components/WeeklyCalendar';
import FeedingGuideline from './sub-components/FeedingGuideline';
import CalorieTracker from './sub-components/CalorieTracker';
import MealLogModal from './sub-components/MealLogModal';

interface DietDashboardViewProps {
    catName: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult';
    lifeStage: 'kitten' | 'adult';
    age: number;
    ageBracketInfo: AgeBracketDetails;
    onReset: () => void;

    profiles: CatProfile[];
    activeProfileId: string;
    switchProfile: (id: string) => void;
    createNewProfile: (name: string) => void;
    addMeal: (mealId: string, foodType: 'dry' | 'wet' | 'mixed', amount: number, unit: 'spoon' | 'cup', timestamp?: string) => void;
    skipMeal: (mealId: string) => void;
    resetMealLog: (mealId: string) => void;
    addWater: (amount: number) => void;
    resetWater: () => void;
    loggedMeals: MealLog[];
    waterIntake: number;
}

export const DietDashboardView: React.FC<DietDashboardViewProps> = ({
    catName,
    gender,
    weight,
    isKg,
    foodPreference,
    isSpayedNeutered,
    activeLifeStage,
    lifeStage,
    age,
    ageBracketInfo,
    onReset,

    profiles,
    activeProfileId,
    switchProfile,
    createNewProfile,
    addMeal,
    skipMeal,
    resetMealLog,
    addWater,
    resetWater,
    loggedMeals,
    waterIntake,
}) => {
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Modal state
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
    const [modalMealName, setModalMealName] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
    const [modalTimestamp, setModalTimestamp] = useState<string>('08:00');
    const [modalFoodType, setModalFoodType] = useState<'dry' | 'wet'>('dry');
    const [modalUnit, setModalUnit] = useState<'spoon' | 'cup'>('spoon');
    const [modalAmount, setModalAmount] = useState<number>(3);
    const [isEditingMeal, setIsEditingMeal] = useState(false);
    const [editingMealId, setEditingMealId] = useState<string | null>(null);

    // Skip Confirmation Dialog states
    const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
    const [mealToSkip, setMealToSkip] = useState<MealLog | null>(null);
    const [isConfirmCompletedMealsOpen, setIsConfirmCompletedMealsOpen] = useState(false);

    // Nutrition formulas (weight normalized to kg)
    const weightInKg = isKg ? weight : weight * 0.45359237;
    const rer = Math.round(70 * Math.pow(weightInKg, 0.75));
    const factor = activeLifeStage === 'kitten' ? 2.5 : isSpayedNeutered ? 1.2 : 1.4;
    const dailyCalories = Math.round(rer * factor);

    // Water target (approx. 50ml per kg)
    const waterTarget = Math.round(weightInKg * 50);

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

    const handleMealModalSubmit = (
        mealName: 'Breakfast' | 'Lunch' | 'Dinner',
        foodType: 'dry' | 'wet',
        amount: number,
        unit: 'spoon' | 'cup',
        formattedTimestamp: string
    ) => {
        const targetMealId = mealName === 'Breakfast' ? '1' : mealName === 'Lunch' ? '2' : '3';
        if (isEditingMeal && editingMealId && editingMealId !== targetMealId) {
            resetMealLog(editingMealId);
        }
        addMeal(targetMealId, foodType, amount, unit, formattedTimestamp);
        setIsAddMealModalOpen(false);
    };

    const openAddMealModal = () => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setModalMealName('Breakfast');
        setModalTimestamp(timeStr);
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
        setModalMealName(meal.mealName as any);
        let time24 = '08:00';
        if (meal.timestamp) {
            const match = meal.timestamp.match(/(\d+):(\d+)(am|pm)/);
            if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2];
                const ampm = match[3];
                if (ampm === 'pm' && h < 12) h += 12;
                if (ampm === 'am' && h === 12) h = 0;
                time24 = `${String(h).padStart(2, '0')}:${m}`;
            }
        }
        setModalTimestamp(time24);
        setModalFoodType(meal.foodType === 'wet' ? 'wet' : 'dry');
        setModalUnit(meal.unit || 'spoon');
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

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto text-slate-800">
            {/* Header Greeting Row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Good morning, Ayla</h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Track now {catName}'s meal for today</p>
                </div>

                {/* Profile Switcher Dropdown */}
                <div className="relative self-stretch sm:self-auto">
                    <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center select-none cursor-pointer focus:outline-none bg-transparent border-none active:scale-95 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#2ec4b6] border border-slate-300 flex items-center justify-center text-lg z-10 -mr-2.5 shadow-sm">
                            🐱
                        </div>
                        <div className="bg-[#fde047] border border-slate-300 px-6 py-1.5 font-black text-xs text-[#2ec4b6] uppercase tracking-wider z-0 shadow-[0_3px_0_0_#cbd5e1] rounded-sm min-w-[70px] text-center">
                            {catName}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#2ec4b6] border border-slate-300 flex items-center justify-center text-white text-base z-10 -ml-2.5 shadow-sm font-black leading-none pb-1">
                            •••
                        </div>
                    </button>

                    {isProfileDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                            <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_rgba(15,23,42,1)] z-50 overflow-hidden py-1 animate-fadeIn">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 border-b border-slate-100">
                                    Switch Profile
                                </p>
                                {profiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            switchProfile(p.id);
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-b-0 cursor-pointer ${
                                            p.id === activeProfileId ? 'bg-teal-50/50' : ''
                                        }`}
                                    >
                                        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs">
                                            🐈
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-955">{p.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 capitalize">
                                                {p.lifeStage} • {p.gender}
                                            </p>
                                        </div>
                                        {p.id === activeProfileId && (
                                            <span className="text-[#2ec4b6] text-xs font-bold">✓</span>
                                        )}
                                    </button>
                                ))}
                                <div className="p-2 border-t border-slate-100 bg-slate-50">
                                    <button
                                        onClick={() => {
                                            const name = prompt("Enter new cat's name:");
                                            if (name && name.trim()) {
                                                createNewProfile(name.trim());
                                                setIsProfileDropdownOpen(false);
                                            }
                                        }}
                                        className="w-full py-1.5 px-3 bg-[#2ec4b6] hover:bg-[#20a396] text-white font-bold text-xs rounded-xl border border-slate-900 transition-colors cursor-pointer text-center"
                                    >
                                        + Add New Cat
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1.1fr] gap-8 items-start">
                {/* Left Column */}
                <ProfileCard
                    catName={catName}
                    gender={gender}
                    weight={weight}
                    isKg={isKg}
                    foodPreference={foodPreference}
                    isSpayedNeutered={isSpayedNeutered}
                    activeLifeStage={activeLifeStage}
                    lifeStage={lifeStage}
                    age={age}
                    onEditProfile={() => setIsConfirmResetOpen(true)}
                />

                {/* Middle Column */}
                <MealsTracker
                    loggedMeals={loggedMeals}
                    waterIntake={waterIntake}
                    waterTarget={waterTarget}
                    addWater={addWater}
                    resetWater={resetWater}
                    onAddMeal={handleAddMealClick}
                    onEditMeal={handleEditMealClick}
                    onUndoSkip={(mealId) => resetMealLog(mealId)}
                />

                {/* Right Column */}
                <div className="flex flex-col gap-8 w-full">
                    <WeeklyCalendar />
                    <FeedingGuideline ageBracketInfo={ageBracketInfo} />
                    <CalorieTracker dailyCalories={dailyCalories} totalLoggedCalories={totalLoggedCalories} />
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmationDialog
                isOpen={isConfirmResetOpen}
                title="Edit Diet Profile?"
                message="Are you sure you want to edit your cat's diet profile? This will reset the recommendations."
                confirmText="Edit"
                cancelText="Cancel"
                onConfirm={() => {
                    setIsConfirmResetOpen(false);
                    onReset();
                }}
                onCancel={() => setIsConfirmResetOpen(false)}
            />

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
            />
        </div>
    );
};

export default DietDashboardView;
