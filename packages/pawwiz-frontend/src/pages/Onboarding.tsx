import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircleWrapper } from '../components/ui/CircleWrapper';
import { OnboardingScreen1 } from '../components/features/onboarding/OnboardingScreen1';
import { OnboardingScreen2 } from '../components/features/onboarding/OnboardingScreen2';
import { OnboardingScreenOtp } from '../components/features/onboarding/OnboardingScreenOtp';
import { OnboardingScreen3 as OnboardingScreenCats } from '../components/features/onboarding/OnboardingScreen3';
import { OnboardingScreen4 as OnboardingScreenCatDetails } from '../components/features/onboarding/OnboardingScreen4';
import { OnboardingScreen5 as OnboardingScreenLifeStage } from '../components/features/onboarding/OnboardingScreen5';
import { OnboardingScreen6 as OnboardingScreenCatAdded } from '../components/features/onboarding/OnboardingScreen6';
import { OnboardingScreen7 as OnboardingScreenPassword } from '../components/features/onboarding/OnboardingScreen7';
import { OnboardingGuard } from '../components/features/onboarding/OnboardingGuard';
import { OnboardingProvider, useOnboardingContext } from '../context/OnboardingContext';
import { useTypewriter } from '../hooks/ui/useTypewriter';
import {
  validateStep2,
  validateStep3Otp,
  validateStep3 as validateStepCats,
  validateStep4 as validateStepCatDetails,
  validateStep5 as validateStepLifeStage,
  validateStep7 as validateStepPassword,
  getResolvedCatsCount,
} from '../hooks/onboarding/useOnboardingValidation';
import { supabase } from '../lib/supabase';
import { useOnboardingState, getStepMessage } from '../hooks/onboarding/useOnboardingState';

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingGuard>
        <OnboardingView />
      </OnboardingGuard>
    </OnboardingProvider>
  );
}

