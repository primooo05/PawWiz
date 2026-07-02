import React from 'react';
import catScreen3 from '../../assets/Cat_Screen3.svg';

interface OnboardingScreen3Props {
  active: boolean;
  catsCount: string;
  setCatsCount: (count: string) => void;
  customCatsCount: string;
  setCustomCatsCount: (count: string) => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleNextClick: () => void;
  handleBackClick: () => void;
  showKeyboardHint?: boolean;
}

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({
  active,
  catsCount,
  setCatsCount,
  customCatsCount,
  setCustomCatsCount,
  isTyping,
  showBubble,
  bubbleText,
  handleNextClick,
  handleBackClick,
  showKeyboardHint,
}) => {
  const options = ['One', 'Two', 'Three'];

  return (
    <div className={`flex flex-col md:grid md:grid-cols-2 md:items-start justify-center items-center w-full max-w-5xl gap-6 md:gap-12 z-0 pt-6 pb-6 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
      {/* 1. ChatBubble & Mascot SVG */}
      <div className="md:col-start-2 md:row-start-1 md:row-span-2 flex justify-center items-center relative w-full">
        {/* Custom Speech Bubble */}
        {showBubble && (
          <div className="absolute -top-4 left-4 md:-top-16 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-10 animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        <div className="animate-float">
          <img
            src={catScreen3}
            alt="Cat mascot"
            className="w-36 h-36 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 2. Selection Buttons & Input */}
      <div className="md:col-start-1 md:row-start-1 md:row-span-2 flex-1 w-full max-w-md flex flex-col justify-center items-center md:items-stretch text-center md:text-left space-y-4">
        {options.map((option) => {
          const isSelected = catsCount === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                setCatsCount(option);
                setCustomCatsCount('');
              }}
              disabled={isTyping || !active}
              className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-lg md:text-xl border-none cursor-pointer transition-all duration-200 ${isSelected
                  ? 'bg-[#1b9e91] shadow-[0_4px_0_0_#126b62]'
                  : 'bg-[#30c290] hover:bg-[#39d3c5] shadow-[0_4px_0_0_#209f93] active:shadow-none active:translate-y-[4px]'
                }`}
            >
              {option}
            </button>
          );
        })}

        {/* Custom Input */}
        <div className="pt-2 flex flex-col items-center md:items-start space-y-2 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Too many to count
          </label>
          <input
            type="text"
            value={customCatsCount}
            onChange={(e) => {
              setCustomCatsCount(e.target.value);
              setCatsCount(''); // Clear button selection if typing custom
            }}
            placeholder="Specify e.g., 4"
            className="w-full px-5 py-3.5 bg-[#30c290] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#30c290] focus:ring-opacity-40"
            disabled={isTyping || !active}
          />
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
};
