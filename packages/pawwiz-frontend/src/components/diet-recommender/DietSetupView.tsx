import React, { useState, useEffect } from 'react';
import { getAgeBracketInfo } from '../../hooks/useDietRecommender';
import type { CatProfile } from '../../hooks/useDietRecommender';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';
import AnimatedAvatarGroup from '../smoothui/animated-avatar-group';
import { useNavigate } from 'react-router-dom';

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
    foodPreference: 'dry' | 'wet' | 'mixed';
    setFoodPreference: (pref: 'dry' | 'wet' | 'mixed') => void;
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

export const DietSetupView: React.FC<DietSetupViewProps> = (props) => {
    return <DietSetupContent {...props} />;
};

export const DietSetupModal: React.FC<DietSetupModalProps> = ({ isOpen, onClose, ...props }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    {/* Close button */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    
                    <DietSetupContent {...props} />
                </div>
            </div>
        </div>
    );
};

const DietSetupContent: React.FC<DietSetupViewProps> = ({
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
}) => {
    const navigate = useNavigate();
    const ageBracketDetails = getAgeBracketInfo(lifeStage, age);

    const [onboardedCat, setOnboardedCat] = useState<{ name: string; gender: 'male' | 'female'; lifeStage: 'kitten' | 'adult' | 'senior' } | null>(null);
    const [selectedCatId, setSelectedCatId] = useState<string>('onboarding');
    const [isEditingName, setIsEditingName] = useState<boolean>(false);

    // Fetch user profile from backend on mount to auto-fill onboarding details
    useEffect(() => {
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
                        // Prefill the form states
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

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (active && session) {
                fetchProfile(session);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active && session) {
                fetchProfile(session);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [setCatName, setGender, setLifeStage]);

    // Sync default age value when changing lifeStage
    const handleLifeStageChange = (stage: 'kitten' | 'adult' | 'senior') => {
        setLifeStage(stage);
        if (stage === 'kitten') {
            setAge(3); // default 3 months
        } else if (stage === 'senior') {
            setAge(10); // default 10 years
        } else {
            setAge(3); // default 3 years
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[6px_6px_0_0_rgba(15,23,42,1)] text-center">
            <div className="text-4xl mb-4"></div>
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
                                onClick={() => {
                                    setSelectedCatId('new');
                                    setCatName('');
                                    setGender('male');
                                    setLifeStage('adult');
                                }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center ${selectedCatId === 'new' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Set up a new cat
                            </button>
                        </div>
                    </div>
                )}
                {/* 1. Cat Name Input */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Cat's Name
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            placeholder="Aki"
                            required
                            disabled={!isEditingName}
                            className={`w-full pr-12 px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-300 disabled:cursor-not-allowed`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsEditingName(!isEditingName)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                            style={{ color: '#2ec4b6' }}
                            title="Edit Name"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 2. Gender Selection */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Gender
                    </label>
                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit opacity-60 cursor-not-allowed" title="Gender is set via cat profile and cannot be changed here">
                        <button
                            type="button"
                            disabled
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${gender === 'male' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            disabled
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${gender === 'female' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            Female
                        </button>
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
                    
                    {/* Weight Assessment Preview */}
                    <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl animate-fadeIn mt-3">
                        <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Weight Assessment Preview</span>
                        <p className="text-sm font-black text-teal-900 mt-1">
                            {lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1)}: {(() => {
                                const weightInKg = isKg ? weight : weight * 0.45359237;
                                if (lifeStage === 'kitten') {
                                    if (weightInKg < 1.0) return 'Lightweight / Small';
                                    if (weightInKg <= 3.0) return 'Average / Ideal';
                                    return 'Overweight / Large';
                                } else {
                                    if (weightInKg < 3.5) return 'Lightweight / Thin';
                                    if (weightInKg <= 5.0) return 'Average / Ideal';
                                    return 'Overweight / Obese';
                                }
                            })()}
                        </p>
                        <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                            {(() => {
                                const weightInKg = isKg ? weight : weight * 0.45359237;
                                if (lifeStage === 'kitten') {
                                    if (weightInKg < 1.0) return 'Under 1.0 kg (2.2 lbs) — Often under 2 months old; never restrict calories.';
                                    if (weightInKg <= 3.0) return '1.0 – 3.0 kg (2.2 – 6.6 lbs) — Standard growing kitten range.';
                                    return 'Over 3.0 kg (6.6 lbs) — Large breed (e.g., Maine Coon) or older kitten.';
                                } else if (lifeStage === 'adult') {
                                    if (weightInKg < 3.5) return 'Under 3.5 kg (7.7 lbs) — Ribs easily felt; needs a slight calorie increase.';
                                    if (weightInKg <= 5.0) return '3.5 – 5.0 kg (7.7 – 11.0 lbs) — Well-proportioned; visible waist behind the ribs.';
                                    return 'Over 5.0 kg (11.0 lbs) — No visible waist; fat pad on belly covers ribs.';
                                } else {
                                    if (weightInKg < 3.5) return 'Under 3.5 kg (7.7 lbs) — High risk for muscle wasting; needs calorie boost.';
                                    if (weightInKg <= 5.0) return '3.5 – 5.0 kg (7.7 – 11.0 lbs) — Well-proportioned; visible waist behind the ribs.';
                                    return 'Over 5.0 kg (11.0 lbs) — No visible waist; fat pad on belly covers ribs.';
                                }
                            })()}
                        </p>
                    </div>
                </div>                 {/* 4. Life Stage Selection */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Life Stage
                    </label>
                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit opacity-60 cursor-not-allowed" title="Life stage is set via cat profile and cannot be changed here">
                        <button
                            type="button"
                            disabled
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${lifeStage === 'kitten' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            Kitten
                        </button>
                        <button
                            type="button"
                            disabled
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${lifeStage === 'adult' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            Adult
                        </button>
                        <button
                            type="button"
                            disabled
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${lifeStage === 'senior' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            Senior
                        </button>
                    </div>
                </div>

                {/* 5. Age Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Age:</span>
                        <span className="font-extrabold text-[#2ec4b6] uppercase">
                            {age} {lifeStage === 'kitten' ? (age === 1 ? 'month' : 'months') : (age === 1 ? 'year' : 'years')}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={lifeStage === 'senior' ? "7" : "1"}
                        max={lifeStage === 'kitten' ? "12" : (lifeStage === 'adult' ? "6" : "20")}
                        step="1"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                    />
                </div>

                {/* Age Bracket Preview */}
                <div className="col-span-1 md:col-span-2 p-4 bg-teal-50/70 border border-teal-100 rounded-2xl animate-fadeIn">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Feeding Guide Preview</span>
                    <p className="text-sm font-black text-teal-900 mt-1">{ageBracketDetails.bracket}</p>
                    <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                        {ageBracketDetails.recommendedFood} — {ageBracketDetails.frequency}
                    </p>
                </div>

                {/* 6. Food Preference */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        Food Type Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['dry', 'wet', 'mixed'] as const).map((pref) => (
                            <button
                                key={pref}
                                type="button"
                                onClick={() => setFoodPreference(pref)}
                                className={`py-3 rounded-xl border-2 font-bold text-xs capitalize transition-all cursor-pointer ${foodPreference === pref
                                    ? 'bg-[#EEF9F8] border-teal-400 text-teal-800 shadow-[1px_1px_0_0_rgba(15,23,42,1)]'
                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                                    }`}
                            >
                                {pref}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 7. Spayed/Neutered */}
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
