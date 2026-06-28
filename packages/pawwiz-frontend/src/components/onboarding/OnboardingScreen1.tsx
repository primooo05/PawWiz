import React from 'react';
import catScreen1 from '../../assets/Cat_Screen1.svg';

interface OnboardingScreen1Props {
  active: boolean;
  handleCreateAccountClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleAlreadyHaveAccountClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  handleReturnToHome: () => void;
  isClicked: boolean;
  rippleStyle: React.CSSProperties | null;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  active,
  handleCreateAccountClick,
  handleAlreadyHaveAccountClick,
  handleReturnToHome,
  isClicked,
  rippleStyle,
}) => {
  return (
    <div className={`flex flex-col justify-center items-center w-full max-w-md z-10 absolute transition-opacity duration-300 ${
      active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Animated Cat Mascot */}
      <div className="animate-float mb-12 flex justify-center items-center">
        <img
          src={catScreen1}
          alt="PawWiz Mascot"
          className="w-64 h-64 md:w-80 md:h-80 object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Buttons and Navigation */}
      <div className="w-full flex flex-col items-center gap-4">
        <button
          onClick={handleCreateAccountClick}
          className="w-full max-w-[280px] bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3.5 px-6 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none"
        >
          Create Account
        </button>

        <a
          href="/login"
          onClick={handleAlreadyHaveAccountClick}
          className={`w-full max-w-[280px] bg-white hover:bg-slate-50 font-extrabold py-3.5 px-6 rounded-2xl text-center text-sm tracking-wider border-2 border-[#2ec4b6] shadow-[0_4px_0_0_#209f93] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer relative overflow-hidden block ${
            isClicked ? 'text-white' : 'text-[#2ec4b6]'
          }`}
        >
          <span className="relative z-10 transition-colors duration-200">Already have an account</span>
          {rippleStyle && (
            <span
              className="ripple-span"
              style={rippleStyle}
            />
          )}
        </a>

        {/* Progress Indicators */}
        <div className="flex gap-2.5 mt-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a0aec0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturnToHome}
          className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
