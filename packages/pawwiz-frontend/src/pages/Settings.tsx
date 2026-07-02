import React, { useState, useEffect } from 'react';
import { useDietRecommender } from '../hooks/useDietRecommender';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { SearchableDropdown } from '../components/onboarding/SearchableDropdown';
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

export default function Settings() {
    const navigate = useNavigate();
    const {
        profiles,
        switchProfile,
        createNewProfile,
        deleteProfile,
    } = useDietRecommender();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [catToDelete, setCatToDelete] = useState<{ id: string; name: string } | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; catId: string } | null>(null);

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

        const handleNavigation = (item: string) => {
        if (item === 'calendar') {
        navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
        navigate('/dashboard');
        } else if (item === 'diet-reco') {
        navigate('/diet-recommender');
        } else if (item === 'settings') {
        navigate('/settings');
        } else if (item === 'plant') {
        navigate('/');
        }
    };

    const handleAddCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        setIsLoading(true);
        try {
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

            clearAddCatForm();
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to add another cat', error);
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Cats List Pane */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                            <h2 className="text-xl font-black mb-4 uppercase tracking-tight text-slate-900">Your Cats ({profiles.length})</h2>
                            
                            {profiles.length === 0 ? (
                                <p className="text-slate-500 italic py-4">No cat profiles found. Click Add Another Cat below to get started.</p>
                            ) : (
                                <div className="divide-y-2 divide-slate-100">
                                    {profiles.map((cat) => {
                                        const ageText = cat.lifeStage === 'kitten' 
                                            ? `${cat.age} ${cat.age === 1 ? 'month' : 'months'}` 
                                            : `${cat.age} ${cat.age === 1 ? 'year' : 'years'}`;
                                        const weightText = `${cat.weight} ${cat.isKg ? 'kg' : 'lbs'}`;

                                        return (
                                            <div key={cat.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                                                <div>
                                                    <h3 className="font-extrabold text-lg text-slate-900">{cat.name}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-[#15AFB4] font-black text-[10px] uppercase rounded-md">
                                                            {cat.gender}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-black text-[10px] uppercase rounded-md">
                                                            {cat.lifeStage} ({ageText})
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-black text-[10px] uppercase rounded-md">
                                                            {weightText}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 font-black text-[10px] uppercase rounded-md">
                                                            {cat.foodPreference} preference
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            switchProfile(cat.id);
                                                            navigate('/diet-recommender');
                                                        }}
                                                        className="bg-[#2ec4b6] hover:bg-[#39d3c5] text-white font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider border-none shadow-[2px_2px_0_0_#1e293b] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer"
                                                    >
                                                        Select
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCatToDelete({ id: cat.id, name: cat.name })}
                                                        className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider border-none shadow-[2px_2px_0_0_#1e293b] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!showAddForm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearAddCatForm();
                                        setShowAddForm(true);
                                    }}
                                    className="mt-6 w-full py-4 px-6 rounded-2xl bg-[#FFB870] hover:bg-[#ffc58a] text-slate-900 font-extrabold text-md border-none cursor-pointer transition-all duration-200 shadow-[0_4px_0_0_#1e293b] active:shadow-none active:translate-y-[4px]"
                                >
                                    + Add Another Cat
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats/Tip Column */}
                    <div className="space-y-6">
                        <div className="bg-[#15AFB4] border-2 border-slate-900 rounded-[2rem] p-6 text-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                            <h3 className="font-black text-lg uppercase mb-2">Multiple Cats?</h3>
                            <p className="text-xs font-semibold leading-relaxed opacity-95">
                                PawWiz allows you to track diet, guidelines, and meal schedules for multiple cats at once. Switch between profiles seamlessly in the Diet Dashboard!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Another Cat Form Modal/Accordion */}
                {showAddForm && (
                    <div className="mt-8 bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase text-slate-900">Add Another Cat</h2>
                            <button 
                                onClick={() => setShowAddForm(false)}
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
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatGender === 'male' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCatGender('female')}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatGender === 'female' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
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
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'kitten' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Kitten
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewCatLifeStage('adult');
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'adult' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Adult
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewCatLifeStage('senior');
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${newCatLifeStage === 'senior' ? 'bg-[#2ec4b6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
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
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="settings" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
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
                                className="bg-[#2ec4b6] hover:bg-[#39d3c5] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider border-none shadow-[2px_2px_0_0_#1e293b] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
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

            {isLoading && <LoadingScreen durationMs={3000} />}
        </div>
    );
}
