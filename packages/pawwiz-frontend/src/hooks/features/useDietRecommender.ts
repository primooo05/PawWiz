import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import { calculateKcal, getFood, type FoodType, type MealUnit } from '../../lib/foods';

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
    catId?: string | null;
    name: string;
    gender: 'male' | 'female';
    lifeStage: 'kitten' | 'adult' | 'senior';
    age: number; // months for kitten, years for adult/senior
    weight: number;
    isKg: boolean;
    foodPreference: FoodType;
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
 * Legacy calorie helper — now delegates to the shared food catalog's
 * calculateKcal() so the full FoodType catalog (chicken, fish, custom, etc.)
 * and all MealUnits (spoon/cup/gram) are supported, not just dry/wet/mixed.
 */
export const calculateMealCalories = (
    foodType: FoodType | string,
    amount: number,
    unit?: MealUnit
): number => {
    const knownFood = (Object.prototype.hasOwnProperty.call({
        dry: 1, wet: 1, mixed: 1, chicken: 1, chicken_thigh: 1, fish: 1, egg: 1, other: 1,
    }, foodType) ? foodType : 'other') as FoodType;
    return calculateKcal(knownFood, amount, unit ?? 'spoon');
};

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

    useEffect(() => {
        const handleSync = () => {
            const stored = localStorage.getItem('diet_profiles');
            if (stored) {
                try {
                    setProfiles(JSON.parse(stored));
                } catch (e) {}
            }
            const activeId = localStorage.getItem('diet_active_profile_id');
            if (activeId) {
                setActiveProfileId(activeId);
            }
        };
        window.addEventListener('diet-profile-sync', handleSync);
        return () => window.removeEventListener('diet-profile-sync', handleSync);
    }, []);

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
    const [foodPreference, setFoodPreference] = useState<FoodType>(activeProfile?.foodPreference || 'mixed');
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

        // Listen for auth changes — skip INITIAL_SESSION since getSession() above
        // already handles the first load. Without this guard, both fire on page
        // load and trigger a duplicate set of backend requests.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (active && event !== 'INITIAL_SESSION') {
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
        window.dispatchEvent(new Event('diet-profile-sync'));
    };

    const switchProfile = (id: string) => {
        const nextProfile = profiles.find(p => p.id === id);
        if (!nextProfile) return;
        setActiveProfileId(id);
        localStorage.setItem('diet_active_profile_id', id);
        syncStatesToSetup(nextProfile);
        window.dispatchEvent(new Event('diet-profile-sync'));
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
            // No optimistic update here — setProfiles (via the server response) is
            // the source of truth for isTracking. Premature setIsTracking(true) caused
            // state drift when the request failed (banner stayed gone but profile
            // still had isTracking: false in the profiles array).
            try {
                const profileData = {
                    name: catName,
                    // Normalize to lowercase defensively — guards against any
                    // capitalized values that may have slipped in from the Profile table.
                    gender: (gender || 'male').toLowerCase() as 'male' | 'female',
                    lifeStage: (lifeStage || 'adult').toLowerCase() as 'kitten' | 'adult' | 'senior',
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
                            catSex: profileData.gender,
                            catLifeStage: profileData.lifeStage === 'kitten' ? 'kitten' : 'adult',
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
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(JSON.stringify(err));
                    }
                    const newProf = await res.json();
                    setProfiles([newProf]);
                    setActiveProfileId(newProf.id);
                    localStorage.setItem('diet_active_profile_id', newProf.id);
                    saveProfilesToStorage([newProf]);
                    syncStatesToSetup(newProf);
                } else {
                    // Profile exists, update it via PUT
                    const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(profileData),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(JSON.stringify(err));
                    }
                    const updatedProf = await res.json();
                    setProfiles(prev => {
                        const updatedProfiles = prev.map(p => p.id === activeProfileId ? updatedProf : p);
                        saveProfilesToStorage(updatedProfiles);
                        return updatedProfiles;
                    });
                    syncStatesToSetup(updatedProf);
                }
            } catch (e) {
                console.error('[handleStartDietTracking] Failed:', e);
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
            kcalOverride?: number,
            mealNameOverride?: string
        ) => {
            // Prefer the caller-supplied kcal (the modal already computed it,
            // including custom foods priced from their label). Fall back to the
            // catalog calculation for legacy call sites.
            const kcal = kcalOverride ?? calculateMealCalories(foodType, amount, unit);

            // Optimistic UI update
            setProfiles(prevProfiles => prevProfiles.map(p => {
                if (p.id === activeProfileId) {
                    const updatedMeals = p.loggedMeals.map(m => {
                        if (m.id === mealId) {
                            return {
                                ...m,
                                mealName: mealNameOverride ?? m.mealName,
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
                        ...(mealNameOverride ? { mealName: mealNameOverride } : {}),
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

        /**
         * Log a meal under a custom period name (e.g. "Midnight Snack") that
         * isn't one of the 3 standard Breakfast/Lunch/Dinner slots. Creates a
         * brand-new meal log row via POST rather than updating a fixed 1/2/3 id.
         */
        const addCustomMeal = async (
            mealName: string,
            foodType: string,
            amount: number,
            unit: MealUnit,
            timestamp?: string,
            kcalOverride?: number
        ) => {
            const kcal = kcalOverride ?? calculateMealCalories(foodType as FoodType, amount, unit);

            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE}/api/diet/profiles/${activeProfileId}/meals`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        mealName,
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
                    const allCompleted = meals.length > 0 && meals.some(m => m.status === 'logged');

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
            addCustomMeal,
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

// MER activity multipliers — veterinary standard (NRC / AAFCO guidelines)
const MER_FACTORS: Record<'kitten' | 'adult_neutered' | 'adult_intact' | 'senior_healthy' | 'senior_underweight', number> = {
    kitten:            2.5,
    adult_neutered:    1.2,
    adult_intact:      1.4,
    senior_healthy:    1.1,
    senior_underweight: 1.4,
};

/** Format a spoon count to nearest 0.25 with a unit suffix, e.g. "3.75 spoons". */
const fmtSpoons = (n: number, label: string): string => {
    const snapped = Math.round(n / 0.25) * 0.25;
    return `${snapped} ${label}`;
};

export const getFelineFeedingGuideDetails = (
    lifeStage: 'kitten' | 'adult' | 'senior',
    weightInKg: number,
    foodPreference: FoodType
): FeedingGuideDetails => {
    // ── RER / MER ─────────────────────────────────────────────────────────────
    const rer = 70 * Math.pow(weightInKg, 0.75);

    let merFactor: number;
    let frequency: string;
    let mealsPerDay: number;

    if (lifeStage === 'kitten') {
        merFactor    = MER_FACTORS.kitten;
        frequency    = '4 Meals Per Day';
        mealsPerDay  = 4;
    } else if (lifeStage === 'adult') {
        merFactor    = MER_FACTORS.adult_neutered; // caller can't pass isSpayedNeutered here;
        frequency    = '2 Meals Per Day';          // default to neutered (safer/lower bound).
        mealsPerDay  = 2;
    } else {
        // senior — use underweight factor when cat is below healthy floor (< 3.5 kg)
        merFactor    = weightInKg < 3.5 ? MER_FACTORS.senior_underweight : MER_FACTORS.senior_healthy;
        frequency    = '3 Meals Per Day';
        mealsPerDay  = 3;
    }

    const dailyCalories = Math.round(rer * merFactor);

    // ── Weight condition ───────────────────────────────────────────────────────
    let condition: string;
    if (lifeStage === 'kitten') {
        condition = weightInKg < 1.0 ? 'Lightweight / Small'
                  : weightInKg <= 3.0 ? 'Average / Ideal'
                  : 'Overweight / Large';
    } else {
        condition = weightInKg < 3.5 ? 'Lightweight / Thin'
                  : weightInKg <= 5.0 ? 'Average / Ideal'
                  : 'Overweight / Obese';
    }

    // ── Portion resolution from food catalog ──────────────────────────────────
    const food = getFood(foodPreference);
    const gramsPerDay     = dailyCalories / food.kcalPerGram;
    const gramsPerMeal    = gramsPerDay / mealsPerDay;

    // Spoon-based foods: dry, wet, mixed. Gram-display for whole-food catalog entries.
    const spoonsPerDay    = gramsPerDay  / food.gramsPerSpoon;
    const spoonsPerMeal   = gramsPerMeal / food.gramsPerSpoon;

    const isGramFood = !['dry', 'wet', 'mixed'].includes(foodPreference);

    const dailySpoons   = isGramFood
        ? `~${Math.round(gramsPerDay)} g/day (${food.label})`
        : fmtSpoons(spoonsPerDay, `${foodPreference} spoons`);

    const portionPerMeal = isGramFood
        ? `~${Math.round(gramsPerMeal)} g per meal`
        : fmtSpoons(spoonsPerMeal, `spoons ${foodPreference}`);

    return { condition, dailySpoons, portionPerMeal, frequency, dailyCalories };
};