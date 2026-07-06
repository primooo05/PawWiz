import React, { useState, useEffect } from 'react';
import { useDietRecommender } from '../hooks/features/useDietRecommender';
import { useCatAvatarUpload } from '../hooks/features/useCatAvatarUpload';
import BottomNav from '../components/layout/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/layout/LoadingScreen';
import { SearchableDropdown } from '../components/features/onboarding/SearchableDropdown';
import { AnimatePresence, motion } from 'motion/react';

const markingOptions = [
    'Solid Color',
    'Tabby (Striped)',
    'Classic Tabby (Marbled)',
    'Spotted Tabby',
    'Mackerel Tabby',
    'Calico',
    'Tortoiseshell',
    'Tuxedo',
    'Bicolor (Piebald)',
    'Colorpoint (Dark points)',
    'Tricolor',
    'Harlequin'
];

function CatAvatarTrigger({
    catProfileId,
    photoUrl,
    catName,
    onUploadSuccess,
    variant = 'circle',
}: {
    catProfileId: string;
    photoUrl?: string | null;
    catName: string;
    onUploadSuccess: (url: string) => void;
    variant?: 'circle' | 'card';
}) {
    const [supabaseUserId, setSupabaseUserId] = useState<string>('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                setSupabaseUserId(session.user.id);
            }
        });
    }, []);

    const { uploading, error, inputRef, triggerUpload, handleFileChange } = useCatAvatarUpload(
        catProfileId,
        catProfileId, // catId matches profileId in the DB linkage
        supabaseUserId,
        (url) => {
            // Update state with new photo URL without page reload
            onUploadSuccess(url);
        }
    );

    if (variant === 'card') {
        return (
            <div className="relative group w-full aspect-[4/3] rounded-2xl border-2 border-slate-900 bg-white flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#30c290] focus-within:ring-offset-2">
                <button
                    type="button"
                    onClick={triggerUpload}
                    disabled={uploading}
                    aria-label={`Upload photo for ${catName}`}
                    className="absolute inset-0 w-full h-full bg-transparent border-none cursor-pointer focus:outline-none z-10"
                />
                {uploading ? (
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin z-20" />
                ) : photoUrl ? (
                    <img src={photoUrl} alt={catName} className="w-full h-full object-cover z-0" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 z-20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-slate-500">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Add Photo</span>
                    </div>
                )}
                {/* Camera overlay on hover */}
                {!uploading && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                        </svg>
                    </div>
                )}
                {/* Hidden file input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-hidden="true"
                />
                {/* Error tooltip */}
                {error && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-30">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative group shrink-0">
            <button
                type="button"
                onClick={triggerUpload}
                disabled={uploading}
                aria-label={`Upload photo for ${catName}`}
                className="w-14 h-14 rounded-full border-3 border-[#30c290] bg-teal-50 flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:border-[#FFB870] focus:outline-none focus:ring-2 focus:ring-[#30c290] focus:ring-offset-2 disabled:opacity-50"
            >
                {uploading ? (
                    <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                ) : photoUrl ? (
                    <img src={photoUrl} alt={catName} className="w-full h-full object-cover" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#30c290]">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                )}
            </button>
            {/* Camera overlay on hover */}
            {!uploading && (
                <div className="absolute inset-0 rounded-full bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                    </svg>
                </div>
            )}
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
            />
            {/* Error tooltip */}
            {error && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-10">
                    {error}
                </div>
            )}
        </div>
    );
}

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        profiles,
        switchProfile,
        createNewProfile,
        deleteProfile,
        updateProfile,
    } = useDietRecommender();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [catToDelete, setCatToDelete] = useState<{ id: string; name: string } | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; catId: string } | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
    const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
    const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

    // Default expand to first profile if loaded
    useEffect(() => {
        if (profiles.length > 0 && !expandedCatId) {
            setExpandedCatId(profiles[0].id);
        }
    }, [profiles]);

    useEffect(() => {
        if (toast && toast.show) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Add Cat Form State
    const [newCatName, setNewCatName] = useState('');
    const [newCatGender, setNewCatGender] = useState<'male' | 'female'>('male');
    const [newCatLifeStage, setNewCatLifeStage] = useState<'kitten' | 'adult' | 'senior'>('adult');
    const [newCatBreed, setNewCatBreed] = useState('');
    const [newCatMarking, setNewCatMarking] = useState('');
    const [breedOptions, setBreedOptions] = useState<string[]>([]);
    const [breedLoading, setBreedLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setBreedLoading(true);
        const fallbackBreeds = [
            'Domestic Short Hair',
            'Domestic Long Hair',
            'Siamese',
            'Persian',
            'Maine Coon',
            'Ragdoll',
            'Bengal',
            'Abyssinian',
            'Sphynx',
            'British Shorthair'
        ];

        try {
            const resPromise = fetch('https://api.thecatapi.com/v1/breeds');
            if (resPromise && typeof resPromise.then === 'function') {
                resPromise
                    .then((res) => {
                        if (!res.ok) throw new Error('API error');
                        return res.json();
                    })
                    .then((data) => {
                        if (isMounted && Array.isArray(data)) {
                            setBreedOptions(data.map((b: any) => b.name));
                        }
                    })
                    .catch(() => {
                        if (isMounted) {
                            setBreedOptions(fallbackBreeds);
                        }
                    })
                    .finally(() => {
                        if (isMounted) setBreedLoading(false);
                    });
            } else {
                setBreedOptions(fallbackBreeds);
                setBreedLoading(false);
            }
        } catch {
            setBreedOptions(fallbackBreeds);
            setBreedLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const clearAddCatForm = () => {
        setNewCatName('');
        setNewCatGender('male');
        setNewCatLifeStage('adult');
        setNewCatBreed('');
        setNewCatMarking('');
    };

    const openAddCatForm = () => {
        setEditingCatId(null);
        clearAddCatForm();
        setShowAddForm(true);
    };

    const openEditCatForm = (cat: (typeof profiles)[number]) => {
        setEditingCatId(cat.id);
        setNewCatName(cat.name);
        setNewCatGender(cat.gender);
        setNewCatLifeStage(cat.lifeStage);
        setNewCatBreed(cat.breed || '');
        setNewCatMarking(cat.marking || '');
        setShowAddForm(true);
    };

    const closeCatForm = () => {
        setShowAddForm(false);
        setEditingCatId(null);
    };

    // Auto-open the add-cat form when navigated here from the diet setup view
    useEffect(() => {
        if (location.state && (location.state as { openAddCat?: boolean }).openAddCat) {
            openAddCatForm();
            // Clear the navigation state so the form doesn't re-open on back/refresh
            navigate('/settings', { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const handleNavigation = (item: string) => {
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/dashboard');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        } else if (item === 'behavior') {
            navigate('/behavior-chat');
        } else if (item === 'settings') {
            navigate('/settings');
        } else if (item === 'plant') {
            navigate('/');
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        handleLogout();
    };

    const handleAddCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        setIsLoading(true);
        try {
            if (editingCatId) {
                // Edit existing cat identity
                await updateProfile(editingCatId, {
                    name: newCatName.trim(),
                    gender: newCatGender,
                    lifeStage: newCatLifeStage,
                    breed: newCatBreed,
                    marking: newCatMarking || 'Solid Color',
                });
                setToast({
                    show: true,
                    message: `${newCatName.trim()}'s profile has been updated`,
                    catId: editingCatId,
                });
            } else {
                const serverProf = await createNewProfile(newCatName.trim(), {
                    gender: newCatGender,
                    lifeStage: newCatLifeStage,
                    breed: newCatBreed,
                    marking: newCatMarking || 'Solid Color',
                    isTracking: false,
                    age: 3,
                    weight: 4.0,
                    isKg: true,
                    foodPreference: 'mixed',
                    isSpayedNeutered: false,
                });

                if (serverProf) {
                    setToast({
                        show: true,
                        message: `${newCatName.trim()} has been added to your family`,
                        catId: serverProf.id,
                    });
                }
            }

            closeCatForm();
            clearAddCatForm();
        } catch (error) {
            console.error('Failed to save cat profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 flex flex-col">
            <main className="max-w-4xl w-full px-4 sm:px-6 md:px-8 py-12 mx-auto flex-grow">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Settings</h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                        Manage your cat profiles and tracker settings
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Your Cats ({profiles.length})</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Cats List Pane */}
                    <div className="md:col-span-2">
                        {profiles.length === 0 ? (
                            <div className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                                <p className="text-slate-500 italic py-4">No cat profiles found. Click Add Another Cat below to get started.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col pt-6 pb-4 w-full">
                                {profiles.map((cat, index) => {
                                    const isExpanded = cat.id === expandedCatId;
                                    const isHovered = cat.id === hoveredCatId;

                                    const cardColors = [
                                        { bg: '#FFF4B0', text: '#8A4F00' }, // Yellow-gold
                                        { bg: '#FFD6D6', text: '#C05C5C' }, // Pastel Pink
                                        { bg: '#D4EBF7', text: '#2C5E7A' }, // Pastel Blue
                                        { bg: '#C6F1E6', text: '#1E6F5C' }, // Mint Green
                                        { bg: '#E5D7FA', text: '#5D4A7A' }, // Pastel Purple
                                    ];
                                    const colors = cardColors[index % cardColors.length];
                                    const zIndex = isExpanded ? 50 : isHovered ? 40 : 10 + index * 10;

                                    const ageText = cat.lifeStage === 'kitten'
                                        ? `${cat.age} ${cat.age === 1 ? 'month' : 'months'}`
                                        : `${cat.age} ${cat.age === 1 ? 'year' : 'years'}`;
                                    const weightText = `${cat.weight} ${cat.isKg ? 'kg' : 'lbs'}`;

                                    return (
                                        <div
                                            key={cat.id}
                                            onMouseEnter={() => setHoveredCatId(cat.id)}
                                            onMouseLeave={() => setHoveredCatId(null)}
                                            onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                                            className={`relative flex flex-col transition-all duration-300 ease-out cursor-pointer group w-full
                                                ${index > 0 ? '-mt-10' : ''}
                                                ${isExpanded ? 'scale-[1.01]' : 'scale-100'}
                                                hover:-translate-y-4`}
                                            style={{ zIndex }}
                                        >
                                            {/* Folder Tab */}
                                            <div className="flex">
                                                <div
                                                    className="h-7 px-4 border-t-2 border-x-2 border-slate-900 rounded-t-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center transition-colors"
                                                    style={{
                                                        backgroundColor: colors.bg,
                                                        borderColor: '#0f172a',
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {cat.name}
                                                </div>
                                            </div>

                                            {/* Folder Body */}
                                            <div
                                                className="border-2 border-slate-900 rounded-b-2xl rounded-tr-2xl p-4 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col gap-3 transition-colors -mt-[2px] w-full"
                                                style={{
                                                    backgroundColor: colors.bg,
                                                }}
                                            >
                                                {/* Header: Cat Name, Breed */}
                                                <div className="flex justify-between items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-slate-900 text-base">
                                                            {cat.name}
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-500 uppercase px-1.5 py-0.5 bg-white/50 rounded border border-slate-300">
                                                            {cat.breed || 'Domestic Short'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expandable Details Container */}
                                                <motion.div
                                                    initial={false}
                                                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-3 border-t border-slate-900/10 flex flex-col gap-3">
                                                        {/* Cat Photo Frame - Resized smaller */}
                                                        <div className="w-full max-w-[200px] mx-auto" onClick={(e) => e.stopPropagation()}>
                                                            <CatAvatarTrigger
                                                                catProfileId={cat.id}
                                                                photoUrl={cat.photoUrl}
                                                                catName={cat.name}
                                                                variant="card"
                                                                onUploadSuccess={(url) => {
                                                                    const updated = profiles.map(p =>
                                                                        p.id === cat.id ? { ...p, photoUrl: url } : p
                                                                    );
                                                                    localStorage.setItem('diet_profiles', JSON.stringify(updated));
                                                                    switchProfile(cat.id);
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Spec tags & Action Buttons */}
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className="px-1.5 py-0.5 bg-white/70 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase rounded">
                                                                {cat.gender}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 bg-white/70 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase rounded">
                                                                {cat.lifeStage} ({ageText})
                                                            </span>
                                                            <span className="px-1.5 py-0.5 bg-white/70 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase rounded">
                                                                {weightText}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 bg-white/70 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase rounded">
                                                                {cat.foodPreference} Pref
                                                            </span>
                                                            <span className="px-1.5 py-0.5 bg-white/70 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase rounded">
                                                                {cat.isTracking ? 'Active' : 'Standby'}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-2 justify-end mt-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditCatForm(cat)}
                                                                className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border-2 border-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a] active:shadow-none active:translate-y-[1.5px] transition-all cursor-pointer"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCatToDelete({ id: cat.id, name: cat.name })}
                                                                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border-2 border-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a] active:shadow-none active:translate-y-[1.5px] transition-all cursor-pointer"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!showAddForm && (
                            <button
                                type="button"
                                onClick={openAddCatForm}
                                className="w-full py-4 px-6 rounded-2xl bg-[#FFB870] hover:bg-[#ffc58a] text-slate-900 font-extrabold text-md border-2 border-slate-900 cursor-pointer transition-all duration-200 shadow-[4px_4px_0_0_#0f172a] active:shadow-none active:translate-y-[4px]"
                            >
                                + Add Another Cat
                            </button>
                        )}
                    </div>

                    {/* Quick Stats/Tip Column */}
                    <div className="space-y-6">
                        <div className="bg-[#15AFB4] border-2 border-slate-900 rounded-[2rem] p-6 text-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                            <h3 className="font-black text-lg uppercase mb-2">Multiple Cats?</h3>
                            <p className="text-xs font-semibold leading-relaxed opacity-95">
                                PawWiz allows you to track diet, guidelines, and meal schedules for multiple cats at once. Switch between profiles seamlessly in every Feature!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Another Cat Form Modal/Accordion as a Folder */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="flex flex-col overflow-visible"
                        >
                            <div className="flex mt-8">
                                <div className="h-7 px-4 bg-[#FFB870] border-t-2 border-x-2 border-slate-900 rounded-t-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center text-slate-900">
                                    {editingCatId ? 'Edit Profile' : 'New Cat'}
                                </div>
                            </div>
                            <div className="bg-white border-2 border-slate-900 rounded-b-2xl rounded-tr-2xl p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)] -mt-[2px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black uppercase text-slate-900">{editingCatId ? 'Edit Cat Profile' : 'Add Another Cat'}</h2>
                                    <button
                                        onClick={closeCatForm}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleAddCatSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-left">
                                    {/* Cat Name */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Cat's Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                            placeholder="e.g. Aki"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Gender
                                        </label>
                                        <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setNewCatGender('male')}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatGender === 'male' ? 'bg-[#30c290] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewCatGender('female')}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatGender === 'female' ? 'bg-[#30c290] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>

                                    {/* Life Stage */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Life Stage
                                        </label>
                                        <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewCatLifeStage('kitten');
                                                }}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'kitten' ? 'bg-[#30c290] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Kitten
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewCatLifeStage('adult');
                                                }}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'adult' ? 'bg-[#30c290] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Adult
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewCatLifeStage('senior');
                                                }}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'senior' ? 'bg-[#30c290] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Senior
                                            </button>
                                        </div>
                                    </div>

                                    {/* Breed */}
                                    <div className="flex flex-col space-y-1.5 w-full">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Breed
                                        </label>
                                        <SearchableDropdown
                                            value={newCatBreed}
                                            onChange={setNewCatBreed}
                                            options={breedOptions}
                                            placeholder="Search breed..."
                                            loading={breedLoading}
                                        />
                                    </div>

                                    {/* Marking */}
                                    <div className="flex flex-col space-y-1.5 w-full">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                            Marking
                                        </label>
                                        <SearchableDropdown
                                            value={newCatMarking}
                                            onChange={setNewCatMarking}
                                            options={markingOptions}
                                            placeholder="Search marking..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4 border-t-2 border-slate-100">
                                        <button
                                            type="button"
                                            onClick={closeCatForm}
                                            className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none"
                                        >
                                            {editingCatId ? 'Save Changes' : 'Confirm'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Account Section */}
                <div className="mt-12 border-t-2 border-slate-200 pt-12">
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-8">
                        <h2 className="text-xl font-black mb-2 uppercase tracking-tight text-slate-900">Account</h2>
                        <p className="text-sm text-slate-600 mb-6">Manage your account settings and preferences</p>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full md:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold uppercase tracking-wider rounded-xl border-none shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav
                    activeItem="settings"
                    onItemClick={handleNavigation}
                    className="w-full max-w-2xl md:w-auto md:scale-110"
                    hasUntracked={profiles.some(p => !p.isTracking)}
                />
            </div>

            <AnimatePresence>
                {toast && toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed top-6 right-6 z-[9999] bg-[#FFB870] border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0_0_#1e293b] flex items-center justify-between gap-4 max-w-sm w-full"
                    >
                        <div>
                            <p className="font-extrabold text-slate-900 text-sm">{toast.message}</p>
                        </div>
                        {toast.catId && (
                            <button
                                onClick={() => {
                                    setIsLoading(true);
                                    setTimeout(() => {
                                        navigate('/diet-recommender', { state: { askSetupFor: toast.catId } });
                                    }, 800);
                                }}
                                className="bg-[#30c290] hover:bg-[#39d3c5] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider border-none shadow-[2px_2px_0_0_#1e293b] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
                            >
                                View
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {catToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 max-w-sm w-full text-center shadow-[8px_8px_0_0_rgba(15,23,42,1)]">
                        <h3 className="text-xl font-black text-slate-900 uppercase mb-2">Delete Profile?</h3>
                        <p className="text-slate-600 text-sm font-semibold mb-6">
                            Are you sure you want to delete <span className="font-extrabold text-[#15AFB4]">{catToDelete.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setCatToDelete(null)}
                                className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold py-3 px-4 rounded-2xl text-center text-sm cursor-pointer transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    const name = catToDelete.name;
                                    await deleteProfile(catToDelete.id);
                                    setCatToDelete(null);
                                    setIsLoading(false);
                                    setToast({
                                        show: true,
                                        message: `${name} has been officially deleted`,
                                        catId: '',
                                    });
                                }}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 px-4 rounded-2xl text-center text-sm cursor-pointer transition-all border-none shadow-[0_4px_0_0_#991b1b] active:shadow-none active:translate-y-[4px]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: 20 }}
                        transition={{
                            type: 'spring',
                            damping: 15,
                            stiffness: 300,
                            mass: 1,
                        }}
                        className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 max-w-sm w-full text-center shadow-[8px_8px_0_0_rgba(15,23,42,1)]"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                damping: 12,
                                stiffness: 200,
                                delay: 0.1,
                            }}
                            className="text-4xl mb-3"
                        >
                            🚪
                        </motion.div>
                        <h3 className="text-xl font-black text-slate-900 uppercase mb-2">Logout?</h3>
                        <p className="text-slate-600 text-sm font-semibold mb-6">
                            Are you sure you want to logout? You'll need to log back in to access your cats.
                        </p>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold py-3 px-4 rounded-2xl text-center text-sm cursor-pointer transition-all"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={confirmLogout}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 px-4 rounded-2xl text-center text-sm cursor-pointer transition-all border-none shadow-[0_4px_0_0_#991b1b] active:shadow-none active:translate-y-[4px]"
                            >
                                Logout
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isLoading && <LoadingScreen durationMs={3000} />}
        </div>
    );
}
