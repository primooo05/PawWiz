import React, { useState, useEffect, useRef } from 'react';
import catScreen7 from '../../assets/Cat_Screen7.svg';

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
}

/**
 * Eyelid animation keyframes (5 states, looping):
 * State 1 (Before Upper)  → State 2 (After Upper)  → State 3 (Mid Lower)
 * → State 4 (After Lower) → State 5 (Mid Lower)   → back to State 1
 */
interface EyelidState {
  // Upper eyelid left
  ulCx: number; ulCy: number; ulRx: number; ulRy: number;
  // Upper eyelid right
  urCx: number; urCy: number; urRx: number; urRy: number;
  // Lower eyelid left
  llCx: number; llCy: number; llRx: number; llRy: number;
  // Lower eyelid right
  lrCx: number; lrCy: number; lrRx: number; lrRy: number;
}

const EYELID_STATES: EyelidState[] = [
  // State 1: Before Upper Eyelid (just starting to close — minimal coverage)
  {
    ulCx: 40.5, ulCy: 47, ulRx: 15.5, ulRy: 4,
    urCx: 59.5, urCy: 47, urRx: 15.5, urRy: 4,
    llCx: 37.5, llCy: 51, llRx: 15.5, llRy: 4,
    lrCx: 49.5, lrCy: 41, lrRx: 15.5, lrRy: 4,
  },
  // State 2: After Upper Eyelid (upper lids descend)
  {
    ulCx: 40.5, ulCy: 48, ulRx: 15.5, ulRy: 10,
    urCx: 59.5, urCy: 47, urRx: 15.5, urRy: 10,
    llCx: 37.5, llCy: 51, llRx: 15.5, llRy: 4,
    lrCx: 49.5, lrCy: 41, lrRx: 15.5, lrRy: 4,
  },
  // State 3: Mid Lower Eyelid (lower lids rise)
  {
    ulCx: 40.5, ulCy: 48, ulRx: 15.5, ulRy: 10,
    urCx: 59.5, urCy: 47, urRx: 15.5, urRy: 10,
    llCx: 37.5, llCy: 51, llRx: 15.5, llRy: 10,
    lrCx: 49.5, lrCy: 41, lrRx: 15.5, lrRy: 10,
  },
  // State 4: After Lower Eyelid (fully closed — max coverage)
  {
    ulCx: 40.5, ulCy: 48, ulRx: 15.5, ulRy: 10,
    urCx: 59.5, urCy: 47, urRx: 15.5, urRy: 10,
    llCx: 37.5, llCy: 58, llRx: 15.5, llRy: 12,
    lrCx: 62.5, lrCy: 57, lrRx: 15.5, lrRy: 13,
  },
  // State 5: Mid Lower (same as State 3 — eyelids opening back up)
  {
    ulCx: 40.5, ulCy: 48, ulRx: 15.5, ulRy: 10,
    urCx: 59.5, urCy: 47, urRx: 15.5, urRy: 10,
    llCx: 37.5, llCy: 51, llRx: 15.5, llRy: 10,
    lrCx: 49.5, lrCy: 41, lrRx: 15.5, lrRy: 10,
  },
];

// Duration in ms for each transition between states.
// Longer hold at the "closed" state for a natural, sleepy blink rhythm.
// Sequence: 1→2 (closing top), 2→3 (closing bottom joins), 3→4 (fully shut),
//           4→5 (hold closed then start opening), 5→1 (fully open)
const FRAME_DURATIONS = [
  800,   // State 1 → 2: upper lids begin to drop (slow, deliberate)
  600,   // State 2 → 3: lower lids join in
  500,   // State 3 → 4: final close (a bit faster — gravity)
  1400,  // State 4 → 5: hold fully closed, then slowly start to open (restful)
  900,   // State 5 → 1: open back up gently
];

