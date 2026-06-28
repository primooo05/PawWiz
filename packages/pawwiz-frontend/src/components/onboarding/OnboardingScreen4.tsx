import React from 'react';
import catScreen4 from '../../assets/Cat_Screen4.svg';

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
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-center items-center w-full max-w-5xl gap-12 z-10 pt-6 pb-36 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${
      active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Left Column: Form Fields */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center items-stretch text-left space-y-4">
        {/* Cat Name Input */}
        <div className="flex flex-col items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Cat's Name
          </label>
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Galaxy Destroyer 67"
            className="w-full px-5 py-3.5 bg-[#2ec4b6] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-40"
            disabled={isTyping || !active}
          />
        </div>

        {/* Breed Input */}
        <div className="flex flex-col items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Breed (Optional)
          </label>
          <input
            type="text"
            value={catBreed}
            onChange={(e) => setCatBreed(e.target.value)}
            placeholder="e.g., Domestic Short Hair"
            className="w-full px-5 py-3.5 bg-[#2ec4b6] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-40"
            disabled={isTyping || !active}
          />
        </div>

        {/* Marking Input */}
        <div className="flex flex-col items-start space-y-1.5 w-full">
          <label className="text-xs md:text-sm text-slate-400 font-semibold italic pl-1">
            Marking (Optional)
          </label>
          <input
            type="text"
            value={catMarking}
            onChange={(e) => setCatMarking(e.target.value)}
            placeholder="e.g., Orange Tabby"
            className="w-full px-5 py-3.5 bg-[#2ec4b6] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-40"
            disabled={isTyping || !active}
          />
        </div>

        {/* Sex Selection */}
        <div className="flex flex-col items-start space-y-2.5 w-full">
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
                  ? 'bg-rose-50 border-rose-400 text-rose-500 shadow-[0_4px_0_0_#fda4af] translate-y-[-2px]'
                  : 'bg-white border-[#2ec4b6] text-[#2ec4b6] hover:bg-rose-50/30'
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
                  ? 'bg-sky-50 border-sky-400 text-sky-500 shadow-[0_4px_0_0_#bae6fd] translate-y-[-2px]'
                  : 'bg-white border-[#2ec4b6] text-[#2ec4b6] hover:bg-sky-50/30'
              }`}
            >
              <span className="text-lg text-sky-400">♂</span> Male
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Cat Mascot with Custom Speech Bubble */}
      <div className="flex-1 flex justify-center items-center relative">
        {/* Custom Speech Bubble */}
        {showBubble && (
          <div className="absolute top-0 left-4 md:-top-10 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-20 animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        <div className="animate-float">
          <img
            src={catScreen4}
            alt="Cat mascot"
            className="w-72 h-72 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Actions Overlay */}
      <div className="w-full absolute bottom-2 left-0 flex flex-col items-center gap-4 z-20">
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
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none ${
              isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Next
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2.5 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2ec4b6]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
};
