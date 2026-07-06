import React from 'react';
import catClean2 from '../../../assets/Cat_Clean2.svg';
import { TextField } from '../../ui/forms/TextField';

interface OnboardingScreenOtpProps {
  active: boolean;
  otpCode: string;
  setOtpCode: (code: string) => void;
  cooldownRemaining: number;
  onResendClick: () => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleNextClick: () => void;
  handleBackClick: () => void;
  showKeyboardHint?: boolean;
}

export const OnboardingScreenOtp: React.FC<OnboardingScreenOtpProps> = ({
  active,
  otpCode,
  setOtpCode,
  cooldownRemaining,
  onResendClick,
  isTyping,
  showBubble,
  bubbleText,
  handleNextClick,
  handleBackClick,
  showKeyboardHint,
}) => {
  return (
    <div className={`flex flex-col md:grid md:grid-cols-2 md:items-start justify-center items-center w-full max-w-5xl gap-6 md:gap-12 z-0 pt-6 pb-6 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${
      active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* 1. Header & Paragraph — hidden on mobile (mascot column takes full width) */}
      <div className="hidden md:flex md:col-start-1 md:row-start-1 flex-col justify-center items-center md:items-start text-center md:text-left space-y-6 w-full max-w-md">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Verify your email
        </h1>
        <p className="text-sm md:text-lg text-slate-600 font-medium">
          We sent a 6-digit code to your email. Enter it below to continue.
        </p>
      </div>

      {/* Mobile-only compact header — sits above the mascot, no overlap */}
      <div className="md:hidden flex flex-col items-center text-center space-y-2 w-full max-w-md px-2">
        <h1 className="text-2xl font-black text-slate-900 leading-tight">
          Verify your email
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          We sent a 6-digit code to your email.
        </p>
      </div>

      {/* 2. ChatBubble & Mascot SVG */}
      <div className="md:col-start-2 md:row-start-1 md:row-span-2 flex justify-center items-center relative w-full">
        {/* Custom Speech Bubble — hidden on mobile to avoid overlapping the mascot */}
        {showBubble && (
          <div className="hidden md:block absolute -top-4 left-4 md:-top-16 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-10 animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        <div className="animate-float">
          <img
            src={catClean2}
            alt="Cat mascot"
            className="w-36 h-36 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 3. Inputs */}
      <div className="md:col-start-1 md:row-start-2 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6 w-full max-w-md">
        <TextField
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          autoComplete="one-time-code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="text-center text-2xl tracking-[0.3em] placeholder:tracking-normal placeholder:text-lg"
          disabled={isTyping || !active}
          aria-label="OTP verification code"
          reserveErrorSpace={false}
        />
        <button
          type="button"
          onClick={onResendClick}
          disabled={cooldownRemaining > 0 || isTyping || !active}
          className={`text-sm font-bold transition-colors ${
            cooldownRemaining > 0 || isTyping || !active
              ? 'text-slate-400 cursor-not-allowed opacity-60'
              : 'text-[#2ec4b6] hover:text-[#1b9e91] cursor-pointer'
          } bg-transparent border-none`}
          aria-label={cooldownRemaining > 0 ? `Resend code available in ${cooldownRemaining} seconds` : 'Resend code'}
        >
          {cooldownRemaining > 0 ? `Resend Code (${cooldownRemaining}s)` : 'Resend Code'}
        </button>
      </div>

      {/* 4. Bottom Actions Overlay */}
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#30c290]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
};
