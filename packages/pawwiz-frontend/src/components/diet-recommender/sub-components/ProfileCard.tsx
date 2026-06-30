import React from 'react';
import { Cat } from 'lucide-react';

interface ProfileCardProps {
    catName: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult';
    lifeStage: 'kitten' | 'adult';
    age: number;
    onEditProfile: () => void;
    photoUrl?: string | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    catName,
    gender,
    weight,
    isKg,
    foodPreference,
    isSpayedNeutered,
    activeLifeStage,
    lifeStage,
    age,
    onEditProfile,
    photoUrl,
}) => {
    return (
        <div className="p-8 bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col items-center w-full">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cat Profile</h2>
                <button
                    type="button"
                    onClick={onEditProfile}
                    className="text-xs font-black text-[#2ec4b6] hover:text-[#20a396] cursor-pointer active:scale-95 transition-transform"
                >
                    Edit Profile
                </button>
            </div>

            <div className="w-24 h-24 bg-teal-50 border-4 border-[#2ec4b6] rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-[2px_2px_0_0_rgba(15,23,42,1)] text-[#2ec4b6]">
                {photoUrl ? (
                    <img src={photoUrl} alt={catName} className="w-full h-full object-cover" />
                ) : (
                    <Cat size={44} className="stroke-[1.5]" />
                )}
            </div>

            <div className="flex gap-2 mb-6">
                <span className="px-3.5 py-1 bg-white border-2 border-slate-900 rounded-full text-[10px] font-black text-slate-800 uppercase tracking-wider">
                    {catName}
                </span>
                <span className="px-3.5 py-1 bg-[#2ec4b6] border-2 border-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
                    {gender}
                </span>
            </div>

            {/* Profile Stats */}
            <div className="w-full space-y-4 text-left">
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex justify-between items-center shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Life Stage</span>
                        <span className="text-xs font-black text-slate-800 capitalize mt-0.5">{activeLifeStage}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#2ec4b6] uppercase">
                        {age} {lifeStage === 'kitten' ? (age === 1 ? 'month' : 'months') : (age === 1 ? 'year' : 'years')} old
                    </span>
                </div>

                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex justify-between items-center shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Weight</span>
                        <span className="text-xs font-black text-slate-800 mt-0.5">{weight.toFixed(1)} {isKg ? 'kg' : 'lbs'}</span>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex justify-between items-center shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Food Preference</span>
                        <span className="text-xs font-black text-slate-800 mt-0.5 capitalize">{foodPreference === 'dry' ? 'Kibbles' : foodPreference === 'wet' ? 'Wet Food' : 'Mixed'}</span>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex justify-between items-center shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Neutered / Spayed</span>
                        <span className="text-xs font-black text-slate-800 mt-0.5">{isSpayedNeutered ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
