import React from 'react';
import catScreen5 from '../../assets/Cat_Screen5.svg';

interface OnboardingScreen5Props {
  active: boolean;
  catLifeStage: string;
  setCatLifeStage: (stage: string) => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleNextClick: () => void;
  handleBackClick: () => void;
  showKeyboardHint?: boolean;
}

export const OnboardingScreen5: React.FC<OnboardingScreen5Props> = ({
  active,
  catLifeStage,
  setCatLifeStage,
  isTyping,
  showBubble,
  bubbleText,
  handleNextClick,
  handleBackClick,
  showKeyboardHint,
}) => {
  const options = [
    { label: 'Kitten ( < 1 year )', value: 'Kitten' },
    { label: 'Adult ( 1 - 7 Years )', value: 'Adult' },
    { label: 'Senior ( > 7 years )', value: 'Senior' }
  ];

  return (
    <div className={`flex flex-col md:grid md:grid-cols-2 md:items-start justify-center items-center w-full max-w-5xl gap-6 md:gap-12 z-0 pt-6 pb-6 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
      {/* 1. ChatBubble & Mascot SVG */}
      <div className="md:col-start-2 md:row-start-1 md:row-span-2 flex justify-center items-center relative w-full">
        {/* Custom Speech Bubble */}
        {showBubble && (
          <div className="absolute -top-28 left-4 md:-top-24 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-10 animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        <div className="animate-float">
          <img
            src={catScreen5}
            alt="Cat mascot"
            className="w-36 h-36 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 2. Life Stage Selection */}
      <div className="md:col-start-1 md:row-start-1 md:row-span-2 flex-1 w-full max-w-md flex flex-col justify-center items-center md:items-stretch text-center md:text-left space-y-4">
        <label className="text-xl md:text-2xl text-slate-400 font-extrabold italic pl-1 tracking-wide text-center md:text-left">
          Life Stage
        </label>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 w-full">
            {options.slice(0, 2).map((opt) => {
              const isSelected = catLifeStage === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCatLifeStage(opt.value)}
                  disabled={isTyping || !active}
                  className={`flex-1 py-3.5 px-4 rounded-2xl border-none font-extrabold text-sm md:text-base italic cursor-pointer transition-all duration-200 ${isSelected
                      ? 'bg-[#1b9e91] text-white shadow-[0_4px_0_0_#126b62] translate-y-[2px]'
                      : 'bg-[#30c290] hover:bg-[#39d3c5] text-white shadow-[0_4px_0_0_#209f93] active:shadow-none active:translate-y-[4px]'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center w-full">
            {options.slice(2).map((opt) => {
              const isSelected = catLifeStage === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCatLifeStage(opt.value)}
                  disabled={isTyping || !active}
                  className={`w-2/3 py-3.5 px-4 rounded-2xl border-none font-extrabold text-sm md:text-base italic cursor-pointer transition-all duration-200 ${isSelected
                      ? 'bg-[#1b9e91] text-white shadow-[0_4px_0_0_#126b62] translate-y-[2px]'
                      : 'bg-[#30c290] hover:bg-[#39d3c5] text-white shadow-[0_4px_0_0_#209f93] active:shadow-none active:translate-y-[4px]'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Actions Overlay */}
      <div className="w-full md:absolute md:bottom-2 left-0 flex flex-col items-center gap-4 z-0 mt-6 md:mt-0 md:col-span-2">
        <div className="flex gap-4 w-full max-w-[420px] px-6 justify-center">
          <button
            onClick={handleBackClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider cursor-pointer transition-all ${isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            Back
          </button>

          <button
            onClick={handleNextClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none flex flex-col items-center justify-center ${isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
};