function OnboardingView() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    step,
    setStep,
    sessionId,
    sessionStep,
    ownerName,
    setOwnerName,
    ownerEmail,
    setOwnerEmail,
    catsCount,
    setCatsCount,
    customCatsCount,
    setCustomCatsCount,
    catName,
    setCatName,
    catBreed,
    setCatBreed,
    catMarking,
    setCatMarking,
    catSex,
    setCatSex,
    catLifeStage,
    setCatLifeStage,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    catsAdded,
    setCatsAdded,
    initializeSession,
    submitStep,
    sendOtp,
    verifyOtp,
    checkEmail,
    fetchSession,
  } = useOnboardingContext();

  const { bubbleText, isTyping, showBubble, startTyping, showStaticBubble, hideBubble, reset: resetBubble } = useTypewriter();

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transition state for the circular scale animation
  const zIndexTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isZIndexHigh, setIsZIndexHigh] = useState(!!(location.state as { animateIn?: boolean })?.animateIn);
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  // Ripple effect for "Already have an account" link
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // OTP cooldown countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Auto-send OTP when landing on step 3 for the FIRST time only.
  // We track via sessionStep: if the server has already unlocked step 3,
  // it means an OTP was already sent. We only auto-send when transitioning
  // from step 2 → step 3 within the same session (sessionStep < 3).
  // Returning users (sessionStep >= 3) must explicitly click "Resend code".
  const otpAutoSentRef = useRef(false);
  useEffect(() => {
    // Only auto-send when:
    // 1. We're on step 3 (OTP screen)
    // 2. We have a valid session
    // 3. No cooldown is active (prevents double-sends if user navigates away and back quickly)
    // 4. We haven't already auto-sent in this mount cycle
    // 5. The server hasn't already progressed past step 2 (i.e., this is a fresh OTP request, not a return visit)
    if (step === 3 && sessionId && otpCooldown === 0 && !otpAutoSentRef.current && sessionStep < 3) {
      otpAutoSentRef.current = true;
      // Fire-and-forget: we don't need to await this
      void (async () => {
        try {
          const result = await sendOtp(sessionId);
          if (result) {
            setOtpCooldown(result.cooldownSeconds);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Could not send code. Try again, meow!';
          showStaticBubble(message);
          setTimeout(() => hideBubble(), 3000);
        }
      })();
    }
    // Reset the ref only when leaving the onboarding flow entirely (step 1)
    if (step === 1) {
      otpAutoSentRef.current = false;
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    // Intentionally excluded: otpCooldown (we only care about initial state),
    // sendOtp/showStaticBubble/hideBubble (stable from context/hooks)
  }, [step, sessionId, sessionStep]);

  // Clear animateIn state on mount
  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        { if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current); zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 800); };
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Show static bubble when entering steps 3-8
  useEffect(() => {
    if (isTransitioning) return;
    const msg = getStepMessage(step, sessionStep, catsCount, customCatsCount, catsAdded);
    if (msg) {
      showStaticBubble(msg);
    }
  }, [step, isTransitioning, catsCount, customCatsCount, catsAdded, sessionStep, showStaticBubble]);

  // --- Navigation helpers ---

  const transitionTo = (nextStep: number) => {
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    setTimeout(() => {
      resetBubble();
      setStep(nextStep);
      setIsTransitioning(false);
      if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current);
      zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 800);
    }, 800);
  };

  const handleBackClick = () => {
    if (isTyping) return;

    // Custom back navigation based on current step
    if (step === 8) {
      // Going back from step 8: go to step 7 if multi-cat, else step 6
      const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
      transitionTo(totalCats > 1 ? 7 : 6);
    } else {
      transitionTo(step - 1);
    }
  };

  const handleAlreadyHaveAccountClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isClicked || isTransitioning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRippleStyle({ width: `${size}px`, height: `${size}px`, left: `${x}px`, top: `${y}px` });
    setIsClicked(true);

    await new Promise((resolve) => setTimeout(resolve, 450));
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    await new Promise((resolve) => setTimeout(resolve, 2000));

    navigate('/login', { state: { animateIn: true } });
  };

  const handleCreateAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    await initializeSession();
    setTimeout(() => {
      setStep(2);
      setIsTransitioning(false);
      { if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current); zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 800); };
    }, 800);
  };

  const handleReturnToHome = () => {
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    setTimeout(() => navigate('/', { state: { animateOut: true } }), 2000);
  };

  const handleAddOtherBabies = () => {
    if (isTyping) return;

    const totalCats = getResolvedCatsCount(catsCount, customCatsCount);

    // If user already added the max number of cats they indicated, show fallback message
    if (catsAdded >= totalCats) {
      showStaticBubble(`You only have ${totalCats} remember? You can add more later!`);
      return;
    }

    { setIsTransitioning(true); setIsZIndexHigh(true); }
    setTimeout(() => {
      resetBubble();
      setCatName('');
      setCatBreed('');
      setCatMarking('');
      setCatSex('');
      setCatLifeStage('');
      setStep(5);
      setIsTransitioning(false);
      if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current);
      zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 800);
    }, 800);
  };

  // --- OTP helpers ---

  const handleSendOtp = async () => {
    if (!sessionId) return;
    try {
      const result = await sendOtp(sessionId);
      if (result) {
        setOtpCooldown(result.cooldownSeconds);
      }
    } catch (err: any) {
      showStaticBubble(err.message || 'Could not send code. Try again, meow!');
      setTimeout(() => hideBubble(), 3000);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || isTyping) return;
    try {
      const result = await sendOtp(sessionId!);
      if (result) {
        setOtpCooldown(result.cooldownSeconds);
        showStaticBubble('New code sent! Check your inbox, meow!');
        setTimeout(() => hideBubble(), 3000);
      }
    } catch (err: any) {
      showStaticBubble(err.message || 'Could not resend. Try again, meow!');
      setTimeout(() => hideBubble(), 3000);
    }
  };

  // --- Step submission with typewriter ---

  const handleNextClick = async () => {
    if (isTyping || isSubmitting) return;

    if (step === 2) {
      // Fast-path: already completed and no changes
      if (sessionStep > 2 && !isStep2Dirty) {
        transitionTo(3);
        return;
      }

      const result = validateStep2(ownerName, ownerEmail);
      if (result.isValid) {
        const emailTaken = await checkEmail(ownerEmail.trim());
        if (emailTaken) {
          showStaticBubble('Email already exists, meow');
          setTimeout(() => hideBubble(), 3000);
          return;
        }
      }

      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(2, { ownerName: ownerName.trim(), ownerEmail: ownerEmail.trim() });
            if (success) {
              setIsStep2Dirty(false);
              // Send OTP immediately on advancing to step 3
              setTimeout(async () => {
                transitionTo(3);
                // Small delay to let step render first
                setTimeout(() => handleSendOtp(), 200);
              }, 300);
            } else {
              showStaticBubble("Oh no, I couldn't save your name. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 3) {
      // OTP verification step
      if (sessionStep > 3 && !isStep3Dirty) {
        transitionTo(4);
        return;
      }

      const result = validateStep3Otp(otpCode);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const ok = await verifyOtp(sessionId!, otpCode);
            if (ok) {
              setIsStep3Dirty(false);
              setTimeout(() => transitionTo(4), 300);
            } else {
              showStaticBubble('Wrong code or expired. Try again, meow!');
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 4) {
      // Cats count (was step 3)
      if (sessionStep > 4 && !isStep4Dirty) {
        transitionTo(5);
        return;
      }

      const result = validateStepCats(catsCount, customCatsCount);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(4, { catsCount, customCatsCount });
            if (success) {
              setIsStep4Dirty(false);
              setTimeout(() => transitionTo(5), 300);
            } else {
              showStaticBubble("Oh no, I couldn't save the cat count. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 5) {
      // Cat details (was step 4)
      if (sessionStep > 5 && !isStep5Dirty) {
        transitionTo(6);
        return;
      }

      const result = validateStepCatDetails(catName, catSex);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(5, { catName, catBreed, catMarking, catSex });
            if (success) {
              setIsStep5Dirty(false);
              setTimeout(() => transitionTo(6), 300);
            } else {
              showStaticBubble("Oh no, I couldn't save your cat details. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 6) {
      // Life stage (was step 5)
      if (sessionStep > 6 && !isStep6Dirty) {
        // Determine next step based on cat count
        const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
        transitionTo(totalCats > 1 ? 7 : 8);
        return;
      }

      const result = validateStepLifeStage(catLifeStage);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(6, { catLifeStage });
            if (success) {
              setIsStep6Dirty(false);
              // Increment cats added counter
              setCatsAdded((prev: number) => prev + 1);
              // If only 1 cat, skip step 7 and go directly to step 8
              const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
              const nextStep = totalCats > 1 ? 7 : 8;
              setTimeout(() => transitionTo(nextStep), 300);
            } else {
              showStaticBubble("Oh no, I couldn't save your cat's life stage. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 7) {
      // "Create Profile" on step 7 now transitions to step 8 (password)
      transitionTo(8);
    } else if (step === 8) {
      // Password (was step 7)
      const result = validateStepPassword(password, confirmPassword);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            await handleAccountCreation();
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    }
  };

  const handleAccountCreation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // ownerEmail and ownerName live in useOnboarding state. If the user navigated
      // through steps ≥ 6 without a page refresh the guard skips fetchSession, so
      // these may be empty. Fetch the session once to restore all fields.
      let resolvedEmail = ownerEmail?.trim();
      let resolvedName = ownerName?.trim();
      if ((!resolvedEmail || !resolvedName) && sessionId) {
        const data = await fetchSession(sessionId);
        resolvedEmail = data?.ownerEmail?.trim() ?? resolvedEmail ?? '';
        resolvedName = data?.ownerName?.trim() ?? resolvedName ?? '';
      }

      if (!resolvedEmail || !password?.trim()) {
        showStaticBubble('Please re-enter your password — it was lost on refresh. Meow!');
        setTimeout(() => hideBubble(), 4000);
        setIsSubmitting(false);
        return;
      }

      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: resolvedEmail,
        password: password,
      });
      if (authError) {
        throw new Error(authError.message);
      }
      if (!authData.user) throw new Error('Failed to create account');

      // Supabase may return no session when the project has email confirmation
      // enabled — even though the user's email was already verified via OTP in
      // this flow. Recover by signing in immediately with the credentials they
      // just provided to obtain a live session.
      const redirectTo = (location.state as any)?.redirectTo || '/dashboard';
      let session = authData.session;
      if (!session) {
        // Guard: duplicate email surfaces here as identities: []
        if ((authData.user.identities ?? []).length === 0) {
          throw new Error('Something went wrong. Please try again.');
        }
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password: password,
        });
        if (signInError || !signInData.session) {
          throw new Error(signInError?.message || 'Failed to acquire verified session.');
          // Account is created and email is verified — just send them through.
          navigate(redirectTo, { state: { displayName: resolvedName, catName } });
          return;
        }
        session = signInData.session;
      }

      // Create profile on backend
      const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          supabaseUserId: authData.user.id,
          displayName: resolvedName,
          onboardingSessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create profile');
      }

      // Success — navigate to pregnancy tracker setup or other module
      localStorage.removeItem('pawwiz_onboarding_session_id');
      startTyping("Meow-velous! Your account is ready! Redirecting...", {
        onComplete: () => {
          setIsTransitioning(true);
          setIsZIndexHigh(true);
          setTimeout(() => navigate(redirectTo, { state: { displayName: resolvedName, catName, animateIn: true } }), 2000);
        },
      });
    } catch (err: any) {
      showStaticBubble(err.message || "Something went wrong creating your account. Try again!");
      setTimeout(() => hideBubble(), 4000);
      setIsSubmitting(false);
    }
  };


  const {
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
  } = useOnboardingState({ step, isTyping, handleNextClick });

  return (
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative z-0 overflow-hidden flex flex-col justify-between items-center py-12 px-6">
      {/* Decorative Circles */}
      <CircleWrapper isTransitioning={isTransitioning} isZIndexHigh={isZIndexHigh} />

      {/* Center Wrapper
           - isTransitioning: circles fully cover screen → invisible (no paint at all, prevents flash)
           - isZIndexHigh only: circles retreating → opacity-0 so child entrance transitions
             have a visible parent to animate against once opacity lifts with isZIndexHigh */}
      <div className={`relative w-full flex-grow flex items-center justify-center transition-opacity duration-150 ${
        isTransitioning
          ? 'z-0 invisible opacity-0'
          : isZIndexHigh
            ? 'z-0 opacity-0'
            : 'z-10 opacity-100'
      }`}>
        <OnboardingScreen1
          active={step === 1 && !isTransitioning}
          handleCreateAccountClick={handleCreateAccountClick}
          handleAlreadyHaveAccountClick={handleAlreadyHaveAccountClick}
          handleReturnToHome={handleReturnToHome}
          isClicked={isClicked}
          rippleStyle={rippleStyle}
        />
        <OnboardingScreen2
          active={step === 2 && !isTransitioning}
          ownerName={ownerName}
          setOwnerName={(v) => { setOwnerName(v); setIsStep2Dirty(true); }}
          ownerEmail={ownerEmail}
          setOwnerEmail={(v) => { setOwnerEmail(v); setIsStep2Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 2}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenOtp
          active={step === 3 && !isTransitioning}
          otpCode={otpCode}
          setOtpCode={(v) => { setOtpCode(v); setIsStep3Dirty(true); }}
          cooldownRemaining={otpCooldown}
          onResendClick={handleResendOtp}
          isTyping={isTyping}
          showBubble={showBubble && step === 3}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenCats
          active={step === 4 && !isTransitioning}
          catsCount={catsCount}
          setCatsCount={(v) => { setCatsCount(v); setIsStep4Dirty(true); }}
          customCatsCount={customCatsCount}
          setCustomCatsCount={(v) => { setCustomCatsCount(v); setIsStep4Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 4}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenCatDetails
          active={step === 5 && !isTransitioning}
          catName={catName}
          setCatName={(v) => { setCatName(v); setIsStep5Dirty(true); }}
          catBreed={catBreed}
          setCatBreed={(v) => { setCatBreed(v); setIsStep5Dirty(true); }}
          catMarking={catMarking}
          setCatMarking={(v) => { setCatMarking(v); setIsStep5Dirty(true); }}
          catSex={catSex}
          setCatSex={(v) => { setCatSex(v); setIsStep5Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 5}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenLifeStage
          active={step === 6 && !isTransitioning}
          catLifeStage={catLifeStage}
          setCatLifeStage={(v) => { setCatLifeStage(v); setIsStep6Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 6}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenCatAdded
          active={step === 7 && !isTransitioning}
          catName={catName}
          catsCount={catsCount}
          customCatsCount={customCatsCount}
          catsAdded={catsAdded}
          isTyping={isTyping}
          showBubble={showBubble && step === 7}
          bubbleText={bubbleText}
          handleCreateProfileClick={handleNextClick}
          handleBackClick={handleBackClick}
          handleAddOtherBabies={handleAddOtherBabies}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
        <OnboardingScreenPassword
          active={step === 8 && !isTransitioning}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isTyping={isTyping}
          showBubble={showBubble && step === 8}
          bubbleText={bubbleText}
          handleCreateProfileClick={handleNextClick}
          handleBackClick={handleBackClick}
          showKeyboardHint={!isTyping && !isInputFocused}
        />
      </div>
    </div>
  );
}
