import React, { useState } from 'react';
import type { AgeBracketDetails, MealLog, CatProfile } from '../../hooks/useDietRecommender';
import ConfirmationDialog from '../modals/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';

// Import subcomponents
import ProfileCard from './sub-components/ProfileCard';
import MealsTracker from './sub-components/MealsTracker';
import WeeklyCalendar from './sub-components/WeeklyCalendar';
import FeedingGuideline from './sub-components/FeedingGuideline';
import CalorieTracker from './sub-components/CalorieTracker';
import MealLogModal from './sub-components/MealLogModal';
import AnimatedAvatarGroup from '../smoothui/animated-avatar-group';
import { motion } from 'motion/react';

interface DietDashboardViewProps {
    catName: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult' | 'senior';
    lifeStage: 'kitten' | 'adult' | 'senior';
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
    displayName?: string;
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
    addMeal,
    skipMeal,
    resetMealLog,
    addWater,
    resetWater,
    loggedMeals,
    waterIntake,
    displayName,
}) => {
    const navigate = useNavigate();
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

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

    const avatarDataList = profiles.map(p => ({
        id: p.id,
        name: p.name,
        src: p.photoUrl || undefined,
        alt: p.name,
        isActive: p.id === activeProfileId,
        isNew: !p.isTracking
    }));

    const activePhotoUrl = profiles.find(p => p.id === activeProfileId)?.photoUrl;

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

    return (
        <div className="flex flex-col gap-8 w-full flex-grow text-slate-800">
            {/* Header Greeting Row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{greeting.title}</h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{greeting.subtitle}</p>
                </div>

                {/* Profile Switcher via AnimatedAvatarGroup */}
                <div className="relative self-stretch sm:self-auto flex items-center">
                    <AnimatedAvatarGroup
                        avatars={avatarDataList}
                        onAvatarClick={(id) => switchProfile(id)}
                        onAddClick={() => navigate('/settings')}
                    />
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1.1fr] gap-8 items-stretch flex-grow">
                {/* Left Column */}
                <motion.div
                    key={`profile-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="h-full"
                >
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
                        photoUrl={activePhotoUrl}
                    />
                </motion.div>

                {/* Middle Column */}
                <motion.div
                    key={`tracker-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                    className="h-full"
                >
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
                </motion.div>

                {/* Right Column */}
                <motion.div
                    key={`guidelines-${activeProfileId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                    className="flex flex-col gap-8 w-full h-full"
                >
                    <WeeklyCalendar successDays={React.useMemo(() => {
                        try {
                            return JSON.parse(localStorage.getItem(`diet_success_days_${activeProfileId}`) || '[]');
                        } catch (e) {
                            return [];
                        }
                    }, [activeProfileId, loggedMeals])} />
                    <FeedingGuideline ageBracketInfo={ageBracketInfo} />
                    <CalorieTracker dailyCalories={dailyCalories} totalLoggedCalories={totalLoggedCalories} />
                </motion.div>
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
