import { useState } from 'react';

export interface DietProfile {
    lifeStage: 'kitten' | 'adult';
    age: number; // months for kitten, years for adult
    weight: number; // always stored in kg
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    isKg: boolean;
}

export interface AgeBracketDetails {
    bracket: string;
    recommendedFood: string;
    frequency: string;
    portionGuide: string;
}

export const getAgeBracketInfo = (lifeStage: 'kitten' | 'adult', age: number): AgeBracketDetails => {
    if (lifeStage === 'kitten') {
        if (age <= 1) {
            return {
                bracket: 'Kitten: 0 – 4 weeks',
                recommendedFood: "Mother's milk or Kitten Milk Replacer (KMR)",
                frequency: "Every 2–4 hours",
                portionGuide: "2–20ml per feed",
            };
        } else if (age <= 1.5) {
            return {
                bracket: 'Kitten: 4 – 6 weeks',
                recommendedFood: "KMR + kitten kibble slurry",
                frequency: "4–6 times per day",
                portionGuide: "Free access (always keep available)",
            };
        } else if (age <= 2) {
            return {
                bracket: 'Kitten: 6 – 8 weeks',
                recommendedFood: "Dry kibble + wet food (weaning transition)",
                frequency: "4 times per day",
                portionGuide: "Per package guide",
            };
        } else if (age <= 6) {
            return {
                bracket: 'Kitten: 2 – 6 months',
                recommendedFood: "Kitten kibble + wet food",
                frequency: "3–4 times per day",
                portionGuide: "Weight-based portions",
            };
        } else {
            return {
                bracket: 'Kitten: 6 – 12 months',
                recommendedFood: "Kitten food",
                frequency: "2–3 times per day",
                portionGuide: "Adjust portion based on activity and spay/neuter status",
            };
        }
    } else {
        return {
            bracket: `Adult: ${age} ${age === 1 ? 'year' : 'years'} old`,
            recommendedFood: "Adult cat food",
            frequency: "2 times per day",
            portionGuide: "Controlled portions (weight-based)",
        };
    }
};

export const useDietRecommender = () => {
    const [lifeStage, setLifeStage] = useState<'kitten' | 'adult'>(() => {
        return (localStorage.getItem('diet_lifeStage') as 'kitten' | 'adult') || 'adult';
    });
    const [age, setAge] = useState<number>(() => {
        const stored = localStorage.getItem('diet_age');
        return stored ? parseInt(stored) : 3; // Default 3 years (if adult) or 3 months (if kitten)
    });
    const [weight, setWeight] = useState<number>(() => {
        const stored = localStorage.getItem('diet_weight');
        return stored ? parseFloat(stored) : 4.5;
    });
    const [isKg, setIsKg] = useState<boolean>(() => {
        return localStorage.getItem('diet_isKg') !== 'false';
    });
    const [foodPreference, setFoodPreference] = useState<'dry' | 'wet' | 'mixed'>(() => {
        return (localStorage.getItem('diet_foodPreference') as 'dry' | 'wet' | 'mixed') || 'mixed';
    });
    const [isSpayedNeutered, setIsSpayedNeutered] = useState<boolean>(() => {
        return localStorage.getItem('diet_isSpayedNeutered') === 'true';
    });
    const [isTracking, setIsTracking] = useState<boolean>(() => {
        return localStorage.getItem('diet_isTracking') === 'true';
    });

    const saveProfile = (profile: DietProfile) => {
        localStorage.setItem('diet_lifeStage', profile.lifeStage);
        localStorage.setItem('diet_age', profile.age.toString());
        localStorage.setItem('diet_weight', profile.weight.toString());
        localStorage.setItem('diet_foodPreference', profile.foodPreference);
        localStorage.setItem('diet_isSpayedNeutered', profile.isSpayedNeutered ? 'true' : 'false');
        localStorage.setItem('diet_isKg', profile.isKg ? 'true' : 'false');
    };

    const activeLifeStage = lifeStage;
    const ageBracketInfo = getAgeBracketInfo(lifeStage, age);

    const handleStartDietTracking = () => {
        saveProfile({
            lifeStage,
            age,
            weight,
            foodPreference,
            isSpayedNeutered,
            isKg,
        });
        localStorage.setItem('diet_isTracking', 'true');
        setIsTracking(true);
    };

    const handleResetDietTracking = () => {
        localStorage.removeItem('diet_isTracking');
        setIsTracking(false);
    };

    const toggleUnit = (toKg: boolean) => {
        if (isKg === toKg) return;
        setIsKg(toKg);
        setWeight(prev => toKg ? parseFloat((prev / 2.205).toFixed(1)) : parseFloat((prev * 2.205).toFixed(1)));
    };

    return {
        lifeStage,
        setLifeStage,
        age,
        setAge,
        weight,
        setWeight,
        isKg,
        setIsKg,
        foodPreference,
        setFoodPreference,
        isSpayedNeutered,
        setIsSpayedNeutered,
        isTracking,
        setIsTracking,
        activeLifeStage,
        ageBracketInfo,
        handleStartDietTracking,
        handleResetDietTracking,
        toggleUnit,
    };
};
