import React, { createContext, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * OnboardingContext provides only the SHARED session-level state
 * (sessionId, step navigation, API calls). Local UI state (form values,
 * dirty flags, transitions) stays in individual screen components.
 */

interface OnboardingContextValue {
  // Session state
  sessionId: string | null;
  sessionStep: number;
  loading: boolean;
  error: string | null;

  // Form state (shared so screens can resume from fetched data)
  ownerName: string;
  setOwnerName: (v: string) => void;
  ownerEmail: string;
  setOwnerEmail: (v: string) => void;
  catsCount: string;
  setCatsCount: (v: string) => void;
  customCatsCount: string;
  setCustomCatsCount: (v: string) => void;
  catName: string;
  setCatName: (v: string) => void;
  catBreed: string;
  setCatBreed: (v: string) => void;
  catMarking: string;
  setCatMarking: (v: string) => void;
  catSex: string;
  setCatSex: (v: string) => void;
  catLifeStage: string;
  setCatLifeStage: (v: string) => void;

  // API methods
  initializeSession: () => Promise<any>;
  fetchSession: (id: string) => Promise<any>;
  submitStep: (step: number, data: any) => Promise<boolean>;

  // Navigation
  step: number;
  setStep: (newStep: number | ((prev: number) => number)) => void;
}

const OnboardingCtx = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onboarding = useOnboarding();

  // Clamp step to valid range [1..6]
  const rawStep = parseInt(searchParams.get('step') || '1', 10);
  const step = Number.isNaN(rawStep) || rawStep < 1 || rawStep > 6 ? 1 : rawStep;

  const setStep = useCallback(
    (newStep: number | ((prev: number) => number)) => {
      const nextStep = typeof newStep === 'function' ? newStep(step) : newStep;
      setSearchParams({ step: nextStep.toString() });
    },
    [step, setSearchParams]
  );

  return (
    <OnboardingCtx.Provider
      value={{
        sessionId: onboarding.sessionId,
        sessionStep: onboarding.sessionStep,
        loading: onboarding.loading,
        error: onboarding.error,
        ownerName: onboarding.ownerName,
        setOwnerName: onboarding.setOwnerName,
        ownerEmail: onboarding.ownerEmail,
        setOwnerEmail: onboarding.setOwnerEmail,
        catsCount: onboarding.catsCount,
        setCatsCount: onboarding.setCatsCount,
        customCatsCount: onboarding.customCatsCount,
        setCustomCatsCount: onboarding.setCustomCatsCount,
        catName: onboarding.catName,
        setCatName: onboarding.setCatName,
        catBreed: onboarding.catBreed,
        setCatBreed: onboarding.setCatBreed,
        catMarking: onboarding.catMarking,
        setCatMarking: onboarding.setCatMarking,
        catSex: onboarding.catSex,
        setCatSex: onboarding.setCatSex,
        catLifeStage: onboarding.catLifeStage,
        setCatLifeStage: onboarding.setCatLifeStage,
        initializeSession: onboarding.initializeSession,
        fetchSession: onboarding.fetchSession,
        submitStep: onboarding.submitStep,
        step,
        setStep,
      }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) {
    throw new Error('useOnboardingContext must be used within <OnboardingProvider>');
  }
  return ctx;
}