// Ease-in-out for smooth, organic motion
function easeInOut(t: number): number {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpState(from: EyelidState, to: EyelidState, t: number): EyelidState {
  return {
    ulCx: lerp(from.ulCx, to.ulCx, t),
    ulCy: lerp(from.ulCy, to.ulCy, t),
    ulRx: lerp(from.ulRx, to.ulRx, t),
    ulRy: lerp(from.ulRy, to.ulRy, t),
    urCx: lerp(from.urCx, to.urCx, t),
    urCy: lerp(from.urCy, to.urCy, t),
    urRx: lerp(from.urRx, to.urRx, t),
    urRy: lerp(from.urRy, to.urRy, t),
    llCx: lerp(from.llCx, to.llCx, t),
    llCy: lerp(from.llCy, to.llCy, t),
    llRx: lerp(from.llRx, to.llRx, t),
    llRy: lerp(from.llRy, to.llRy, t),
    lrCx: lerp(from.lrCx, to.lrCx, t),
    lrCy: lerp(from.lrCy, to.lrCy, t),
    lrRx: lerp(from.lrRx, to.lrRx, t),
    lrRy: lerp(from.lrRy, to.lrRy, t),
  };
}

function useEyelidAnimation(isAnimating: boolean): EyelidState {
  const [currentState, setCurrentState] = useState<EyelidState>(EYELID_STATES[0]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isAnimating) {
      setCurrentState(EYELID_STATES[0]);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    // Pre-compute cumulative durations for the cycle
    const totalCycleDuration = FRAME_DURATIONS.reduce((sum, d) => sum + d, 0);
    const cumulativeDurations: number[] = [];
    let sum = 0;
    for (const d of FRAME_DURATIONS) {
      cumulativeDurations.push(sum);
      sum += d;
    }

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const cycleTime = elapsed % totalCycleDuration;

      // Find which frame we're in
      let frameIndex = 0;
      for (let i = FRAME_DURATIONS.length - 1; i >= 0; i--) {
        if (cycleTime >= cumulativeDurations[i]) {
          frameIndex = i;
          break;
        }
      }

      const nextIndex = (frameIndex + 1) % EYELID_STATES.length;
      const frameDuration = FRAME_DURATIONS[frameIndex];
      const frameElapsed = cycleTime - cumulativeDurations[frameIndex];
      const rawT = Math.min(frameElapsed / frameDuration, 1);
      const t = easeInOut(rawT); // Apply easing for organic motion

      setCurrentState(lerpState(EYELID_STATES[frameIndex], EYELID_STATES[nextIndex], t));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAnimating]);

  return currentState;
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  // Cat closes eyes whenever any password field is revealed
  const isPasswordVisible = showPassword || showConfirmPassword;
  const eyelidState = useEyelidAnimation(isPasswordVisible);

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
      {/* 1. ChatBubble & Mascot SVG */}
      <div className={`md:col-start-2 md:row-start-1 md:row-span-2 flex-1 flex justify-center items-center relative transition-all duration-500 ease-out w-full ${
        introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {/* Speech Bubble — same design as other screens */}
        {showBubble && (
          <div className="absolute -top-26 left-4 md:-top-18 md:left-12 bg-white border-2 border-slate-900 px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_rgba(15,23,42,0.15)] text-slate-800 text-sm md:text-base font-extrabold max-w-[220px] md:max-w-[280px] z-[-10] animate-fade-in">
            <p className="leading-relaxed whitespace-pre-wrap">{bubbleText}</p>
            {/* Speech Bubble Tail */}
            <div className="absolute right-12 md:right-16 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
          </div>
        )}

        {/* Cat image — no floating animation at all on this screen */}
        <div className="relative">
          <img
            src={catScreen7}
            alt="Cat mascot"
            className="w-36 h-36 md:w-[450px] md:h-[450px] object-contain select-none"
            draggable={false}
          />
          {/* Animated eyelid overlay — loops through states when password is visible */}
          {isPasswordVisible && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              {/* Upper eyelid — left */}
              <ellipse
                cx={eyelidState.ulCx}
                cy={eyelidState.ulCy}
                rx={eyelidState.ulRx}
                ry={eyelidState.ulRy}
                fill="black"
                opacity="1"
              />
              {/* Upper eyelid — right */}
              <ellipse
                cx={eyelidState.urCx}
                cy={eyelidState.urCy}
                rx={eyelidState.urRx}
                ry={eyelidState.urRy}
                fill="black"
                opacity="1"
              />
              {/* Lower eyelid — left */}
              <ellipse
                cx={eyelidState.llCx}
                cy={eyelidState.llCy}
                rx={eyelidState.llRx}
                ry={eyelidState.llRy}
                fill="black"
                opacity="1"
              />
              {/* Lower eyelid — right */}
              <ellipse
                cx={eyelidState.lrCx}
                cy={eyelidState.lrCy}
                rx={eyelidState.lrRx}
                ry={eyelidState.lrRy}
                fill="black"
                opacity="1"
              />
            </svg>
          )}
        </div>
      </div>

      {/* 2. Password Fields */}
      <div className={`md:col-start-1 md:row-start-1 md:row-span-2 flex-1 w-full max-w-md flex flex-col justify-center items-center md:items-stretch text-center md:text-left space-y-4 transition-all duration-500 delay-150 ease-out ${
        introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <label className="text-xl md:text-2xl text-slate-400 font-extrabold italic pl-1 tracking-wide text-center md:text-left">
          Set a Password
        </label>

        {/* Password field */}
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full px-5 py-3.5 pr-12 bg-[#2ec4b6] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-40"
            disabled={isTyping || !active}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={isTyping || !active}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {/* Confirm Password field */}
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-5 py-3.5 pr-12 bg-[#2ec4b6] border-none rounded-2xl outline-none text-white font-semibold placeholder:text-teal-100/70 shadow-sm transition-all focus:ring-2 focus:ring-[#2ec4b6] focus:ring-opacity-40"
            disabled={isTyping || !active}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            disabled={isTyping || !active}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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
            className={`w-1/2 bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3 px-8 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer border-none ${
              isTyping || !active ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Create Profile
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
