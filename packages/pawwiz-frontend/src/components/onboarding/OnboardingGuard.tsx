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
  const { step, setStep, sessionId, sessionStep, fetchSession, ownerEmail } = useOnboardingContext();

  const [loadingGuard, setLoadingGuard] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const runGuard = async () => {
      console.log('runGuard triggered:', { step, sessionId, ownerEmail, sessionStep });
      // Step 1 always allowed (entry point)
      if (step === 1) {
        if (active) setInitialChecked(true);
        return;
      }

      // Steps 6–8 are client-side transitions only; session is already validated
      // by the time the user reaches step 5. No network round-trip needed and no
      // spinner should ever appear for these steps, unless we need to hydrate state on refresh.
      if (step >= 6) {
        if (sessionId && !ownerEmail) {
          // Hydrate the session state on page refresh
        } else {
          if (active) setInitialChecked(true);
          return;
        }
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

      // Client-side fast rejection: step ahead of known session progress.
      // Allow up to sessionStep + 2 through — covers both single-step and
      // two-step progressions (e.g. step 5 → 7 for single-cat users) where
      // the URL has advanced but sessionStep state has not yet flushed.
      const isNormalProgression = step <= sessionStep + 2;
      if (initialChecked && sessionStep > 0 && step > sessionStep && !isNormalProgression) {
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
  }, [step, sessionId, fetchSession, initialChecked, sessionStep, setStep, ownerEmail]);

  // Show spinner only while fetching session data for steps 2–5.
  // Steps 6–8 short-circuit above and never reach this render gate.
  const isNormalProgression = step <= sessionStep + 2;
  const isStepAhead = step < 6 && initialChecked && sessionStep > 0 && step > sessionStep && !isNormalProgression;

  if (loadingGuard || (step > 1 && step < 6 && !initialChecked) || isStepAhead) {
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
