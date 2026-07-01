import { useState, useEffect } from 'react';
import { getResolvedCatsCount, getOtherCatsText } from './useOnboardingValidation';

export const ONBOARDING_MESSAGES: Record<number, (sessionStep: number, catsCount: string, customCatsCount: string, catsAdded: number) => string> = {
  3: (sessionStep) => sessionStep >= 3
    ? 'Welcome back! Enter your verification code or resend if needed.'
    : 'Check your email for a 6-digit verification code!',
  4: () => 'How many cats do you have?',
  5: () => 'Wiz would like to know them!',
  6: () => 'How old is your Cat? Meow',
  7: (_, catsCount, customCatsCount, catsAdded) => {
    const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
    return catsAdded >= totalCats
      ? `You only have ${totalCats} remember? You can add more later!`
      : `Would you like to create a separate profile for other ${getOtherCatsText(catsCount, customCatsCount)}?`;
  },
  8: () => "Enter your strongest password you can think of! Just make sure you don't forget! meow",
};

export function getStepMessage(step: number, sessionStep: number, catsCount: string, customCatsCount: string, catsAdded: number): string | null {
  const messageGetter = ONBOARDING_MESSAGES[step];
  if (!messageGetter) return null;
  return messageGetter(sessionStep, catsCount, customCatsCount, catsAdded);
}

interface UseOnboardingStateProps {
  step: number;
  isTyping: boolean;
  handleNextClick: () => Promise<void>;
}

export function useOnboardingState({ step, isTyping, handleNextClick }: UseOnboardingStateProps) {
  // Dirty flags
  const [isStep2Dirty, setIsStep2Dirty] = useState(false);
  const [isStep3Dirty, setIsStep3Dirty] = useState(false);
  const [isStep4Dirty, setIsStep4Dirty] = useState(false);
  const [isStep5Dirty, setIsStep5Dirty] = useState(false);
  const [isStep6Dirty, setIsStep6Dirty] = useState(false);

  // Input focus tracking
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Focus & blur listeners
  useEffect(() => {
    const handleFocus = () => {
      const activeEl = document.activeElement;
      setIsInputFocused(!!(activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')));
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleFocus, true);
    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleFocus, true);
    };
  }, []);

  // Keyboard navigation (Enter key progression)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (step < 2 || step > 8) return;

      const target = document.activeElement;
      const isField = !!(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'));

      if (isTyping || isField) return;

      e.preventDefault();
      void handleNextClick();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isTyping, handleNextClick]);

  return {
    isStep2Dirty,
    setIsStep2Dirty,
    isStep3Dirty,
    setIsStep3Dirty,
    isStep4Dirty,
    setIsStep4Dirty,
    isStep5Dirty,
    setIsStep5Dirty,
    isStep6Dirty,
    setIsStep6Dirty,
    isInputFocused,
  };
}
