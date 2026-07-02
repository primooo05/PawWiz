import React, { useState, useEffect } from 'react';
import catScreen4 from '../../assets/Cat_Screen4.svg';
import { SearchableDropdown } from './SearchableDropdown';


interface OnboardingScreen4Props {
  active: boolean;
  catName: string;
  setCatName: (name: string) => void;
  catBreed: string;
  setCatBreed: (breed: string) => void;
  catMarking: string;
  setCatMarking: (marking: string) => void;
  catSex: string;
  setCatSex: (sex: string) => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleNextClick: () => void;
  handleBackClick: () => void;
  showKeyboardHint?: boolean;
}

export const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({
  active,
  catName,
  setCatName,
  catBreed,
  setCatBreed,
  catMarking,
  setCatMarking,
  catSex,
  setCatSex,
  isTyping,
  showBubble,
  bubbleText,
  handleNextClick,
  handleBackClick,
  showKeyboardHint,
}) => {
  const [breedOptions, setBreedOptions] = useState<string[]>([]);
  const [breedLoading, setBreedLoading] = useState(false);

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

  return (
    <div className={`flex flex-col md:grid md:grid-cols-2 md:items-start justify-center items-center w-full max-w-5xl gap-6 md:gap-12 z-0 pt-6 pb-6 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${
      active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* 1. ChatBubble & Mascot SVG */}
      <div className="md:col-start-2 md:row-start-1 md:row-span-2 flex justify-center items-center relative w-full">
        {/* Custom Speech Bubble */}
        {showBubble && (
          <div className="absolute -top-18 left-4 md:-top-18 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-[-10] animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        <div className="animate-float">
          <img
            src={catScreen4}
            alt="Cat mascot"
            className="w-36 h-36 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 2. Form Fields */}
      <div className="md:col-start-1 md:row-start-1 md:row-span-2 flex-1 w-full max-w-md flex flex-col justify-center items-center md:items-stretch text-center md:text-left space-y-4">
        {/* Cat Name Input */}
        <div className="flex flex-col items-center md:items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Cat's Name
          </label>
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Galaxy Destroyer 67"
            className="w-full px-5 py-3.5 bg-[#30c290] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#30c290] focus:ring-opacity-40"
            disabled={isTyping || !active}
          />
        </div>

        {/* Breed Input */}
        <div className="flex flex-col items-center md:items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Breed (Optional)
          </label>
          <SearchableDropdown
            value={catBreed}
            onChange={setCatBreed}
            placeholder="e.g., Domestic Short Hair"
            options={breedOptions}
            disabled={isTyping}
            active={active}
            loading={breedLoading}
          />
        </div>

        {/* Marking Input */}
        <div className="flex flex-col items-center md:items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Marking (Optional)
          </label>
          <SearchableDropdown
            value={catMarking}
            onChange={setCatMarking}
            placeholder="e.g., Orange Tabby"
            options={markingOptions}
            disabled={isTyping}
            active={active}
          />
        </div>

        {/* Sex Selection */}
        <div className="flex flex-col items-center md:items-start space-y-2.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Sex
          </label>
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setCatSex('Female')}
              disabled={isTyping || !active}
              className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-2xl border-2 font-extrabold text-sm md:text-base cursor-pointer transition-all duration-200 ${
                catSex === 'Female'
                  ? 'bg-rose-50 border-rose-400 text-rose-500 shadow-[0_4px_0_0_#fda4af] translate-y-[2px]'
                  : 'bg-white border-[#30c290] text-[#30c290] hover:bg-rose-50/30'
              }`}
            >
              <span className="text-lg text-rose-400">♀</span> Female
            </button>
            <button
              type="button"
              onClick={() => setCatSex('Male')}
              disabled={isTyping || !active}
              className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-2xl border-2 font-extrabold text-sm md:text-base cursor-pointer transition-all duration-200 ${
                catSex === 'Male'
                  ? 'bg-sky-50 border-sky-400 text-sky-500 shadow-[0_4px_0_0_#bae6fd] translate-y-[2px]'
                  : 'bg-white border-[#30c290] text-[#30c290] hover:bg-sky-50/30'
              }`}
            >
              <span className="text-lg text-sky-400">♂</span> Male
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Actions Overlay */}
      <div className="w-full md:absolute md:bottom-2 left-0 flex flex-col items-center gap-4 z-0 mt-6 md:mt-0 md:col-span-2">
        <div className="flex gap-4 w-full max-w-[420px] px-6 justify-center">
          <button
            onClick={handleBackClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider cursor-pointer transition-all ${
              isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNextClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none flex flex-col items-center justify-center ${
              isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <span>Next</span>
            {showKeyboardHint && (
              <span className="block text-[10px] font-normal opacity-50 mt-0.5">
                Press <kbd className="font-mono bg-slate-800/10 px-1 rounded text-[9px]">Enter ↵</kbd>
              </span>
            )}
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2.5 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
};
