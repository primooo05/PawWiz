import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import { calculateKcal, type FoodType, type MealUnit } from '../../lib/foods';

export interface MealLog {
    id: string;
    mealName: string; // 'Breakfast' | 'Lunch' | 'Dinner'
    foodType?: string; // catalog id (see FoodType) or a custom food name
    amount?: number;
    unit?: MealUnit;
    kcal: number;
    status: 'pending' | 'logged' | 'skipped';
    timestamp?: string;
    updatedAt?: string;
}

export interface CatProfile {
    id: string;
    name: string;
    gender: 'male' | 'female';
    lifeStage: 'kitten' | 'adult' | 'senior';
    age: number; // months for kitten, years for adult/senior
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    isTracking: boolean;
    loggedMeals: MealLog[];
    waterIntake: number; // in ml
    photoUrl?: string | null;
    breed?: string | null;
    marking?: string | null;
    updatedAt?: string;
    successDays?: string[];
}

export interface AgeBracketDetails {
    bracket: string;
    recommendedFood: string;
    frequency: string;
    portionGuide: string;
}

export const getAgeBracketInfo = (lifeStage: 'kitten' | 'adult' | 'senior', age: number): AgeBracketDetails => {
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
    } else if (lifeStage === 'senior') {
        return {
            bracket: `Senior: ${age} years old`,
            recommendedFood: "Senior cat food (easy to digest)",
            frequency: "2 times per day",
            portionGuide: "Controlled portions (weight and kidney health based)",
        };
    } else {
        return {
            bracket: `Adult: ${age} ${age === 1 ? 'year' : 'years'} old`,
            recommendedFood: "Adult cat food",
            frequency: "2 times per day",
            portionGuide: "Controlled portions (weight-based)",
        };
    }
};

/**
 * Calories for a logged meal. Delegates to the shared food catalog, which
 * computes grams (from the food + amount + unit) × caloric density. Unit
 * defaults to 'spoon' for backward compatibility with older call sites.
 */
