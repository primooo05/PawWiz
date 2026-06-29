import React, { useState, useEffect } from 'react';
import { getAgeBracketInfo } from '../../hooks/useDietRecommender';
import { supabase } from '../../lib/supabase';


interface DietSetupViewProps {
    catName: string;
    setCatName: (name: string) => void;
    gender: 'male' | 'female';
    setGender: (g: 'male' | 'female') => void;
    lifeStage: 'kitten' | 'adult';
    setLifeStage: (stage: 'kitten' | 'adult') => void;
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
}

export const DietSetupView: React.FC<DietSetupViewProps> = ({
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
}) => {
    const ageBracketDetails = getAgeBracketInfo(lifeStage, age);

    const [onboardedCat, setOnboardedCat] = useState<{ name: string; gender: 'male' | 'female'; lifeStage: 'kitten' | 'adult' } | null>(null);
    const [selectedCatId, setSelectedCatId] = useState<string>('onboarding');

    // Fetch user profile from backend on mount to auto-fill onboarding details
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';
                const res = await fetch(`${API_BASE}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.catName) {
                        const gender = data.catSex.toLowerCase() === 'female' ? 'female' : 'male';
                        const lifeStage = data.catLifeStage.toLowerCase() === 'kitten' ? 'kitten' : 'adult';
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
        fetchProfile();
    }, [setCatName, setGender, setLifeStage]);

    // Sync default age value when changing lifeStage
    const handleLifeStageChange = (stage: 'kitten' | 'adult') => {
        setLifeStage(stage);
        if (stage === 'kitten') {
            setAge(3); // default 3 months
        } else {
            setAge(3); // default 3 years
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[6px_6px_0_0_rgba(15,23,42,1)] text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h2 className="text-2xl font-black mb-2 text-slate-900 uppercase tracking-tight">Diet Setup</h2>
            <p className="text-slate-500 mb-6 text-xs font-bold uppercase tracking-wider">
                Establish your cat's profile to calculate portion recommendations.
            </p>

            <form onSubmit={onSubmit} className="flex flex-col gap-6 text-left">
                {/* 0. Cat Selection (Onboarding vs New) */}
                {onboardedCat && (
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
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
                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center ${
                                    selectedCatId === 'onboarding' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
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
                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center ${
                                    selectedCatId === 'new' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Set up a new cat
                            </button>
                        </div>
                    </div>
                )}
                {/* 1. Cat Name Input */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        Cat's Name
                    </label>
                    <input
                        type="text"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="Aki"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                    />
                </div>

                {/* 2. Gender Selection */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        Gender
                    </label>
                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit">
                        <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${gender === 'male' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${gender === 'female' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Female
                        </button>
                    </div>
                </div>

                {/* 3. Weight Slider with unit toggler */}
                <div className="space-y-3">
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

                {/* 4. Life Stage Selection */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        Life Stage
                    </label>
                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit">
                        <button
                            type="button"
                            onClick={() => handleLifeStageChange('kitten')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${lifeStage === 'kitten' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Kitten
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLifeStageChange('adult')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${lifeStage === 'adult' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Adult
                        </button>
                    </div>
                </div>

                {/* 5. Age Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Age:</span>
                        <span className="font-extrabold text-[#2ec4b6] uppercase">
                            {age} {lifeStage === 'kitten' ? (age === 1 ? 'month' : 'months') : (age === 1 ? 'year' : 'years')}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max={lifeStage === 'kitten' ? "12" : "20"}
                        step="1"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2ec4b6]"
                    />
                </div>

                {/* Age Bracket Preview */}
                <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl animate-fadeIn">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Feeding Guide Preview</span>
                    <p className="text-sm font-black text-teal-900 mt-1">{ageBracketDetails.bracket}</p>
                    <p className="text-[10px] text-teal-700 font-medium mt-1 leading-relaxed">
                        {ageBracketDetails.recommendedFood} — {ageBracketDetails.frequency}
                    </p>
                </div>

                {/* 6. Food Preference */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
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
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
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
                    className="mt-4 w-full py-4 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl font-bold shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-teal-600 transition-all cursor-pointer"
                >
                    Get Recommendations
                </button>
            </form>
        </div>
    );
};

export default DietSetupView;
