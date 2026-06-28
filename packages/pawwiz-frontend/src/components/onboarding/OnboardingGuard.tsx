import React, { useState, useEffect } from 'react';
import { useOnboardingContext } from '../../context/OnboardingContext';

/**
 * Route guard HOC that wraps the onboarding view.
 * Prevents step tampering by validating the URL step against
 * the server-side session step. Shows a loading spinner while checking.
 */

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { step, setStep, sessionId, sessionStep, fetchSession } = useOnboardingContext();

  const [loadingGuard, setLoadingGuard] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const runGuard = async () => {
      // Step 1 always allowed (entry point)
      if (step === 1) {
        if (active) setInitialChecked(true);
        return;
      }

      // No session → force back to step 1
      if (!sessionId) {
        if (active) {
          setStep(1);
          setInitialChecked(true);
        }
        return;
      }

      // Skip redundant network requests during active navigation
      if (initialChecked && step <= sessionStep) {
        return;
      }

      // Client-side fast rejection: step ahead of known session progress
      if (initialChecked && sessionStep > 0 && step > sessionStep) {
        if (active) setStep(sessionStep);
        return;
      }

      if (active) setLoadingGuard(true);

      // Safety-net timeout: if the network call takes too long, fall back to step 1
      const timeout = setTimeout(() => {
        if (active) {
          setLoadingGuard(false);
          setStep(1);
          setInitialChecked(true);
        }
      }, 5000);

      const data = await fetchSession(sessionId);
      clearTimeout(timeout);
      if (!active) return;
      setLoadingGuard(false);

      if (!data) {
        setStep(1);
      } else if (step > data.step) {
        setStep(data.step);
      }
      setInitialChecked(true);
    };

    runGuard();

    return () => {
      active = false;
    };
  }, [step, sessionId, fetchSession, initialChecked, sessionStep, setStep]);

  // Show spinner while guarding
  const isStepAhead = initialChecked && sessionStep > 0 && step > sessionStep;

  if (loadingGuard || (step > 1 && !initialChecked) || isStepAhead) {
    return (
      <div className="min-h-screen w-full bg-white bg-grid-pattern flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#2ec4b6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-extrabold text-lg tracking-wider animate-pulse">
          Syncing with Wiz...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