export const calculateMealCalories = (
    foodType: FoodType,
    amount: number,
    unit: MealUnit = 'spoon'
): number => calculateKcal(foodType, amount, unit);

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
        return [];
    });

    const [activeProfileId, setActiveProfileId] = useState<string>(() => {
        return localStorage.getItem('diet_active_profile_id') || '';
    });

    const activeProfileRaw = profiles.find(p => p.id === activeProfileId) || profiles[0];

    const sanitizeProfileMeals = (profile?: CatProfile): CatProfile | undefined => {
        if (!profile) return undefined;
        const todayStr = new Date().toLocaleDateString('sv-SE');
        const waterDateKey = `diet_water_date_${profile.id}`;
        const lastWaterDate = localStorage.getItem(waterDateKey);
        const isWaterToday = lastWaterDate === todayStr;

        return {
            ...profile,
            loggedMeals: profile.loggedMeals.map(m => {
                if (m.status !== 'pending' && m.updatedAt) {
                    const mealDateStr = new Date(m.updatedAt).toLocaleDateString('sv-SE');
                    if (mealDateStr !== todayStr) {
                        return {
                            ...m,
                            status: 'pending',
                            kcal: 0,
                            foodType: undefined,
                            amount: undefined,
                            unit: undefined,
                            timestamp: undefined,
                        };
                    }
                }
                return m;
            }),
            waterIntake: isWaterToday ? profile.waterIntake : 0
        };
    };

    const activeProfile = sanitizeProfileMeals(activeProfileRaw);

    // Profile form states (synced to the current active profile)
    const [catName, setCatName] = useState<string>(activeProfile?.name || '');
    const [gender, setGender] = useState<'male' | 'female'>(activeProfile?.gender || 'male');
    const [lifeStage, setLifeStage] = useState<'kitten' | 'adult' | 'senior'>(activeProfile?.lifeStage || 'adult');
    const [age, setAge] = useState<number>(activeProfile?.age || 0);
    const [weight, setWeight] = useState<number>(activeProfile?.weight || 0);
    const [isKg, setIsKg] = useState<boolean>(activeProfile ? activeProfile.isKg : true);
    const [foodPreference, setFoodPreference] = useState<'dry' | 'wet' | 'mixed'>(activeProfile?.foodPreference || 'mixed');
    const [isSpayedNeutered, setIsSpayedNeutered] = useState<boolean>(activeProfile ? activeProfile.isSpayedNeutered : true);
    const [isTracking, setIsTracking] = useState<boolean>(activeProfile ? activeProfile.isTracking : false);
    const [hasNoUserProfile, setHasNoUserProfile] = useState<boolean>(false);
    const [displayName, setDisplayName] = useState<string>('');

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

    // Load from backend on mount / auth state change
    useEffect(() => {
        let active = true;

        const clearLocalProfileData = () => {
            setProfiles([]);
            setActiveProfileId('');
            localStorage.removeItem('diet_profiles');
            localStorage.removeItem('diet_active_profile_id');
        };

        const loadFromBackend = async (session: any) => {
            if (!session) return;
            try {
                // Fetch primary profile details first to get displayName
                let primaryProfile: any = null;
                const profileRes = await fetch(`${API_BASE}/api/profile`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    }
                });
                if (profileRes.ok && active) {
                    primaryProfile = await profileRes.json();
                    if (primaryProfile && primaryProfile.displayName) {
                        setDisplayName(primaryProfile.displayName);
                    }
                }

                const res = await fetch(`${API_BASE}/api/diet/profiles`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    }
                });
                if (res.status === 404 && active) {
                    setHasNoUserProfile(true);
                    clearLocalProfileData();
                    return;
                }
                if (res.ok && active) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setProfiles(data);
                        localStorage.setItem('diet_profiles', JSON.stringify(data));

                        const activeId = localStorage.getItem('diet_active_profile_id') || data[0].id;
                        const exists = data.some((p: any) => p.id === activeId);
                        const finalId = exists ? activeId : data[0].id;

                        setActiveProfileId(finalId);
                        localStorage.setItem('diet_active_profile_id', finalId);

                        const activeProfileData = data.find((p: any) => p.id === finalId) || data[0];
                        syncStatesToSetup(activeProfileData);
                    } else {
                        clearLocalProfileData();
                        // Query the onboarding profile details to autofill if profileRes has already loaded
                        if (primaryProfile) {
                            setCatName(primaryProfile.catName || '');
                            setGender(primaryProfile.catSex === 'female' ? 'female' : 'male');
                            setLifeStage(primaryProfile.catLifeStage === 'kitten' ? 'kitten' : 'adult');
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to sync diet profiles from backend', e);
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (active) {
                if (session) {
                    loadFromBackend(session);
                } else {
                    clearLocalProfileData();
                }
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active) {
                if (session) {
                    loadFromBackend(session);
                } else {
                    clearLocalProfileData();
                }
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
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

    const createNewProfile = async (name: string, customDetails?: Partial<Omit<CatProfile, 'id' | 'loggedMeals'>>) => {
        // Optimistic local state update first
        const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const tempProf: CatProfile = {
            id: newId,
            name: name,
            gender: customDetails?.gender || 'male',
            lifeStage: customDetails?.lifeStage || 'adult',
            age: customDetails?.age ?? 3,
            weight: customDetails?.weight ?? 4.5,
            isKg: customDetails?.isKg ?? true,
            foodPreference: customDetails?.foodPreference || 'mixed',
            isSpayedNeutered: customDetails?.isSpayedNeutered ?? true,
            isTracking: customDetails?.isTracking ?? false,
            loggedMeals: [
                { id: '1', mealName: 'Breakfast', status: 'pending', kcal: 0 },
                { id: '2', mealName: 'Lunch', status: 'pending', kcal: 0 },
                { id: '3', mealName: 'Dinner', status: 'pending', kcal: 0 }
            ],
            waterIntake: 0,
            breed: customDetails?.breed || null,
            marking: customDetails?.marking || null
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
                    breed: tempProf.breed,
                    marking: tempProf.marking
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
                return serverProf;
            }
        } catch (e) {
            console.error('Failed to create profile on backend', e);
        }
    };

    const deleteProfile = async (id: string) => {
            const updatedProfilesLocal = profiles.filter(p => p.id !== id);
            setProfiles(updatedProfilesLocal);
            saveProfilesToStorage(updatedProfilesLocal);
            if (activeProfileId === id && updatedProfilesLocal.length > 0) {
                setActiveProfileId(updatedProfilesLocal[0].id);
                localStorage.setItem('diet_active_profile_id', updatedProfilesLocal[0].id);
                syncStatesToSetup(updatedProfilesLocal[0]);
            } else if (updatedProfilesLocal.length === 0) {
                setActiveProfileId('');
                localStorage.removeItem('diet_active_profile_id');
            }

            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                if (!res.ok) {
                    throw new Error('Failed to delete profile on server');
                }
            } catch (e) {
                console.error('Failed to delete profile', e);
            }
        };

        // Edit an existing cat's profile (identity + diet fields) — used by Settings
        const updateProfile = async (
            id: string,
            data: Partial<Omit<CatProfile, 'id' | 'loggedMeals'>>
        ) => {
            // Optimistic local update
            setProfiles(prev => {
                const updated = prev.map(p => (p.id === id ? { ...p, ...data } : p));
                saveProfilesToStorage(updated);
                return updated;
            });
            if (id === activeProfileId) {
                const merged = profiles.find(p => p.id === id);
                if (merged) syncStatesToSetup({ ...merged, ...data } as CatProfile);
            }

            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles/${id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(data),
                });
                if (res.ok) {
                    const serverProf = await res.json();
                    setProfiles(prev => {
                        const synced = prev.map(p => (p.id === id ? serverProf : p));
                        saveProfilesToStorage(synced);
                        return synced;
                    });
                    if (id === activeProfileId) {
                        syncStatesToSetup(serverProf);
                    }
                    return serverProf;
                }
                throw new Error('Failed to update profile on server');
            } catch (e) {
                console.error('Failed to update profile', e);
            }
        };

        const handleStartDietTracking = async () => {
            setIsTracking(true); // Optimistic UI update

            try {
                const profileData = {
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

                if (hasNoUserProfile) {
                    const profileRes = await fetch(`${API_BASE}/api/profile`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            displayName: displayName || (catName ? `${catName}'s Owner` : 'Owner'),
                            catName: catName || 'My Cat',
                            catSex: gender === 'female' ? 'female' : 'male',
                            catLifeStage: lifeStage === 'kitten' ? 'kitten' : 'adult',
                        }),
                    });
                    if (!profileRes.ok) {
                        throw new Error('Failed to create primary profile');
                    }
                    setHasNoUserProfile(false);
                }

                if (!activeProfileId) {
                    // No profile exists yet, create one via POST
                    const res = await fetch(`${API_BASE}/api/diet/profiles`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(profileData),
                    });
                    if (res.ok) {
                        const newProf = await res.json();
                        setProfiles([newProf]);
                        setActiveProfileId(newProf.id);
                        localStorage.setItem('diet_active_profile_id', newProf.id);
                        saveProfilesToStorage([newProf]);
                        syncStatesToSetup(newProf);
                    }
                } else {
                    // Profile exists, update it via PUT
                    const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(profileData),
                    });
                    if (res.ok) {
                        const updatedProf = await res.json();
                        const updatedProfiles = profiles.map(p => p.id === activeProfileId ? updatedProf : p);
                        setProfiles(updatedProfiles);
                        saveProfilesToStorage(updatedProfiles);
                        syncStatesToSetup(updatedProf);
                    }
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
            foodType: string,
            amount: number,
            unit: MealUnit,
            timestamp?: string,
            kcalOverride?: number
        ) => {
            // Prefer the caller-supplied kcal (the modal already computed it,
            // including custom foods priced from their label). Fall back to the
            // catalog calculation for legacy call sites.
            const kcal = kcalOverride ?? calculateMealCalories(foodType as FoodType, amount, unit);

            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
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
            }));

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
                    setProfiles(prevProfiles => {
                        const synced = prevProfiles.map(p => p.id === activeProfileId ? updatedProf : p);
                        saveProfilesToStorage(synced);
                        return synced;
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };

        const skipMeal = async (mealId: string) => {
            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
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
            }));

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
                    setProfiles(prevProfiles => {
                        const synced = prevProfiles.map(p => p.id === activeProfileId ? updatedProf : p);
                        saveProfilesToStorage(synced);
                        return synced;
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };

        const resetMealLog = async (mealId: string) => {
            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
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
            }));

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
                    setProfiles(prevProfiles => {
                        const synced = prevProfiles.map(p => p.id === activeProfileId ? updatedProf : p);
                        saveProfilesToStorage(synced);
                        return synced;
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };

        const addWater = async (amount: number) => {
            const todayStr = new Date().toLocaleDateString('sv-SE');
            localStorage.setItem(`diet_water_date_${activeProfileId}`, todayStr);

            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
                if (p.id === activeProfileId) {
                    return {
                        ...p,
                        waterIntake: Math.max(0, p.waterIntake + amount),
                    };
                }
                return p;
            }));

            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/water`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ amount }),
                });
                if (res.ok) {
                    const updatedProf = await res.json();
                    setProfiles(prevProfiles => {
                        const synced = prevProfiles.map(p => p.id === activeProfileId ? { ...updatedProf, waterIntake: updatedProf.waterIntake } : p);
                        saveProfilesToStorage(synced);
                        return synced;
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };

        const resetWater = async () => {
            const todayStr = new Date().toLocaleDateString('sv-SE');
            localStorage.setItem(`diet_water_date_${activeProfileId}`, todayStr);

            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
                if (p.id === activeProfileId) {
                    return {
                        ...p,
                        waterIntake: 0,
                    };
                }
                return p;
            }));

            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/water`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ amount: 0 }),
                });
                if (res.ok) {
                    const updatedProf = await res.json();
                    setProfiles(prevProfiles => {
                        const synced = prevProfiles.map(p => p.id === activeProfileId ? { ...updatedProf, waterIntake: 0 } : p);
                        saveProfilesToStorage(synced);
                        return synced;
                    });
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

        // Daily Reset Logic
        useEffect(() => {
            if (!activeProfileId || !activeProfileRaw) return;

            const checkDailyReset = async () => {
                const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
                const lastDateKey = `diet_last_date_${activeProfileId}`;
                const successDaysKey = `diet_success_days_${activeProfileId}`;
                const lastTrackedDate = localStorage.getItem(lastDateKey);

                let needsReset = false;
                let prevDayStr = lastTrackedDate;

                if (lastTrackedDate && lastTrackedDate !== todayStr) {
                    needsReset = true;
                }

                if (activeProfileRaw && activeProfileRaw.loggedMeals) {
                    const loggedMealsWithDates = activeProfileRaw.loggedMeals.filter(m => m.updatedAt && (m.status === 'logged' || m.status === 'skipped'));
                    if (loggedMealsWithDates.length > 0) {
                        const latestMealDate = new Date(Math.max(...loggedMealsWithDates.map(m => new Date(m.updatedAt!).getTime())));
                        const latestMealDateStr = latestMealDate.toLocaleDateString('sv-SE');
                        if (latestMealDateStr !== todayStr) {
                            needsReset = true;
                            prevDayStr = latestMealDateStr;
                        }
                    }
                }

                if (needsReset && prevDayStr) {
                    const meals = activeProfileRaw.loggedMeals || [];
                    const allCompleted = meals.length > 0 && meals.every(m => m.status === 'logged' || m.status === 'skipped');

                    if (allCompleted) {
                        try {
                            const successDays = JSON.parse(localStorage.getItem(successDaysKey) || '[]');
                            if (!successDays.includes(prevDayStr)) {
                                successDays.push(prevDayStr);
                                localStorage.setItem(successDaysKey, JSON.stringify(successDays));
                            }
                        } catch (e) {
                            console.error('Failed to parse success days history', e);
                        }
                    }

                    // Reset meals for new day
                    for (const meal of meals) {
                        if (meal.status !== 'pending') {
                            await resetMealLog(meal.id);
                        }
                    }
                    if (activeProfileRaw.waterIntake > 0) {
                        await resetWater();
                    }
                }

                // Only set the last checked date to today if data is clean or reset has occurred
                if (!needsReset || (activeProfileRaw && activeProfileRaw.loggedMeals && activeProfileRaw.loggedMeals.every(m => m.status === 'pending'))) {
                    localStorage.setItem(lastDateKey, todayStr);
                }
            };

            checkDailyReset();

            const interval = setInterval(checkDailyReset, 30000);
            return () => clearInterval(interval);
        }, [activeProfileId, activeProfileRaw?.loggedMeals, activeProfileRaw?.waterIntake]);

        const ageBracketInfo = getAgeBracketInfo(lifeStage, age);

        return {
            profiles,
            activeProfileId,
            activeProfile,
            switchProfile,
            createNewProfile,
            deleteProfile,
            updateProfile,
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
            loggedMeals: activeProfile?.loggedMeals || [],
            waterIntake: activeProfile?.waterIntake || 0,
            hasNoUserProfile,
            displayName,
            setDisplayName,
        };
    };

