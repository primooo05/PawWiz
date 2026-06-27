import React from 'react';
import catClean2 from '../../assets/Cat_Clean2.svg';

interface OnboardingScreen2Props {
  active: boolean;
  ownerName: string;
  setOwnerName: (name: string) => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleNextClick: () => void;
  handleBackClick: () => void;
}

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({
  active,
  ownerName,
  setOwnerName,
  isTyping,
  showBubble,
  bubbleText,
  handleNextClick,
  handleBackClick,
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-center items-center w-full max-w-5xl gap-12 z-10 pt-6 pb-36 md:pb-28 transition-all duration-[2000ms] ease-in-out absolute ${active ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}>
      {/* Left Column: Form Info */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center items-start text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          What's your name?
        </h1>
        <p className="text-base md:text-lg text-slate-600 font-medium">
          So we know what to call you, our fur parent
        </p>
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Your Name (e.g., Ayla)"
          className="w-full px-5 py-4 border-2 border-[#2ec4b6] rounded-2xl outline-none focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-20 text-slate-800 font-semibold placeholder-slate-400 bg-white shadow-sm transition-all"
          disabled={isTyping || !active}
        />
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
            src={catClean2}
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
            className={`w-1/2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider cursor-pointer transition-all ${isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            Back
          </button>

          <button
            onClick={handleNextClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none ${isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
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
