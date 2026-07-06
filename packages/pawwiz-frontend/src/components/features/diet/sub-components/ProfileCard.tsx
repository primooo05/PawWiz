import React, { useEffect, useRef, useState } from 'react';
import { Cat, Download, Loader2, RefreshCw } from 'lucide-react';
import pawWizTextLogo from '../../../../assets/PawWiz_Text_logo.png';
import type { FoodType } from '../../../../lib/foods';

interface ProfileCardProps {
    catName: string;
    displayName?: string;
    gender: 'male' | 'female';
    weight: number;
    isKg: boolean;
    foodPreference: FoodType;
    isSpayedNeutered: boolean;
    activeLifeStage: 'kitten' | 'adult' | 'senior';
    lifeStage: 'kitten' | 'adult' | 'senior';
    age: number;
    onEditProfile?: () => void;
    photoUrl?: string | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    catName,
    displayName,
    gender,
    weight,
    isKg,
    activeLifeStage,
    lifeStage,
    age,
    onEditProfile,
    photoUrl,
}) => {
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(false);
    const [isPhotoLoading, setIsPhotoLoading] = useState(!!photoUrl);
    const [hasPhotoError, setHasPhotoError] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsPhotoLoading(!!photoUrl);
        setHasPhotoError(false);
    }, [photoUrl]);

    const ageLabel = `${age} ${lifeStage === 'kitten' ? (age === 1 ? 'Month' : 'Months') : (age === 1 ? 'Year' : 'Years')}`;
    const weightLabel = `${weight.toFixed(1)} ${isKg ? 'kg' : 'lbs'}`;

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering card flip on button click
        if (!frontRef.current || !backRef.current) return;
        setIsDownloading(true);
        setDownloadError(false);
        try {
            const { toPng } = await import('html-to-image');

            // 1. Download Front View
            const frontDataUrl = await toPng(frontRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });
            const linkFront = document.createElement('a');
            linkFront.download = `${catName || 'cat'}-profile-front.png`;
            linkFront.href = frontDataUrl;
            linkFront.click();

            // Tiny delay to guarantee both downloads execute smoothly in browsers
            await new Promise((resolve) => setTimeout(resolve, 250));

            // 2. Download Back View
            const backDataUrl = await toPng(backRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });
            const linkBack = document.createElement('a');
            linkBack.download = `${catName || 'cat'}-profile-back.png`;
            linkBack.href = backDataUrl;
            linkBack.click();

        } catch (err) {
            console.error('Failed to generate profile card image', err);
            setDownloadError(true);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Styles for flipping card */}
            <style>{`
                .flip-card {
                    perspective: 1000px;
                }
                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }
                .flip-card.flipped .flip-card-inner {
                    transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 1.5rem;
                }
                .flip-card-back {
                    transform: rotateY(180deg);
                }
            `}</style>

            {/* Action bar — excluded from the downloaded image */}
            {/* flex-wrap (not a sm: breakpoint) so the buttons drop to their own
                line whenever the *container* is narrow — this component renders
                inside both a full-width column (Diet Recommender) and a
                max-w-md column (Dashboard), and viewport-based breakpoints alone
                caused the buttons to overlap the title in the narrower context. */}
            <div className="w-full flex flex-wrap items-start justify-between mb-4 gap-3">
                <div className="border-l-4 border-[#1a1a1a] pl-4 min-w-0 shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#1a1a1a] uppercase whitespace-nowrap">Cat Profile</h2>
                    <p className="text-sm text-[#555] mt-2 font-bold">Your cat's saved details</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {onEditProfile && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProfile();
                            }}
                            className="text-xs font-black text-[#30c290] hover:text-[#20a396] cursor-pointer active:scale-95 transition-transform"
                        >
                            Edit Profile
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFlipped(prev => !prev);
                        }}
                        className="flex items-center gap-1 text-xs font-black text-[#555] hover:text-[#1a1a1a] cursor-pointer active:scale-95 transition-transform"
                    >
                        <RefreshCw size={13} />
                        Flip Card
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        aria-label="Download cat profile card as PNG"
                        className="flex items-center gap-1.5 text-xs font-black text-white bg-[#1a1a1a] hover:bg-[#333] px-3 py-1.5 rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0_0_#1a1a1a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Flippable Container */}
            <div
                className={`flip-card w-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(prev => !prev)}
                style={{ height: '255px' }}
            >
                <div className="flip-card-inner w-full h-full relative">

                    {/* FRONT VIEW */}
                    <div ref={frontRef} className="flip-card-front absolute inset-0 bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-5 py-2 border-b-2 border-[#1a1a1a] flex items-center">
                            <img src={pawWizTextLogo} alt="Paw Wiz" className="h-6 object-contain" />
                        </div>

                        {/* Content Body: Flexbox for left text and right image */}
                        <div className="flex-grow flex items-center justify-between px-5 py-2 gap-4 relative">
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: 'Cat name:', value: catName },
                                    { label: 'Sex:', value: gender },
                                    { label: 'Age:', value: ageLabel },
                                    { label: 'Weight:', value: weightLabel },
                                    { label: 'Stage:', value: activeLifeStage },
                                ].map((item) => (
                                    <div key={item.label} className="grid grid-cols-[90px_1fr] gap-2 text-xs font-bold uppercase">
                                        <span className="text-[#30c290] font-black">{item.label}</span>
                                        <span className="text-[#1a1a1a] font-extrabold">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Right Image Container */}
                            <div className="w-32 h-32 shrink-0 bg-white border-2 border-[#1a1a1a] rounded-3xl overflow-hidden relative z-10 flex items-center justify-center">
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
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${isPhotoLoading ? 'opacity-0' : 'opacity-100'
                                                }`}
                                        />
                                        {isPhotoLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#30c290]">
                                                <Loader2 size={20} className="text-white animate-spin" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Cat size={44} className="text-slate-400 stroke-[1.5]" />
                                )}
                            </div>

                            {/* Front Checkerboard strip under the image */}
                            <div className="absolute right-5 bottom-0 w-32 h-8 grid grid-cols-4 grid-rows-2 pointer-events-none overflow-hidden">
                                {Array.from({ length: 8 }).map((_, i) => {
                                    const row = Math.floor(i / 4);
                                    const col = i % 4;
                                    const isGreen = (row + col) % 2 === 0;
                                    return <div key={i} className={isGreen ? "bg-[#30c290]" : ""} />;
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-1.5 border-t-2 border-[#1a1a1a] text-center flex flex-col items-center justify-center gap-0.5">
                            <span
                                className="text-xl text-[#1a1a1a] leading-none"
                                style={{ fontFamily: "'Caveat', 'Brush Script MT', 'Reenie Beanie', cursive" }}
                            >
                                {displayName || 'Owner'}
                            </span>
                            <span className="text-[8px] font-black text-[#888] uppercase tracking-widest leading-none">
                                {displayName ? `[${catName}'s Owner]` : 'Owner Signature'}
                            </span>
                        </div>
                    </div>

                    {/* BACK VIEW */}
                    <div ref={backRef} className="flip-card-back absolute inset-0 bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] flex items-center justify-center relative overflow-hidden rounded-3xl">
                        <img src={pawWizTextLogo} alt="Paw Wiz" className="h-12 object-contain" />

                        {/* Seamless L-shaped Checkerboard Pattern (Single Container, Perfect Squares) */}
                        <div className="absolute right-0 bottom-0 top-0 w-24 grid grid-cols-4 auto-rows-[24px] content-end pointer-events-none overflow-hidden rounded-r-3xl">
                            {Array.from({ length: 80 }).map((_, i) => {
                                const rowFromTop = Math.floor(i / 4);
                                const col = i % 4;
                                // Map row relative to bottom row (row index 0 is bottom-most row)
                                const rowFromBottom = 19 - rowFromTop;

                                const isGreen = (rowFromBottom + col) % 2 === 0 && (col >= 2 || rowFromBottom < 2);
                                return <div key={i} className={isGreen ? "bg-[#30c290]" : ""} style={{ width: '24px', height: '24px' }} />;
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
