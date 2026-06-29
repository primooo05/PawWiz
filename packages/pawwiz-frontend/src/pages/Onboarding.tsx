import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingScreen1 } from '../components/onboarding/OnboardingScreen1';
import { OnboardingScreen2 } from '../components/onboarding/OnboardingScreen2';
import { OnboardingScreen3 } from '../components/onboarding/OnboardingScreen3';
import { OnboardingScreen4 } from '../components/onboarding/OnboardingScreen4';
import { OnboardingScreen5 } from '../components/onboarding/OnboardingScreen5';
import { OnboardingScreen6 } from '../components/onboarding/OnboardingScreen6';
import { OnboardingScreen7 } from '../components/onboarding/OnboardingScreen7';
import { OnboardingGuard } from '../components/onboarding/OnboardingGuard';
import { OnboardingProvider, useOnboardingContext } from '../context/OnboardingContext';
import { useTypewriter } from '../hooks/useTypewriter';
import {
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep7,
  getOtherCatsText,
  getResolvedCatsCount,
} from '../hooks/useOnboardingValidation';
import { supabase } from '../lib/supabase';

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
  } = useOnboardingContext();

  const { bubbleText, isTyping, showBubble, startTyping, showStaticBubble, hideBubble, reset: resetBubble } = useTypewriter();



  // Dirty flags — track if user changed a field after it was already submitted
  const [isStep2Dirty, setIsStep2Dirty] = useState(false);
  const [isStep3Dirty, setIsStep3Dirty] = useState(false);
  const [isStep4Dirty, setIsStep4Dirty] = useState(false);
  const [isStep5Dirty, setIsStep5Dirty] = useState(false);

  // Transition state for the circular scale animation
  const zIndexTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isZIndexHigh, setIsZIndexHigh] = useState(!!(location.state as { animateIn?: boolean })?.animateIn);
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  // Ripple effect for "Already have an account" link
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // Clear animateIn state on mount
  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        { if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current); zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 2000); };
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Show static bubble when entering steps 3-7
  useEffect(() => {
    if (isTransitioning) return;

    const totalCats = getResolvedCatsCount(catsCount, customCatsCount);

    const messages: Record<number, string> = {
      3: 'How many cats do you have?',
      4: 'Wiz would like to know them!',
      5: 'How old is your Cat? Meow',
      6: catsAdded >= totalCats
        ? `You only have ${totalCats} remember? You can add more later!`
        : `Would you like to create a separate profile for other ${getOtherCatsText(catsCount, customCatsCount)}?`,
      7: "Enter your strongest password you can think of! Just make sure you don't forget! meow",
    };

    if (messages[step]) {
      showStaticBubble(messages[step]);
    }
  }, [step, isTransitioning, catsCount, customCatsCount, catsAdded, showStaticBubble]);

  // --- Navigation helpers ---

  const transitionTo = (nextStep: number) => {
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
      resetBubble();
    }, 800);
  };

  const handleBackClick = () => {
    if (isTyping) return;

    // Custom back navigation based on current step
    if (step === 7) {
      // Going back from step 7: go to step 6 if multi-cat, else step 5
      const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
      transitionTo(totalCats > 1 ? 6 : 5);
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
    await new Promise((resolve) => setTimeout(resolve, 800));

    navigate('/login', { state: { animateIn: true } });
  };

  const handleCreateAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    await initializeSession();
    setTimeout(() => {
      setStep(2);
      setIsTransitioning(false);
      { if (zIndexTimeoutRef.current) clearTimeout(zIndexTimeoutRef.current); zIndexTimeoutRef.current = setTimeout(() => setIsZIndexHigh(false), 2000); };
    }, 800);
  };

  const handleReturnToHome = () => {
    { setIsTransitioning(true); setIsZIndexHigh(true); }
    setTimeout(() => navigate('/', { state: { animateOut: true } }), 800);
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
      setCatName('');
      setCatBreed('');
      setCatMarking('');
      setCatSex('');
      setCatLifeStage('');
      setStep(4);
      setIsTransitioning(false);
      resetBubble();
    }, 800);
  };

  // --- Step submission with typewriter ---

  const handleNextClick = async () => {
    if (isTyping) return;

    if (step === 2) {
      // Fast-path: already completed and no changes
      if (sessionStep > 2 && !isStep2Dirty) {
        transitionTo(3);
        return;
      }

      const result = validateStep2(ownerName, ownerEmail);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(2, { ownerName: ownerName.trim(), ownerEmail: ownerEmail.trim() });
            if (success) {
              setIsStep2Dirty(false);
              setTimeout(() => transitionTo(3), 300);
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
      if (sessionStep > 3 && !isStep3Dirty) {
        transitionTo(4);
        return;
      }

      const result = validateStep3(catsCount, customCatsCount);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(3, { catsCount, customCatsCount });
            if (success) {
              setIsStep3Dirty(false);
              setTimeout(() => transitionTo(4), 300);
            } else {
              showStaticBubble("Oh no, I couldn't save the cat count. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 4) {
      if (sessionStep > 4 && !isStep4Dirty) {
        transitionTo(5);
        return;
      }

      const result = validateStep4(catName, catSex);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(4, { catName, catBreed, catMarking, catSex });
            if (success) {
              setIsStep4Dirty(false);
              setTimeout(() => transitionTo(5), 300);
            } else {
              showStaticBubble("Oh no, I couldn't save your cat details. Try again, meow!");
              setTimeout(() => hideBubble(), 3000);
            }
          } else {
            setTimeout(() => hideBubble(), 3000);
          }
        },
      });
    } else if (step === 5) {
      if (sessionStep > 5 && !isStep5Dirty) {
        // Determine next step based on cat count
        const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
        transitionTo(totalCats > 1 ? 6 : 7);
        return;
      }

      const result = validateStep5(catLifeStage);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(5, { catLifeStage });
            if (success) {
              setIsStep5Dirty(false);
              // Increment cats added counter
              setCatsAdded((prev: number) => prev + 1);
              // If only 1 cat, skip step 6 and go directly to step 7
              const totalCats = getResolvedCatsCount(catsCount, customCatsCount);
              const nextStep = totalCats > 1 ? 6 : 7;
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
    } else if (step === 6) {
      // "Create Profile" on step 6 now transitions to step 7 (password)
      transitionTo(7);
    } else if (step === 7) {
      const result = validateStep7(password, confirmPassword);
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
    try {
      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ownerEmail,
        password: password,
      });
      if (authError) {
        if (authError.message.toLowerCase().includes('rate limit') || authError.message.toLowerCase().includes('too many requests')) {
          throw new Error('Too many tries, try again later');
        }
        throw new Error(authError.message);
      }
      if (!authData.user) throw new Error('Failed to create account');
      if (!authData.session) throw new Error('Email already registered or requires confirmation. Please login instead.');

      // 2. Create profile on backend
      const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({
          supabaseUserId: authData.user.id,
          displayName: ownerName,
          onboardingSessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create profile');
      }

      // Success — navigate to pregnancy tracker setup
      startTyping("Meow-velous! Your account is ready! Redirecting...", {
        onComplete: () => {
          setTimeout(() => navigate('/pregnancy-tracker', { state: { displayName: ownerName, catName } }), 800);
        },
      });
    } catch (err: any) {
      showStaticBubble(err.message || "Something went wrong creating your account. Try again!");
      setTimeout(() => hideBubble(), 4000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative z-0 overflow-hidden flex flex-col justify-between items-center py-12 px-6">
      {/* Decorative Circles */}
      <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-top-left ${(isTransitioning || isZIndexHigh) ? 'z-50 ' + (isTransitioning ? 'scale-[8]' : 'scale-100') : '-z-10 scale-100'}`} />
      <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 pointer-events-none transition-transform duration-[1000ms] ease-in-out origin-top-right ${(isTransitioning || isZIndexHigh) ? 'z-50 ' + (isTransitioning ? 'scale-[12]' : 'scale-100') : '-z-10 scale-100'}`} />
      <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-bottom-right ${(isTransitioning || isZIndexHigh) ? 'z-50 ' + (isTransitioning ? 'scale-[8]' : 'scale-100') : '-z-10 scale-100'}`} />

      {/* Center Wrapper */}
      <div className={`relative w-full flex-grow flex items-center justify-center ${(isTransitioning || isZIndexHigh) ? 'z-0' : 'z-10'}`}>
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
        />
        <OnboardingScreen3
          active={step === 3 && !isTransitioning}
          catsCount={catsCount}
          setCatsCount={(v) => { setCatsCount(v); setIsStep3Dirty(true); }}
          customCatsCount={customCatsCount}
          setCustomCatsCount={(v) => { setCustomCatsCount(v); setIsStep3Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 3}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen4
          active={step === 4 && !isTransitioning}
          catName={catName}
          setCatName={(v) => { setCatName(v); setIsStep4Dirty(true); }}
          catBreed={catBreed}
          setCatBreed={(v) => { setCatBreed(v); setIsStep4Dirty(true); }}
          catMarking={catMarking}
          setCatMarking={(v) => { setCatMarking(v); setIsStep4Dirty(true); }}
          catSex={catSex}
          setCatSex={(v) => { setCatSex(v); setIsStep4Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 4}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen5
          active={step === 5 && !isTransitioning}
          catLifeStage={catLifeStage}
          setCatLifeStage={(v) => { setCatLifeStage(v); setIsStep5Dirty(true); }}
          isTyping={isTyping}
          showBubble={showBubble && step === 5}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen6
          active={step === 6 && !isTransitioning}
          catName={catName}
          catsCount={catsCount}
          customCatsCount={customCatsCount}
          isTyping={isTyping}
          showBubble={showBubble && step === 6}
          bubbleText={bubbleText}
          handleCreateProfileClick={handleNextClick}
          handleBackClick={handleBackClick}
          handleAddOtherBabies={handleAddOtherBabies}
        />
        <OnboardingScreen7
          active={step === 7 && !isTransitioning}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isTyping={isTyping}
          showBubble={showBubble && step === 7}
          bubbleText={bubbleText}
          handleCreateProfileClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
      </div>
    </div>
  );
}
