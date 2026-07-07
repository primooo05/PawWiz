import React, { useState, useEffect } from 'react';
import { getAgeBracketInfo } from '../../../hooks/features/useDietRecommender';
import type { CatProfile } from '../../../hooks/features/useDietRecommender';
import type { FoodType } from '../../../lib/foods';
import { supabase } from '../../../lib/supabase';
import { API_BASE } from '../../../lib/config.js';
import AnimatedAvatarGroup from '../../ui/smoothui/animated-avatar-group';
import { useNavigate } from 'react-router-dom';
import { Baby, Cat, Crown } from 'lucide-react';

// Age bounds per life stage — defined at module scope so they're never
// undefined during component render regardless of prop timing.
// Units: months for kitten, years for adult/senior.
const AGE_BOUNDS = {
    kitten: { min: 1, max: 12 },
    adult:  { min: 1, max: 6 },
    senior: { min: 7, max: 25 },
} as const;

interface DietSetupViewProps {
    catName: string;
    setCatName: (name: string) => void;
    gender: 'male' | 'female';
    setGender: (g: 'male' | 'female') => void;
    lifeStage: 'kitten' | 'adult' | 'senior';
    setLifeStage: (stage: 'kitten' | 'adult' | 'senior') => void;
    age: number;
    setAge: (age: number) => void;
    weight: number;
    setWeight: (w: number) => void;
    isKg: boolean;
    toggleUnit: (toKg: boolean) => void;
    foodPreference: FoodType;
    setFoodPreference: (pref: FoodType) => void;
    isSpayedNeutered: boolean;
    setIsSpayedNeutered: (val: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;

    profiles: CatProfile[];
    activeProfileId: string;
    switchProfile: (id: string) => void;

    hasNoUserProfile: boolean;
    displayName: string;
    setDisplayName: (name: string) => void;
    isLoading?: boolean;
}

interface DietSetupModalProps extends DietSetupViewProps {
    isOpen?: boolean;
    onClose?: () => void;
}

interface DietSetupContentProps extends DietSetupViewProps {
    onClose?: () => void;
}

export const DietSetupView: React.FC<DietSetupViewProps> = (props) => {
    return <DietSetupContent {...props} />;
};

export const DietSetupModal: React.FC<DietSetupModalProps> = ({ isOpen, onClose, ...props }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content: constant width, capped to viewport to avoid horizontal scroll.
                pb-24 ensures the submit button clears the fixed BottomNav on small screens. */}
            <div className="relative w-[640px] max-w-[calc(100vw-2rem)] max-h-[92vh] overflow-y-auto overflow-x-hidden pb-24 sm:pb-0">
                <DietSetupContent {...props} onClose={onClose} />
            </div>
        </div>
    );
};

