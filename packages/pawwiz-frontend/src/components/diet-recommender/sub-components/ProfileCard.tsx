import React, { useEffect, useRef, useState } from 'react';
import { Cat, Download, Loader2 } from 'lucide-react';
import pawWizLogo from '../../../assets/PawWiz_Logo.png';

interface ProfileCardProps {
    catName: string;
    displayName?: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: 'dry' | 'wet' | 'mixed';
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult' | 'senior';
    lifeStage: 'kitten' | 'adult' | 'senior';
    age: number;
    onEditProfile: () => void;
    photoUrl?: string | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    catName,
    displayName,
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
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(false);
    const [isPhotoLoading, setIsPhotoLoading] = useState(!!photoUrl);
    const [hasPhotoError, setHasPhotoError] = useState(false);

    // Reset loading/error state whenever the photo URL changes (e.g. switching cats,
    // or a fresh signed URL coming back from Supabase Storage after an upload).
    useEffect(() => {
        setIsPhotoLoading(!!photoUrl);
        setHasPhotoError(false);
    }, [photoUrl]);

    const ageLabel = `${age} ${lifeStage === 'kitten' ? (age === 1 ? 'MO' : 'MOS') : (age === 1 ? 'YR' : 'YRS')}`;
    const foodLabel = foodPreference === 'dry' ? 'KIBBLES' : foodPreference === 'wet' ? 'WET FOOD' : 'MIXED';

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        setDownloadError(false);
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#F7F1E1',
            });
            const link = document.createElement('a');
            link.download = `${catName || 'cat'}-profile-card.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate profile card image', err);
            setDownloadError(true);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full flex flex-col">
            {/* Action bar — excluded from the downloaded image */}
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cat Profile</h2>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onEditProfile}
                        className="text-xs font-black text-[#30c290] hover:text-[#20a396] cursor-pointer active:scale-95 transition-transform"
                    >
                        Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        aria-label="Download cat profile card as PNG"
                        className="flex items-center gap-1.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-700 px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(48,194,144,1)] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Download size={13} />
                        )}
                        {isDownloading ? 'Saving…' : 'Download'}
                    </button>
                </div>
            </div>

            {downloadError && (
                <p className="text-[11px] font-bold text-red-500 mb-2 -mt-1">
                    Couldn't generate the image. Please try again.
                </p>
            )}

            {/* Capture zone — ID-card style, exported as PNG */}
            <div
                ref={cardRef}
                className="relative w-full bg-[#F7F1E1] border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-5 overflow-hidden"
            >
                {/* faint background pattern for texture */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(45deg, #0f172a 0, #0f172a 1px, transparent 1px, transparent 14px)',
                    }}
                />

                {/* Header bar */}
                <div className="relative flex items-baseline justify-between pb-2 mb-3 border-b-2 border-[#30c290]">
                    <span className="text-lg font-black text-[#30c290] uppercase tracking-wide">PawWiz</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest underline">
                        Pet License
                    </span>
                </div>

                {/* Main content: photo + details */}
                <div className="relative flex gap-4">
                    {/* Photo box */}
                    <div className="relative w-24 h-28 sm:w-28 sm:h-32 flex-shrink-0 bg-[#30c290] border-2 border-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                        {photoUrl && !hasPhotoError ? (
                            <>
                                <img
                                    src={photoUrl}
                                    alt={catName}
                                    crossOrigin="anonymous"
                                    onLoad={() => setIsPhotoLoading(false)}
                                    onError={() => {
                                        setIsPhotoLoading(false);
                                        setHasPhotoError(true);
                                    }}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        isPhotoLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                                {isPhotoLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#30c290]">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                                        <Loader2 size={22} className="text-white/80 animate-spin" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <Cat size={48} className="text-white stroke-[1.5]" />
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-center gap-1 text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">NAME:</span>
                            <span className="uppercase truncate">{catName}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">SEX:</span>
                            <span className="uppercase">{gender === 'female' ? 'F' : 'M'}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">AGE:</span>
                            <span className="uppercase">{ageLabel}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">WT:</span>
                            <span className="uppercase">{weight.toFixed(1)} {isKg ? 'KG' : 'LBS'}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">CLASS:</span>
                            <span className="uppercase">{activeLifeStage}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">DIET:</span>
                            <span className="uppercase">{foodLabel}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[#30c290] font-black w-14 shrink-0">FIXED:</span>
                            <span className="uppercase">{isSpayedNeutered ? 'YES' : 'NO'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer: signature + barcode */}
                <div className="relative mt-4 pt-3 border-t border-slate-900/20 flex items-end justify-between gap-3">
                    <div className="flex flex-col">
                        <span
                            className="text-2xl text-slate-800 leading-none"
                            style={{ fontFamily: "'Caveat', cursive" }}
                        >
                            {displayName || 'Owner'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Owner signature
                        </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {/* mock barcode */}
                        <div className="flex items-end gap-[1.5px] h-6" aria-hidden="true">
                            {[3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2].map((w, i) => (
                                <span
                                    key={i}
                                    className="bg-slate-900"
                                    style={{ width: `${w}px`, height: '100%' }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1 opacity-70">
                            <img src={pawWizLogo} alt="" className="h-3 w-auto object-contain" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                pawwiz.app
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
