import React, { useState } from 'react';
import LoadingScreen from '../LoadingScreen';
import DietSetupView from './DietSetupView';
import DietDashboardView from './DietDashboardView';
import { useDietRecommender } from '../../hooks/useDietRecommender';
import BottomNav from '../BottomNav';
import { useNavigate } from 'react-router-dom';

export const DietRecommender: React.FC = () => {
    const navigate = useNavigate();
    const {
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
    } = useDietRecommender();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (weight > 0) {
            setIsLoading(true);
        }
    };

    const handleNavigation = (item: string) => {
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20">
            {/* Main content container */}
            <main className="max-w-[1440px] px-8 py-12 mx-auto">
                {!isTracking ? (
                    <DietSetupView
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
                    />
                ) : (
                    <DietDashboardView
                        weight={weight}
                        foodPreference={foodPreference}
                        isSpayedNeutered={isSpayedNeutered}
                        activeLifeStage={activeLifeStage}
                        lifeStage={lifeStage}
                        age={age}
                        ageBracketInfo={ageBracketInfo}
                        onReset={handleResetDietTracking}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="diet-reco" onItemClick={handleNavigation} className="w-full max-w-sm md:w-auto md:scale-110" />
            </div>

            {isLoading && (
                <LoadingScreen
                    durationMs={4000}
                    onComplete={() => {
                        setIsLoading(false);
                        handleStartDietTracking();
                    }}
                />
            )}
        </div>
    );
};

export default DietRecommender;
