import React, { createContext, useContext, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboarding } from '../hooks/onboarding/useOnboarding';

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
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  catsAdded: number;
  setCatsAdded: (v: number | ((prev: number) => number)) => void;

  // API methods
  initializeSession: () => Promise<any>;
  fetchSession: (id: string) => Promise<any>;
  submitStep: (step: number, data: any) => Promise<boolean>;
  sendOtp: (id: string) => Promise<{ cooldownSeconds: number } | null>;
  verifyOtp: (id: string, code: string) => Promise<boolean>;
  checkEmail: (email: string) => Promise<boolean>;
  resetSession: () => void;
  pendingCats: Array<{ catName: string; catBreed: string; catMarking: string; catSex: string; catLifeStage: string }>;
  addPendingCat: (cat: { catName: string; catBreed: string; catMarking: string; catSex: string; catLifeStage: string }) => void;

  // Navigation
  step: number;
  setStep: (newStep: number | ((prev: number) => number)) => void;
}

const OnboardingCtx = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onboarding = useOnboarding();

  // Password state (local to frontend, never persisted to backend session)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Track how many cats the user has actually added profiles for.
  // Restored from localStorage so a page refresh doesn't reset the counter.
  const [catsAdded, setCatsAdded] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('pawwiz_cats_added');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Clamp step to valid range [1..8]
  const rawStep = parseInt(searchParams.get('step') || '1', 10);
  const step = Number.isNaN(rawStep) || rawStep < 1 || rawStep > 8 ? 1 : rawStep;

  const setCatsAddedPersisted = (v: number | ((prev: number) => number)) => {
    setCatsAdded((prev) => {
      const next = typeof v === 'function' ? v(prev) : v;
      localStorage.setItem('pawwiz_cats_added', String(next));
      return next;
    });
  };

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
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        catsAdded,
        setCatsAdded: setCatsAddedPersisted,
        initializeSession: onboarding.initializeSession,
        fetchSession: onboarding.fetchSession,
        submitStep: onboarding.submitStep,
        sendOtp: onboarding.sendOtp,
        verifyOtp: onboarding.verifyOtp,
        checkEmail: onboarding.checkEmail,
        resetSession: onboarding.resetSession,
        pendingCats: onboarding.pendingCats,
        addPendingCat: onboarding.addPendingCat,
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
