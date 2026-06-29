import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';


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

    const getAuthHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
        };
    };

    const syncStatesToSetup = (profile: CatProfile) => {
        setCatName(profile.name);
        setGender(profile.gender);
        setLifeStage(profile.lifeStage);
        setAge(profile.age);
        setWeight(profile.weight);
        setIsKg(profile.isKg);
        setFoodPreference(profile.foodPreference);
        setIsSpayedNeutered(profile.isSpayedNeutered);
        setIsTracking(profile.isTracking);
    };

    // Load from backend on mount
    useEffect(() => {
        const loadFromBackend = async () => {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setProfiles(data);
                        localStorage.setItem('diet_profiles', JSON.stringify(data));
                        
                        const activeId = localStorage.getItem('diet_active_profile_id') || data[0].id;
                        const exists = data.some((p: any) => p.id === activeId);
                        const finalId = exists ? activeId : data[0].id;
                        
                        setActiveProfileId(finalId);
                        localStorage.setItem('diet_active_profile_id', finalId);

                        const active = data.find((p: any) => p.id === finalId) || data[0];
                        syncStatesToSetup(active);
                    }
                }
            } catch (e) {
                console.error('Failed to sync diet profiles from backend', e);
            }
        };
        loadFromBackend();
    }, []);

    const saveProfilesToStorage = (updatedList: CatProfile[]) => {
        localStorage.setItem('diet_profiles', JSON.stringify(updatedList));
    };

    const switchProfile = (id: string) => {
        const nextProfile = profiles.find(p => p.id === id);
        if (!nextProfile) return;
        setActiveProfileId(id);
        localStorage.setItem('diet_active_profile_id', id);
        syncStatesToSetup(nextProfile);
    };

    const createNewProfile = async (name: string) => {
        // Optimistic local state update first
        const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const tempProf: CatProfile = {
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
        const tempProfiles = [...profiles, tempProf];
        setProfiles(tempProfiles);
        setActiveProfileId(newId);
        syncStatesToSetup(tempProf);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: tempProf.name,
                    gender: tempProf.gender,
                    lifeStage: tempProf.lifeStage,
                    age: tempProf.age,
                    weight: tempProf.weight,
                    isKg: tempProf.isKg,
                    foodPreference: tempProf.foodPreference,
                    isSpayedNeutered: tempProf.isSpayedNeutered,
                    isTracking: tempProf.isTracking,
                }),
            });
            if (res.ok) {
                const serverProf = await res.json();
                setProfiles(prev => {
                    const filtered = prev.filter(p => p.id !== newId);
                    const list = [...filtered, serverProf];
                    saveProfilesToStorage(list);
                    return list;
                });
                setActiveProfileId(serverProf.id);
                localStorage.setItem('diet_active_profile_id', serverProf.id);
                syncStatesToSetup(serverProf);
            }
        } catch (e) {
            console.error('Failed to create profile on backend', e);
        }
    };

    const handleStartDietTracking = async () => {
        setIsTracking(true); // Optimistic UI update

        try {
            const updatedData = {
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
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updatedData),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const updatedProfiles = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(updatedProfiles);
                saveProfilesToStorage(updatedProfiles);
                syncStatesToSetup(updatedProf);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleResetDietTracking = async () => {
        setIsTracking(false); // Optimistic UI update

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ isTracking: false }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const updatedProfiles = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(updatedProfiles);
                saveProfilesToStorage(updatedProfiles);
                syncStatesToSetup(updatedProf);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addMeal = async (
        mealId: string,
        foodType: 'dry' | 'wet' | 'mixed',
        amount: number,
        unit: 'spoon' | 'cup',
        timestamp?: string
    ) => {
        const kcal = calculateMealCalories(foodType, amount, unit);
        
        // Optimistic UI update
        const updatedProfilesLocal = profiles.map(p => {
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
                return { ...p, loggedMeals: updatedMeals };
            }
            return p;
        });
        setProfiles(updatedProfilesLocal);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/meals/${mealId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    foodType,
                    amount,
                    unit,
                    kcal,
                    status: 'logged',
                    timestamp,
                }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const synced = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(synced);
                saveProfilesToStorage(synced);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const skipMeal = async (mealId: string) => {
        // Optimistic UI update
        const updatedProfilesLocal = profiles.map(p => {
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
                return { ...p, loggedMeals: updatedMeals };
            }
            return p;
        });
        setProfiles(updatedProfilesLocal);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/meals/${mealId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    status: 'skipped',
                    kcal: 0,
                }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const synced = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(synced);
                saveProfilesToStorage(synced);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const resetMealLog = async (mealId: string) => {
        // Optimistic UI update
        const updatedProfilesLocal = profiles.map(p => {
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
                            timestamp: undefined,
                        };
                    }
                    return m;
                });
                return { ...p, loggedMeals: updatedMeals };
            }
            return p;
        });
        setProfiles(updatedProfilesLocal);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/meals/${mealId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    status: 'pending',
                    kcal: 0,
                    foodType: null,
                    amount: null,
                    unit: null,
                    timestamp: null,
                }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const synced = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(synced);
                saveProfilesToStorage(synced);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addWater = async (amount: number) => {
        // Optimistic UI update
        const updatedProfilesLocal = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    waterIntake: Math.max(0, p.waterIntake + amount),
                };
            }
            return p;
        });
        setProfiles(updatedProfilesLocal);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/water`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ amount }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const synced = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(synced);
                saveProfilesToStorage(synced);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const resetWater = async () => {
        // Optimistic UI update
        const updatedProfilesLocal = profiles.map(p => {
            if (p.id === activeProfileId) {
                return {
                    ...p,
                    waterIntake: 0,
                };
            }
            return p;
        });
        setProfiles(updatedProfilesLocal);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/water`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ amount: 0 }),
            });
            if (res.ok) {
                const updatedProf = await res.json();
                const synced = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                setProfiles(synced);
                saveProfilesToStorage(synced);
            }
        } catch (e) {
            console.error(e);
        }
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
