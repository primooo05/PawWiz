import { useState } from 'react';

export interface MealLog {
    id: string;
    mealName: string; // 'Breakfast' | 'Lunch' | 'Dinner'
    foodType?: 'dry' | 'wet' | 'mixed';
    amount?: number;
    unit?: 'spoon' | 'cup';
    kcal: number;
    status: 'pending' | 'logged' | 'skipped';
    timestamp?: string;
}

export interface CatProfile {
    id: string;
    name: string;
    gender: 'male' | 'female';
    lifeStage: 'kitten' | 'adult';
    age: number; // months for kitten, years for adult
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    isTracking: boolean;
    loggedMeals: MealLog[];
    waterIntake: number; // in ml
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

export const calculateMealCalories = (
    foodType: 'dry' | 'wet' | 'mixed',
    amount: number,
    unit: 'spoon' | 'cup'
): number => {
    if (foodType === 'dry') {
        const grams = unit === 'cup' ? amount * 120 : amount * 15;
        return Math.round(grams * 3.8);
    } else if (foodType === 'wet') {
        const grams = unit === 'cup' ? amount * 240 : amount * 15;
        return Math.round(grams * 0.85);
    } else {
        // Mixed: 50% dry, 50% wet
        const dryGrams = unit === 'cup' ? (amount * 120) / 2 : (amount * 15) / 2;
        const wetGrams = unit === 'cup' ? (amount * 240) / 2 : (amount * 15) / 2;
        return Math.round(dryGrams * 3.8 + wetGrams * 0.85);
    }
};

const DEFAULT_PROFILES: CatProfile[] = [
    {
        id: 'aki',
        name: 'Aki',
        gender: 'male',
        lifeStage: 'adult',
        age: 3,
        weight: 4.5,
        isKg: true,
        foodPreference: 'mixed',
        isSpayedNeutered: true,
        isTracking: true,
        loggedMeals: [
            { id: '1', mealName: 'Breakfast', status: 'pending', kcal: 0 },
            { id: '2', mealName: 'Lunch', status: 'pending', kcal: 0 },
            { id: '3', mealName: 'Dinner', status: 'pending', kcal: 0 }
        ],
        waterIntake: 0
    },
    {
        id: 'luna',
        name: 'Luna',
        gender: 'female',
        lifeStage: 'kitten',
        age: 5,
        weight: 2.2,
        isKg: true,
        foodPreference: 'wet',
        isSpayedNeutered: false,
        isTracking: true,
        loggedMeals: [
            { id: '1', mealName: 'Breakfast', status: 'pending', kcal: 0 },
            { id: '2', mealName: 'Lunch', status: 'pending', kcal: 0 },
            { id: '3', mealName: 'Dinner', status: 'pending', kcal: 0 }
        ],
        waterIntake: 0
    }
];

export const useDietRecommender = () => {
    const [profiles, setProfiles] = useState<CatProfile[]>(() => {
        const stored = localStorage.getItem('diet_profiles');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse diet profiles', e);
            }
        }
        return DEFAULT_PROFILES;
    });

    const [activeProfileId, setActiveProfileId] = useState<string>(() => {
        return localStorage.getItem('diet_active_profile_id') || 'aki';
    });

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

    // Profile form states (synced to the current active profile)
    const [catName, setCatName] = useState<string>(activeProfile.name);
    const [gender, setGender] = useState<'male' | 'female'>(activeProfile.gender);
    const [lifeStage, setLifeStage] = useState<'kitten' | 'adult'>(activeProfile.lifeStage);
    const [age, setAge] = useState<number>(activeProfile.age);
    const [weight, setWeight] = useState<number>(activeProfile.weight);
    const [isKg, setIsKg] = useState<boolean>(activeProfile.isKg);
    const [foodPreference, setFoodPreference] = useState<'dry' | 'wet' | 'mixed'>(activeProfile.foodPreference);
    const [isSpayedNeutered, setIsSpayedNeutered] = useState<boolean>(activeProfile.isSpayedNeutered);
    const [isTracking, setIsTracking] = useState<boolean>(activeProfile.isTracking);

    const saveProfilesToStorage = (updatedList: CatProfile[]) => {
        localStorage.setItem('diet_profiles', JSON.stringify(updatedList));
    };

    const switchProfile = (id: string) => {
        const nextProfile = profiles.find(p => p.id === id);
        if (!nextProfile) return;
        setActiveProfileId(id);
        localStorage.setItem('diet_active_profile_id', id);

        // Sync setup form and active states
        setCatName(nextProfile.name);
        setGender(nextProfile.gender);
        setLifeStage(nextProfile.lifeStage);
        setAge(nextProfile.age);
        setWeight(nextProfile.weight);
        setIsKg(nextProfile.isKg);
        setFoodPreference(nextProfile.foodPreference);
        setIsSpayedNeutered(nextProfile.isSpayedNeutered);
        setIsTracking(nextProfile.isTracking);
    };

    const createNewProfile = (name: string) => {
        const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const newProf: CatProfile = {
            id: newId,
            name: name,
            gender: 'male',
            lifeStage: 'adult',
            age: 3,
            weight: 4.5,
            isKg: true,
            foodPreference: 'mixed',
            isSpayedNeutered: true,
            isTracking: false,
            loggedMeals: [
                { id: '1', mealName: 'Breakfast', status: 'pending', kcal: 0 },
                { id: '2', mealName: 'Lunch', status: 'pending', kcal: 0 },
                { id: '3', mealName: 'Dinner', status: 'pending', kcal: 0 }
            ],
            waterIntake: 0
        };
        const updatedList = [...profiles, newProf];
        setProfiles(updatedList);
        saveProfilesToStorage(updatedList);
        setActiveProfileId(newId);
        localStorage.setItem('diet_active_profile_id', newId);
        
        // Sync states to setup
        setCatName(newProf.name);
        setGender(newProf.gender);
        setLifeStage(newProf.lifeStage);
        setAge(newProf.age);
        setWeight(newProf.weight);
        setIsKg(newProf.isKg);
        setFoodPreference(newProf.foodPreference);
        setIsSpayedNeutered(newProf.isSpayedNeutered);
        setIsTracking(false);
    };

    const handleStartDietTracking = () => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    name: catName,
                    gender,
                    lifeStage,
                    age,
                    weight,
                    isKg,
                    foodPreference,
                    isSpayedNeutered,
                    isTracking: true,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
        setIsTracking(true);
    };

    const handleResetDietTracking = () => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    isTracking: false,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
        setIsTracking(false);
    };

    const addMeal = (
        mealId: string,
        foodType: 'dry' | 'wet' | 'mixed',
        amount: number,
        unit: 'spoon' | 'cup',
        timestamp?: string
    ) => {
        const kcal = calculateMealCalories(foodType, amount, unit);
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                const updatedMeals = p.loggedMeals.map(m => {
                    if (m.id === mealId) {
                        return {
                            ...m,
                            foodType,
                            amount,
                            unit,
                            kcal,
                            timestamp,
                            status: 'logged' as const,
                        };
                    }
                    return m;
                });
                return {
                    ...p,
                    loggedMeals: updatedMeals,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
    };

    const skipMeal = (mealId: string) => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                const updatedMeals = p.loggedMeals.map(m => {
                    if (m.id === mealId) {
                        return {
                            ...m,
                            status: 'skipped' as const,
                            kcal: 0,
                        };
                    }
                    return m;
                });
                return {
                    ...p,
                    loggedMeals: updatedMeals,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
    };

    const resetMealLog = (mealId: string) => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                const updatedMeals = p.loggedMeals.map(m => {
                    if (m.id === mealId) {
                        return {
                            ...m,
                            status: 'pending' as const,
                            kcal: 0,
                            amount: undefined,
                            unit: undefined,
                            foodType: undefined,
                        };
                    }
                    return m;
                });
                return {
                    ...p,
                    loggedMeals: updatedMeals,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
    };

    const addWater = (amount: number) => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    waterIntake: Math.max(0, p.waterIntake + amount),
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
    };

    const resetWater = () => {
        const updatedProfiles = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    waterIntake: 0,
                };
            }
            return p;
        });
        setProfiles(updatedProfiles);
        saveProfilesToStorage(updatedProfiles);
    };

    const toggleUnit = (toKg: boolean) => {
        if (isKg === toKg) return;
        setIsKg(toKg);
        setWeight(prev => toKg ? parseFloat((prev / 2.205).toFixed(1)) : parseFloat((prev * 2.205).toFixed(1)));
    };

    const ageBracketInfo = getAgeBracketInfo(lifeStage, age);

    return {
        profiles,
        activeProfileId,
        activeProfile,
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
        setIsKg,
        foodPreference,
        setFoodPreference,
        isSpayedNeutered,
        setIsSpayedNeutered,
        isTracking,
        setIsTracking,
        activeLifeStage: lifeStage,
        ageBracketInfo,
        handleStartDietTracking,
        handleResetDietTracking,
        toggleUnit,
        addMeal,
        skipMeal,
        resetMealLog,
        addWater,
        resetWater,
        loggedMeals: activeProfile.loggedMeals,
        waterIntake: activeProfile.waterIntake,
    };
};
