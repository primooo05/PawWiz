import React, { useState, useEffect, useCallback } from 'react';
import LoadingScreen from '../../layout/LoadingScreen';
import DietSetupView, { DietSetupModal } from './DietSetupView';
import DietDashboardView from './DietDashboardView';
import { useDietRecommender } from '../../../hooks/features/useDietRecommender';
import BottomNav from '../../layout/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationDialog from '../../ui/modals/ConfirmationDialog';

export const DietRecommender: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        profiles,
        activeProfileId,
        switchProfile,
        createNewProfile,
        catName,
        setCatName,
        gender,
        setGender,
        lifeStage,
        setLifeStage,
        age,
        setAge,
        weight,
        setWeight,
        isKg,
        foodPreference,
        setFoodPreference,
        isSpayedNeutered,
        setIsSpayedNeutered,
        isTracking,
        activeLifeStage,
        ageBracketInfo,
        handleStartDietTracking,
        handleResetDietTracking,
        toggleUnit,
        addMeal,
        skipMeal,
        resetMealLog,
        addWater,
        resetWater,
        loggedMeals,
        waterIntake,
        hasNoUserProfile,
        displayName,
        setDisplayName,
    } = useDietRecommender();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingTarget, setLoadingTarget] = useState<'dashboard' | 'setup' | null>(null);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
    const [hasCheckedInitialState, setHasCheckedInitialState] = useState<boolean>(false);
    const [newCatToSetup, setNewCatToSetup] = useState<any>(null);

    useEffect(() => {
        if (!hasCheckedInitialState) {
            // Open setup modal if no tracking profile exists
            if (!hasNoUserProfile && profiles.length > 0) {
                const hasTrackingProfile = profiles.some(p => p.isTracking);
                setIsSetupModalOpen(!hasTrackingProfile);
                setHasCheckedInitialState(true);
            } else if (hasNoUserProfile) {
                setIsSetupModalOpen(!isTracking);
                setHasCheckedInitialState(true);
            }
        }
    }, [profiles, isTracking, hasNoUserProfile, hasCheckedInitialState]);

    useEffect(() => {
        if (location.state?.askSetupFor && profiles.length > 0) {
            const targetProfile = profiles.find(p => p.id === location.state.askSetupFor);
            if (targetProfile && !targetProfile.isTracking) {
                setNewCatToSetup(targetProfile);
            }
            // Clear location state to prevent repeating popups on back navigation
            window.history.replaceState({}, document.title);
        }
    }, [location.state, profiles]);

    const handleSwitchProfile = (id: string) => {
        const targetProfile = profiles.find(p => p.id === id);
        if (targetProfile && !targetProfile.isTracking) {
            setNewCatToSetup(targetProfile);
        } else {
            switchProfile(id);
        }
    };

    const handleConfirmSetup = () => {
        if (newCatToSetup) {
            switchProfile(newCatToSetup.id);
            setIsSetupModalOpen(true);
            setNewCatToSetup(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (weight > 0) {
            setLoadingTarget('dashboard');
            setIsLoading(true);
        }
    };

    const handleResetWithLoading = () => {
        setIsSetupModalOpen(true);
    };

    const handleLoadingComplete = useCallback(() => {
        setIsLoading(false);
        if (loadingTarget === 'dashboard') {
            handleStartDietTracking();
            setIsSetupModalOpen(false);
        }
        setLoadingTarget(null);
    }, [loadingTarget, handleStartDietTracking]);

    const handleNavigation = (item: string) => {
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/dashboard');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        } else if (item === 'behavior') {
            navigate('/behavior-chat');
        } else if (item === 'settings') {
            navigate('/settings');
        } else if (item === 'plant') {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
            {/* Main content container - Always show dashboard */}
            <main className="w-full px-4 sm:px-6 md:px-8 py-6 flex-grow flex flex-col justify-stretch">
                <DietDashboardView
                    weight={weight}
                    isKg={isKg}
                    foodPreference={foodPreference}
                    isSpayedNeutered={isSpayedNeutered}
                    activeLifeStage={activeLifeStage}
                    lifeStage={lifeStage}
                    age={age}
                    ageBracketInfo={ageBracketInfo}
                    onReset={handleResetWithLoading}
                    catName={catName}
                    gender={gender}
                    profiles={profiles}
                    activeProfileId={activeProfileId}
                    switchProfile={handleSwitchProfile}
                    createNewProfile={createNewProfile}
                    loggedMeals={loggedMeals}
                    waterIntake={waterIntake}
                    addMeal={addMeal}
                    skipMeal={skipMeal}
                    resetMealLog={resetMealLog}
                    addWater={addWater}
                    resetWater={resetWater}
                    displayName={displayName}
                />
                
                {/* Setup Modal Overlay */}
                <DietSetupModal
                    isOpen={isSetupModalOpen}
                    onClose={() => setIsSetupModalOpen(false)}
                    catName={catName}
                    setCatName={setCatName}
                    gender={gender}
                    setGender={setGender}
                    lifeStage={lifeStage}
                    setLifeStage={setLifeStage}
                    age={age}
                    setAge={setAge}
                    weight={weight}
                    setWeight={setWeight}
                    isKg={isKg}
                    toggleUnit={toggleUnit}
                    foodPreference={foodPreference}
                    setFoodPreference={setFoodPreference}
                    isSpayedNeutered={isSpayedNeutered}
                    setIsSpayedNeutered={setIsSpayedNeutered}
                    onSubmit={(e) => {
                        handleSubmit(e);
                    }}
                    profiles={profiles}
                    activeProfileId={activeProfileId}
                    switchProfile={handleSwitchProfile}
                    hasNoUserProfile={hasNoUserProfile}
                    displayName={displayName}
                    setDisplayName={setDisplayName}
                    isLoading={isLoading}
                />
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="diet-reco" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
            </div>

            {isLoading && (
                <LoadingScreen
                    durationMs={4000}
                    catName={catName}
                    onComplete={handleLoadingComplete}
                />
            )}

            {newCatToSetup && (
                <ConfirmationDialog
                    isOpen={!!newCatToSetup}
                    title="Set Up Diet Profile?"
                    message={`Would you like to set up the diet profile for ${newCatToSetup.name} now?`}
                    confirmText="Set Up Now"
                    cancelText="Later"
                    onConfirm={handleConfirmSetup}
                    onCancel={() => {
                        setNewCatToSetup(null);
                        const configuredProfile = profiles.find(p => p.isTracking);
                        if (configuredProfile) {
                            switchProfile(configuredProfile.id);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default DietRecommender;
