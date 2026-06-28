import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingScreen1 } from '../components/onboarding/OnboardingScreen1';
import { OnboardingScreen2 } from '../components/onboarding/OnboardingScreen2';
import { OnboardingScreen3 } from '../components/onboarding/OnboardingScreen3';
import { OnboardingScreen4 } from '../components/onboarding/OnboardingScreen4';
import { OnboardingScreen5 } from '../components/onboarding/OnboardingScreen5';
import { OnboardingScreen6 } from '../components/onboarding/OnboardingScreen6';
import { OnboardingGuard } from '../components/onboarding/OnboardingGuard';
import { OnboardingProvider, useOnboardingContext } from '../context/OnboardingContext';
import { useTypewriter } from '../hooks/useTypewriter';
import {
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  getOtherCatsText,
} from '../hooks/useOnboardingValidation';

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
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  // Ripple effect for "Already have an account" link
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // Clear animateIn state on mount
  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => setIsTransitioning(false), 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Show static bubble when entering steps 3-6
  useEffect(() => {
    if (isTransitioning) return;

    const messages: Record<number, string> = {
      3: 'How many cats do you have?',
      4: 'Wiz would like to know them!',
      5: 'How old is your Cat? Meow',
      6: `Would you like to create a separate profile for other ${getOtherCatsText(catsCount, customCatsCount)}?`,
    };

    if (messages[step]) {
      showStaticBubble(messages[step]);
    }
  }, [step, isTransitioning, catsCount, customCatsCount, showStaticBubble]);

  // --- Navigation helpers ---

  const transitionTo = (nextStep: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
      resetBubble();
    }, 800);
  };

  const handleBackClick = () => {
    if (isTyping) return;
    transitionTo(step - 1);
  };

  const handleAlreadyHaveAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRippleStyle({ width: `${size}px`, height: `${size}px`, left: `${x}px`, top: `${y}px` });
    setIsClicked(true);
    setTimeout(() => navigate('/login'), 450);
  };

  const handleCreateAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsTransitioning(true);
    await initializeSession();
    setTimeout(() => {
      setStep(2);
      setIsTransitioning(false);
    }, 800);
  };

  const handleReturnToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => navigate('/', { state: { animateOut: true } }), 800);
  };

  const handleAddOtherBabies = () => {
    if (isTyping) return;
    setIsTransitioning(true);
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
        transitionTo(6);
        return;
      }

      const result = validateStep5(catLifeStage);
      startTyping(result.message, {
        onComplete: async () => {
          if (result.isValid) {
            const success = await submitStep(5, { catLifeStage });
            if (success) {
              setIsStep5Dirty(false);
              setTimeout(() => transitionTo(6), 300);
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
      startTyping("Purr-fect! Let's get your account set up now.", {
        onComplete: () => {
          setTimeout(() => navigate('/register'), 800);
        },
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center py-12 px-6">
      {/* Decorative Circles */}
      <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-top-left z-50 ${isTransitioning ? 'scale-[8]' : 'scale-100'}`} />
      <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 pointer-events-none transition-transform duration-[1000ms] ease-in-out origin-top-right z-50 ${isTransitioning ? 'scale-[12]' : 'scale-100'}`} />
      <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-bottom-right z-50 ${isTransitioning ? 'scale-[8]' : 'scale-100'}`} />

      {/* Center Wrapper */}
      <div className="relative w-full flex-grow flex items-center justify-center z-10">
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
      </div>
    </div>
  );
}
