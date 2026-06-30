import React, { useState, useEffect } from 'react';
import LoadingScreen from '../LoadingScreen';
import DietSetupView from './DietSetupView';
import DietDashboardView from './DietDashboardView';
import { useDietRecommender } from '../../hooks/useDietRecommender';
import BottomNav from '../BottomNav';
import { useNavigate } from 'react-router-dom';

export const DietRecommender: React.FC = () => {
    const navigate = useNavigate();
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
    } = useDietRecommender();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingTarget, setLoadingTarget] = useState<'dashboard' | 'setup' | null>(null);
    const [showSetup, setShowSetup] = useState<boolean>(true);

    useEffect(() => {
        setShowSetup(!isTracking);
    }, [isTracking]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (weight > 0) {
            setLoadingTarget('dashboard');
            setIsLoading(true);
        }
    };

    const handleResetWithLoading = () => {
        setLoadingTarget('setup');
        setIsLoading(true);
    };

    const handleNavigation = (item: string) => {
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        } else if (item === 'settings') {
            navigate('/settings');
        } else if (item === 'plant') {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
            {/* Main content container */}
            <main className={showSetup || !isTracking ? "max-w-[1440px] w-full px-8 py-12 mx-auto" : "w-full px-4 sm:px-6 md:px-8 py-6 flex-grow flex flex-col justify-stretch"}>
                {showSetup || !isTracking ? (
                    <DietSetupView
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
                        onSubmit={handleSubmit}
                        profiles={profiles}
                        activeProfileId={activeProfileId}
                        switchProfile={switchProfile}
                    />
                ) : (
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
                        switchProfile={switchProfile}
                        createNewProfile={createNewProfile}
                        loggedMeals={loggedMeals}
                        waterIntake={waterIntake}
                        addMeal={addMeal}
                        skipMeal={skipMeal}
                        resetMealLog={resetMealLog}
                        addWater={addWater}
                        resetWater={resetWater}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="diet-reco" onItemClick={handleNavigation} className="w-full max-w-sm md:w-auto md:scale-110" />
            </div>

            {isLoading && (
                <LoadingScreen
                    durationMs={loadingTarget === 'setup' ? 2500 : 4000}
                    catName={catName}
                    message={loadingTarget === 'setup' ? `Resetting ${catName || "cat"}'s tracker...` : undefined}
                    onComplete={() => {
                        setIsLoading(false);
                        if (loadingTarget === 'dashboard') {
                            handleStartDietTracking();
                            setShowSetup(false);
                        } else if (loadingTarget === 'setup') {
                            handleResetDietTracking();
                            setShowSetup(true);
                        }
                        setLoadingTarget(null);
                    }}
                />
            )}
        </div>
    );
};

export default DietRecommender;
