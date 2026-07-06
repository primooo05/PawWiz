import React, { useRef, useEffect } from 'react';
import { useOnboardingContext } from '../../../context/OnboardingContext';

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

  // Refs for guard flags — mutations here never cause re-renders on their own.
  // This is critical: sessionStep/ownerEmail are outputs of fetchSession, so
  // putting them in the effect deps caused a re-trigger loop after every fetch.
  const loadingGuardRef = useRef(false);
  const lastCheckedStepRef = useRef<number | null>(null);
  const checkedRef = useRef(false);

  // Minimal forceUpdate so the spinner can appear/disappear without extra state.
  const [, forceUpdate] = React.useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    // Same step, already checked — nothing to do.
    if (checkedRef.current && lastCheckedStepRef.current === step) return;

    // Reset for the new step.
    checkedRef.current = false;
    lastCheckedStepRef.current = step;

    let active = true;

    const runGuard = async () => {
      // Step 1 is always the entry point — always allowed.
      if (step === 1) {
        checkedRef.current = true;
        forceUpdate();
        return;
      }

      // Steps 6–8 are pure client-side transitions validated earlier in the
      // flow — skip the network round-trip entirely.
      if (step >= 6) {
        checkedRef.current = true;
        forceUpdate();
        return;
      }

      // No session on record → bounce back to start.
      if (!sessionId) {
        setStep(1);
        checkedRef.current = true;
        forceUpdate();
        return;
      }

      // Fast path: sessionStep is already populated and the URL step is within
      // normal progression range (allow +2 for single-cat skip from 5→7).
      if (sessionStep > 0 && step <= sessionStep + 2) {
        checkedRef.current = true;
        forceUpdate();
        return;
      }

      // Need a network confirmation — show the spinner.
      loadingGuardRef.current = true;
      forceUpdate();

      // Safety-net: bail out after 5 s if the API is unresponsive.
      const timeout = setTimeout(() => {
        if (!active) return;
        loadingGuardRef.current = false;
        checkedRef.current = true;
        setStep(1);
        forceUpdate();
      }, 5000);

      const data = await fetchSession(sessionId);
      clearTimeout(timeout);
      if (!active) return;

      loadingGuardRef.current = false;

      if (!data) {
        setStep(1);
      } else if (step > data.step) {
        setStep(data.step);
      }
      checkedRef.current = true;
      forceUpdate();
    };

    runGuard();

    return () => {
      active = false;
    };

    // Intentionally omit sessionStep, ownerEmail, fetchSession, setStep:
    //   - sessionStep / ownerEmail are *outputs* of fetchSession — including them
    //     would retrigger the guard immediately after it resolves, causing the loop.
    //   - fetchSession / setStep are stable useCallback refs that never change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sessionId]);

  if (loadingGuardRef.current || (step > 1 && step < 6 && !checkedRef.current)) {
    return (
      <div className="min-h-screen w-full bg-white bg-grid-pattern flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#30c290] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-extrabold text-lg tracking-wider animate-pulse">
          Syncing with Wiz...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