export interface FeedingGuideDetails {
    condition: string;
    dailySpoons: string;
    portionPerMeal: string;
    frequency: string;
    dailyCalories: number;
}

export const getFelineFeedingGuideDetails = (
    lifeStage: 'kitten' | 'adult' | 'senior',
    weightInKg: number,
    foodPreference: 'dry' | 'wet' | 'mixed'
): FeedingGuideDetails => {
    let condition = 'Average / Ideal';
    let dailySpoons = '';
    let portionPerMeal = '';
    let frequency = '';
    let dailyCalories = 0;

    if (lifeStage === 'kitten') {
        frequency = '4 Meals Per Day';
        if (weightInKg < 1.0) {
            condition = 'Lightweight / Small';
            if (foodPreference === 'wet') {
                dailySpoons = '7 wet spoons';
                portionPerMeal = '1.75 spoons wet';
                dailyCalories = 7 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '4 dry spoons';
                portionPerMeal = '1.00 spoon dry';
                dailyCalories = 4 * 25;
            } else {
                dailySpoons = '3 wet + 2 dry spoons';
                portionPerMeal = '0.75 spoon wet + 0.50 spoon dry';
                dailyCalories = (3 * 15) + (2 * 25);
            }
        } else if (weightInKg <= 3.0) {
            condition = 'Average / Ideal';
            if (foodPreference === 'wet') {
                dailySpoons = '15 wet spoons';
                portionPerMeal = '3.75 spoons wet';
                dailyCalories = 15 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '9 dry spoons';
                portionPerMeal = '2.25 spoons dry';
                dailyCalories = 9 * 25;
            } else {
                dailySpoons = '6 wet + 5 dry spoons';
                portionPerMeal = '1.50 spoons wet + 1.25 spoons dry';
                dailyCalories = (6 * 15) + (5 * 25);
            }
        } else {
            condition = 'Overweight / Large';
            if (foodPreference === 'wet') {
                dailySpoons = '23 wet spoons';
                portionPerMeal = '5.75 spoons wet';
                dailyCalories = 23 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '14 dry spoons';
                portionPerMeal = '3.50 spoons dry';
                dailyCalories = 14 * 25;
            } else {
                dailySpoons = '8 wet + 9 dry spoons';
                portionPerMeal = '2.00 spoons wet + 2.25 spoons dry';
                dailyCalories = (8 * 15) + (9 * 25);
            }
        }
    } else if (lifeStage === 'adult') {
        frequency = '2 Meals Per Day';
        if (weightInKg < 3.5) {
            condition = 'Lightweight / Thin';
            if (foodPreference === 'wet') {
                dailySpoons = '12 wet spoons';
                portionPerMeal = '6.00 spoons wet';
                dailyCalories = 12 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '7 dry spoons';
                portionPerMeal = '3.50 spoons dry';
                dailyCalories = 7 * 25;
            } else {
                dailySpoons = '4 wet + 5 dry spoons';
                portionPerMeal = '2.00 spoons wet + 2.50 spoons dry';
                dailyCalories = (4 * 15) + (5 * 25);
            }
        } else if (weightInKg <= 5.0) {
            condition = 'Average / Ideal';
            if (foodPreference === 'wet') {
                dailySpoons = '15 wet spoons';
                portionPerMeal = '7.50 spoons wet';
                dailyCalories = 15 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '9 dry spoons';
                portionPerMeal = '4.50 spoons dry';
                dailyCalories = 9 * 25;
            } else {
                dailySpoons = '4 wet + 7 dry spoons';
                portionPerMeal = '2.00 spoons wet + 3.50 spoons dry';
                dailyCalories = (4 * 15) + (7 * 25);
            }
        } else {
            condition = 'Overweight / Obese';
            if (foodPreference === 'wet') {
                dailySpoons = '11 wet spoons';
                portionPerMeal = '5.50 spoons wet';
                dailyCalories = 11 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '7 dry spoons';
                portionPerMeal = '3.50 spoons dry';
                dailyCalories = 7 * 25;
            } else {
                dailySpoons = '4 wet + 4 dry spoons';
                portionPerMeal = '2.00 spoons wet + 2.00 spoons dry';
                dailyCalories = (4 * 15) + (4 * 25);
            }
        }
    } else { // senior
        frequency = '3 Meals Per Day';
        if (weightInKg < 3.5) {
            condition = 'Lightweight / Thin';
            if (foodPreference === 'wet') {
                dailySpoons = '15 wet spoons';
                portionPerMeal = '5.00 spoons wet';
                dailyCalories = 15 * 15;
            } else if (foodPreference === 'dry') {
                dailySpoons = '9 dry spoons';
                portionPerMeal = '3.00 spoons dry';
                dailyCalories = 9 * 25;
            } else {
                dailySpoons = '6 wet + 6 dry spoons';
                portionPerMeal = '2.00 spoons wet + 2.00 spoons dry';
                dailyCalories = (6 * 15) + (6 * 25);
            }
        } else if (weightInKg <= 5.0) {
            condition = 'Average / Ideal';
            if (foodPreference === 'wet') {
                dailySpoons = '13 wet spoons';
                portionPerMeal = '4.30 spoons wet';
                dailyCalories = Math.round(13 * 15);
            } else if (foodPreference === 'dry') {
                dailySpoons = '8 dry spoons';
                portionPerMeal = '2.60 spoons dry';
                dailyCalories = 8 * 25;
            } else {
                dailySpoons = '4 wet + 6 dry spoons';
                portionPerMeal = '1.30 spoons wet + 2.00 spoons dry';
                dailyCalories = (4 * 15) + (6 * 25);
            }
        } else {
            condition = 'Overweight / Obese';
            if (foodPreference === 'wet') {
                dailySpoons = '11 wet spoons';
                portionPerMeal = '3.60 spoons wet';
                dailyCalories = Math.round(11 * 15);
            } else if (foodPreference === 'dry') {
                dailySpoons = '6 dry spoons';
                portionPerMeal = '2.00 spoons dry';
                dailyCalories = 6 * 25;
            } else {
                dailySpoons = '4 wet + 4 dry spoons';
                portionPerMeal = '1.30 spoons wet + 1.30 spoons dry';
                dailyCalories = (4 * 15) + (4 * 25);
            }
        }
    }

    return { condition, dailySpoons, portionPerMeal, frequency, dailyCalories };
};