const DietSetupContent: React.FC<DietSetupContentProps> = ({
    catName,
    setCatName,
    setGender,
    lifeStage,
    setLifeStage,
    age,
    setAge,
    weight,
    setWeight,
    isKg,
    toggleUnit,
    foodPreference,
    setFoodPreference,
    isSpayedNeutered,
    setIsSpayedNeutered,
    onSubmit,

    profiles,
    activeProfileId,
    switchProfile,

    hasNoUserProfile,
    displayName,
    setDisplayName,
    isLoading = false,
    onClose,
}) => {
    const navigate = useNavigate();
    const ageBracketDetails = getAgeBracketInfo(lifeStage, age);

    const [onboardedCat, setOnboardedCat] = useState<{ name: string; gender: 'male' | 'female'; lifeStage: 'kitten' | 'adult' | 'senior' } | null>(null);
    const [selectedCatId, setSelectedCatId] = useState<string>('onboarding');

    // Clamp age into the valid range whenever life stage changes
    useEffect(() => {
        const bounds = AGE_BOUNDS[lifeStage as keyof typeof AGE_BOUNDS] ?? AGE_BOUNDS.adult;
        if (age < bounds.min) setAge(bounds.min);
        else if (age > bounds.max) setAge(bounds.max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lifeStage]);

    // Fetch onboarding profile details to auto-fill ONLY when there are no
    // real diet profiles yet (hasNoUserProfile path). When real profiles exist,
    // catName/gender/lifeStage are already synced from the active profile by
    // the hook — running this fetch would overwrite the selected cat's data.
    useEffect(() => {
        if (!hasNoUserProfile) return;

        let active = true;

        const fetchProfile = async (session: any) => {
            if (!session) return;
            try {
                const res = await fetch(`${API_BASE}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` },
                });
                if (res.ok && active) {
                    const data = await res.json();
                    if (data && data.catName) {
                        const gender = data.catSex.toLowerCase() === 'female' ? 'female' : 'male';
                        const lifeStageVal = data.catLifeStage.toLowerCase();
                        const lifeStage = lifeStageVal === 'senior' ? 'senior' : (lifeStageVal === 'kitten' ? 'kitten' : 'adult');
                        setOnboardedCat({
                            name: data.catName,
                            gender,
                            lifeStage,
                        });
                        setCatName(data.catName);
                        setGender(gender);
                        setLifeStage(lifeStage);
                        setSelectedCatId('onboarding');
                    }
                }
            } catch (e) {
                console.error('Failed to fetch onboarding profile details', e);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (active && session) fetchProfile(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active && session) fetchProfile(session);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasNoUserProfile]);

    const weightInKg = isKg ? weight : weight * 0.45359237;

    const getWeightVerdict = (): string => {
        if (lifeStage === 'kitten') {
            if (weightInKg < 1.0) return 'Lightweight / Small';
            if (weightInKg <= 3.0) return 'Average / Ideal';
            return 'Overweight / Large';
        }
        if (weightInKg < 3.5) return 'Lightweight / Thin';
        if (weightInKg <= 5.0) return 'Average / Ideal';
        return 'Overweight / Obese';
    };

    const getWeightNote = (): string => {
        if (lifeStage === 'kitten') {
            if (weightInKg < 1.0) return 'Under 1.0 kg (2.2 lbs) — Often under 2 months old; never restrict calories.';
            if (weightInKg <= 3.0) return '1.0 – 3.0 kg (2.2 – 6.6 lbs) — Standard growing kitten range.';
            return 'Over 3.0 kg (6.6 lbs) — Large breed (e.g., Maine Coon) or older kitten.';
        }
        if (lifeStage === 'adult') {
            if (weightInKg < 3.5) return 'Under 3.5 kg (7.7 lbs) — Ribs easily felt; needs a slight calorie increase.';
            if (weightInKg <= 5.0) return '3.5 – 5.0 kg (7.7 – 11.0 lbs) — Well-proportioned; visible waist behind the ribs.';
            return 'Over 5.0 kg (11.0 lbs) — No visible waist; fat pad on belly covers ribs.';
        }
        if (weightInKg < 3.5) return 'Under 3.5 kg (7.7 lbs) — High risk for muscle wasting; needs calorie boost.';
        if (weightInKg <= 5.0) return '3.5 – 5.0 kg (7.7 – 11.0 lbs) — Well-proportioned; visible waist behind the ribs.';
        return 'Over 5.0 kg (11.0 lbs) — No visible waist; fat pad on belly covers ribs.';
    };

    const lifeStageLabel = lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1);
    const LifeStageIcon = lifeStage === 'kitten' ? Baby : lifeStage === 'senior' ? Crown : Cat;
    // Safe bounds lookup — falls back to 'adult' if lifeStage is ever an unexpected value
    const ageBounds = AGE_BOUNDS[lifeStage as keyof typeof AGE_BOUNDS] ?? AGE_BOUNDS.adult;

    return (
        <div className={`relative p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[6px_6px_0_0_rgba(15,23,42,1)] text-center ${onClose ? 'w-full' : 'max-w-2xl mx-auto mt-8'}`}>
            {/* Close button (inside the card) */}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            <h2 className="text-2xl font-black mb-2 text-slate-900 uppercase tracking-tight">Diet Setup</h2>
            <p className="text-slate-500 mb-6 text-xs font-bold uppercase tracking-wider">
                Establish your cat's profile to calculate portion recommendations.
            </p>

            {profiles.length > 0 && (
                <div className="flex justify-center mb-8">
                    <AnimatedAvatarGroup
                        avatars={profiles.map(p => ({
                            id: p.id,
                            name: p.name,
                            src: p.photoUrl,
                            alt: p.name,
                            isActive: p.id === activeProfileId,
                            isNew: !p.isTracking
                        }))}
                        onAvatarClick={(id) => switchProfile(id)}
                        onAddClick={() => navigate('/settings')}
                    />
                </div>
            )}

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-left">
                {hasNoUserProfile && (
                    <div className="col-span-1 md:col-span-2 p-5 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-left text-amber-900 shadow-sm animate-fadeIn">
                        <p className="text-xs font-black uppercase tracking-wider mb-1 text-amber-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> No Profile Found
                        </p>
                        <p className="text-[11px] leading-relaxed font-semibold text-amber-700">
                            Your account doesn't have a profile yet. Fill out the details below to create your quick profile and start diet tracking immediately, or jump to onboarding.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/onboarding', { state: { redirectTo: '/diet-recommender' } })}
                            className="mt-2 text-xs font-extrabold text-[#2ec4b6] underline hover:text-[#28b2a5] cursor-pointer block"
                        >
                            Complete Full Onboarding →
                        </button>
                    </div>
                )}

                {hasNoUserProfile && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                            Your Name (Display Name)
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                        />
                    </div>
                )}

                {onboardedCat && profiles.length <= 1 && (selectedCatId === 'new' || catName === onboardedCat.name) && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                            Select Cat to Set Up First
                        </label>
                        <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-full justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCatId('onboarding');
                                    setCatName(onboardedCat.name);
                                    setGender(onboardedCat.gender);
                                    setLifeStage(onboardedCat.lifeStage);
                                }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center ${selectedCatId === 'onboarding' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {onboardedCat.name} (Onboarding)
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/settings', { state: { openAddCat: true } })}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center text-slate-500 hover:text-slate-800"
                            >
                                Set up a new cat
                            </button>
                        </div>
                    </div>
                )}

                {/* 1. Cat's Name — fixed, read-only. Cat identity is managed via the
                    "Edit Profile" action in Settings, not here. */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Cat's Name
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                        <span className="font-black text-sm text-slate-700 truncate">{catName || '—'}</span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wide">From cat profile</span>
                    </div>
                </div>

                {/* 2. Life Stage — read-only display (sourced from the cat profile) */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Life Stage
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#2ec4b6] text-white rounded-lg">
                            <LifeStageIcon className="w-4 h-4" strokeWidth={2.75} />
                        </span>
                        <span className="font-black text-sm text-slate-700 capitalize">{lifeStageLabel}</span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wide">From cat profile</span>
                    </div>
                </div>

                {/* 3. Weight Slider with unit toggler */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Weight:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#2ec4b6]">
                                {isKg
                                    ? (weight >= 13 ? "13.0+ kg" : `${weight.toFixed(1)} kg`)
                                    : (weight >= 28.6 ? "28.6+ lbs" : `${weight.toFixed(1)} lbs`)
                                }
                            </span>
                            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/50">
                                <button
                                    type="button"
                                    onClick={() => toggleUnit(true)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${isKg ? 'bg-[#2ec4b6] text-white' : 'text-slate-500'}`}
                                >
                                    KG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleUnit(false)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${!isKg ? 'bg-[#2ec4b6] text-white' : 'text-slate-500'}`}
                                >
                                    LBS
                                </button>
                            </div>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={isKg ? "1" : "2.2"}
                        max={isKg ? "13" : "28.6"}
                        step={isKg ? "0.1" : "0.2"}
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                    />
                </div>

                {/* 4. Age Slider — range is constrained to the selected life stage */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Age:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#2ec4b6] uppercase">
                                {age} {lifeStage === 'kitten' ? (age === 1 ? 'month' : 'months') : (age === 1 ? 'year' : 'years')}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                                ({ageBounds.min}–{ageBounds.max} {lifeStage === 'kitten' ? 'mo' : 'yrs'})
                            </span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={ageBounds.min}
                        max={ageBounds.max}
                        step="1"
                        value={Math.min(ageBounds.max, Math.max(ageBounds.min, age || ageBounds.min))}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                    />
                </div>

                {/* Preview row: Weight Assessment (left) + Feeding Guide (right) */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weight Assessment Preview */}
                    <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl animate-fadeIn">
                        <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Weight Assessment Preview</span>
                        <p className="text-sm font-black text-teal-900 mt-1">
                            {lifeStageLabel}: {getWeightVerdict()}
                        </p>
                        <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                            {getWeightNote()}
                        </p>
                    </div>

                    {/* Feeding Guide Preview */}
                    <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl animate-fadeIn">
                        <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Feeding Guide Preview</span>
                        <p className="text-sm font-black text-teal-900 mt-1">{ageBracketDetails.bracket}</p>
                        <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                            {ageBracketDetails.recommendedFood} — {ageBracketDetails.frequency}
                        </p>
                    </div>
                </div>

                {/* 5. Food Preference */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Food Type Preference
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {([
                            { id: 'dry',           label: 'Dry Kibble' },
                            { id: 'wet',           label: 'Wet Food' },
                            { id: 'mixed',         label: 'Mixed' },
                            { id: 'chicken',       label: 'Chicken Breast' },
                            { id: 'chicken_thigh', label: 'Chicken Thigh' },
                            { id: 'fish',          label: 'Fish / Salmon' },
                            { id: 'egg',           label: 'Cooked Egg' },
                            { id: 'other',         label: 'Other / Custom' },
                        ] as const).map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setFoodPreference(id)}
                                className={`py-3 px-2 rounded-xl border-2 font-bold text-xs text-center transition-all cursor-pointer ${foodPreference === id
                                    ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 6. Spayed/Neutered */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Spayed or Neutered?
                    </label>
                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit">
                        <button
                            type="button"
                            onClick={() => setIsSpayedNeutered(true)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${isSpayedNeutered ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSpayedNeutered(false)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${!isSpayedNeutered ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            No
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="col-span-1 md:col-span-2 mt-4 w-full py-4 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl font-bold shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-teal-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Setting up...' : 'Get Recommendations'}
                </button>
            </form>
        </div>
    );
};

export default DietSetupView;
