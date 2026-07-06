import React, { useState, useEffect } from 'react';
import catPeek1 from '../../../assets/Cat_PasswordPeek1.svg';
import catPeek2 from '../../../assets/Cat_PasswordPeek2.svg';
import { TextField } from '../../ui/forms/TextField';

interface OnboardingScreen7Props {
  active: boolean;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  isTyping: boolean;
  showBubble: boolean;
  bubbleText: string;
  handleCreateProfileClick: () => void;
  handleBackClick: () => void;
  showKeyboardHint?: boolean;
}

export const OnboardingScreen7: React.FC<OnboardingScreen7Props> = ({
  active,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isTyping,
  showBubble,
  bubbleText,
  handleCreateProfileClick,
  handleBackClick,
  showKeyboardHint,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  // Cat ducks when any password field is revealed
  const isPasswordVisible = showPassword || showConfirmPassword;

  // Staggered intro: trigger after screen becomes active
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setIntroComplete(true), 80);
      return () => clearTimeout(t);
    } else {
      setIntroComplete(false);
    }
  }, [active]);

  return (
    <div className={`flex flex-col md:grid md:grid-cols-2 md:items-start justify-center items-center w-full max-w-5xl gap-6 md:gap-12 z-0 pt-6 pb-6 md:pb-28 transition-opacity duration-300 ease-in-out absolute ${
      active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* 1. ChatBubble & Mascot */}
      <div className={`md:col-start-2 md:row-start-1 md:row-span-2 flex-1 flex justify-center items-end relative transition-all duration-500 ease-out w-full ${
        introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {/* Speech Bubble */}
        {showBubble && (
          <div className="absolute -top-26 left-4 md:-top-18 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-20 animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        {/*
          Pure crossfade: both images sit at identical position.
          peek2 (notebook up / peeking) is the default — opacity 1.
          peek1 (notebook down / hiding) overlays it — opacity 0 by default.
          Toggling the password eye fades one out and the other in at the
          same position, making just the notebook appear to change state.
        */}
        <div className="relative w-36 h-36 md:w-[450px] md:h-[450px] select-none">
          {/* peek2 — notebook raised, cat peeking (default) */}
          <img
            src={catPeek2}
            alt="Cat mascot"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              opacity: isPasswordVisible ? 0 : 1,
              transition: 'opacity 400ms ease-in-out',
            }}
          />
          {/* peek1 — notebook lowered, cat hiding (shown on password reveal) */}
          <img
            src={catPeek1}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              opacity: isPasswordVisible ? 1 : 0,
              transition: 'opacity 400ms ease-in-out',
            }}
          />
        </div>
      </div>

      {/* 2. Password Fields */}
      <div className={`md:col-start-1 md:row-start-1 md:row-span-2 flex-1 w-full max-w-md flex flex-col justify-end pb-2 items-center md:items-stretch text-center md:text-left space-y-4 transition-all duration-500 delay-150 ease-out ${
        introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <label className="mb-2 block text-2xl text-slate-500 font-semibold pl-1">
          Set a Password
        </label>

        {/* Password field */}
        <TextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          disabled={isTyping || !active}
          autoComplete="new-password"
          reserveErrorSpace={false}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isTyping || !active}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />

        {/* Confirm Password field */}
        <TextField
          id="confirm-password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          disabled={isTyping || !active}
          autoComplete="new-password"
          reserveErrorSpace={false}
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              disabled={isTyping || !active}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      {/* Bottom Actions Overlay */}
      <div className={`w-full md:absolute md:bottom-2 left-0 flex flex-col items-center gap-4 z-0 mt-6 md:mt-0 transition-all duration-500 delay-300 ease-out ${
        introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
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
            onClick={handleCreateProfileClick}
            disabled={isTyping || !active}
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none flex flex-col items-center justify-center ${
              isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <span>Create Profile</span>
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#a0aec0]" />
        </div>
      </div>
    </div>
  );
};

/** Eye icon — password hidden */
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Eye-off icon — password visible */
function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
