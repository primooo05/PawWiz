import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { OnboardingScreen1 } from '../components/onboarding/OnboardingScreen1';
import { OnboardingScreen2 } from '../components/onboarding/OnboardingScreen2';
import { OnboardingScreen3 } from '../components/onboarding/OnboardingScreen3';
import { OnboardingScreen4 } from '../components/onboarding/OnboardingScreen4';
import { OnboardingScreen5 } from '../components/onboarding/OnboardingScreen5';
import { OnboardingScreen6 } from '../components/onboarding/OnboardingScreen6';
import { useOnboarding } from '../hooks/useOnboarding';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Clamp step to valid range [1..6]. If the param is NaN or out-of-range,
  // fall back to 1 to prevent blank renders or unexpected behavior.
  const rawStep = parseInt(searchParams.get('step') || '1', 10);
  const step = Number.isNaN(rawStep) || rawStep < 1 || rawStep > 6 ? 1 : rawStep;

  const setStep = (newStep: number | ((prev: number) => number)) => {
    const nextStep = typeof newStep === 'function' ? newStep(step) : newStep;
    setSearchParams({ step: nextStep.toString() });
  };

  const {
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
    initializeSession,
    fetchSession,
    submitStep,
  } = useOnboarding();

  const [loadingGuard, setLoadingGuard] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);

  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // Routing Guard to prevent step tampering and flow skipping
  useEffect(() => {
    let active = true;

    const runGuard = async () => {
      if (step === 1) {
        if (active) setInitialChecked(true);
        return;
      }

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

      // Client-side fast rejection: if we already know the session step and the
      // requested step exceeds it, redirect immediately without a network call.
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
  }, [step, sessionId, fetchSession, initialChecked, sessionStep]);



  // Transition and Typing states
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isStep2Dirty, setIsStep2Dirty] = useState(false);
  const [isStep3Dirty, setIsStep3Dirty] = useState(false);
  const [isStep4Dirty, setIsStep4Dirty] = useState(false);
  const [isStep5Dirty, setIsStep5Dirty] = useState(false);

  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const getOtherCatsText = () => {
    if (customCatsCount.trim()) {
      const count = parseInt(customCatsCount.trim(), 10);
      if (!isNaN(count) && count > 1) {
        return `${count - 1} ${count - 1 === 1 ? 'cat' : 'cats'}`;
      }
      return customCatsCount;
    }
    if (catsCount === 'Two') return '1 cat';
    if (catsCount === 'Three') return '2 cats';
    return 'cats';
  };

  // When step 3 or 4 becomes active, show bubble with the initial question
  useEffect(() => {
    if (step === 3 && !isTransitioning) {
      setShowBubble(true);
      setBubbleText("How many cats do you have?");
    } else if (step === 4 && !isTransitioning) {
      setShowBubble(true);
      setBubbleText("Wiz would like to know them!");
    } else if (step === 5 && !isTransitioning) {
      setShowBubble(true);
      setBubbleText("How old is your Cat? Meow");
    } else if (step === 6 && !isTransitioning) {
      setShowBubble(true);
      setBubbleText(`Would you like to create a separate profile for other ${getOtherCatsText()}?`);
    }
  }, [step, isTransitioning, catsCount, customCatsCount]);

  const handleAlreadyHaveAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRippleStyle({
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
    });
    setIsClicked(true);

    setTimeout(() => {
      navigate('/login');
    }, 450);
  };

  const handleCreateAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsTransitioning(true);

    // Scale up to cover screen over 800ms (matching the 800ms duration)
    const session = await initializeSession();
    setTimeout(() => {
      if (session) {
        setStep(2);
      } else {
        setStep(2); // Fallback
      }
      setIsTransitioning(false);
    }, 800);
  };

  const handleReturnToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/', { state: { animateOut: true } });
    }, 800);
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
      setShowBubble(false);
      setBubbleText('');
    }, 800);
  };

  const handleBackClick = () => {
    if (isTyping) return; // Prevent clicking during transitions

    setIsTransitioning(true);

    // Scale up to cover screen, then update step back and scale back down
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setIsTransitioning(false);
      // Reset speech bubble states when moving back
      setShowBubble(false);
      setBubbleText('');
    }, 800);
  };


  const handleNextClick = async () => {
    if (isTyping) return; // Prevent double clicks

    if (step === 2) {
      // Fast-path: already completed this step and user hasn't changed the field
      if (sessionStep > 2 && !isStep2Dirty) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(3);
          setIsTransitioning(false);
          setShowBubble(false);
          setBubbleText('');
        }, 800);
        return;
      }

      setIsTyping(true);
      setShowBubble(true);

      const nameToUse = ownerName.trim();
      const emailToUse = ownerEmail.trim();
      let isValid = true;
      let fullText = '';

      if (nameToUse.length === 0) {
        fullText = `Hey so, I have a name and you don't?meow*`;
        isValid = false;
      } else if (nameToUse.length < 2) {
        fullText = "Name must be at least 2 characters, meow!";
        isValid = false;
      } else if (emailToUse.length === 0) {
        fullText = "I need your email too! Every cat parent needs one, meow!";
        isValid = false;
      } else if (!z.string().email().safeParse(emailToUse).success) {
        fullText = "Hmm, that doesn't look like a valid email. Try again, meow!";
        isValid = false;
      } else {
        fullText = `Meow, ${nameToUse}! So glad to meet you! 🐾`;
      }

      let currentText = '';
      let index = 0;

      const interval = setInterval(async () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setBubbleText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);

          if (isValid) {
            const success = await submitStep(2, { ownerName: nameToUse, ownerEmail: emailToUse });
            if (success) {
              setIsStep2Dirty(false);
              // Delay circular scale transition to start AFTER typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(3);
                  setIsTransitioning(false);
                }, 800);
              }, 300); // Trigger transition 300ms after typing finishes
            } else {
              setBubbleText("Oh no, I couldn't save your name. Try again, meow!");
              setTimeout(() => {
                setShowBubble(false);
                setBubbleText('');
              }, 3000);
            }
          } else {
            // If empty or invalid, let them try again. Hide bubble after 3s so they can edit
            setTimeout(() => {
              setShowBubble(false);
              setBubbleText('');
            }, 3000);
          }
        }
      }, 45); // Snappy 45ms typing speed
    } else if (step === 3) {
      // Fast-path: already completed this step and user hasn't changed the field
      if (sessionStep > 3 && !isStep3Dirty) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(4);
          setIsTransitioning(false);
          setShowBubble(false);
          setBubbleText('');
        }, 800);
        return;
      }

      setIsTyping(true);
      setShowBubble(true);

      const hasCats = catsCount.trim().length > 0 || customCatsCount.trim().length > 0;
      const parseCatsCount = (countStr: string, customStr: string): number | null => {
        const cats = countStr.trim();
        const custom = customStr.trim();

        if (cats) {
          const val = cats.toLowerCase();
          if (val === 'one') return 1;
          if (val === 'two') return 2;
          if (val === 'three') return 3;
        }

        if (custom) {
          const val = custom.toLowerCase();
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed)) return parsed;

          const wordMap: Record<string, number> = {
            'one': 1,
            'two': 2,
            'three': 3,
            'four': 4,
            'five': 5,
            'six': 6,
            'seven': 7,
            'eight': 8,
            'nine': 9,
            'ten': 10
          };

          return wordMap[val] ?? null;
        }

        return null;
      };

      const parsedCount = parseCatsCount(catsCount, customCatsCount);
      const selectedNumberOfCats = catsCount || customCatsCount.trim();

      let fullText = '';
      if (!hasCats) {
        fullText = "Adopt me if you don't have one!";
      } else if (parsedCount !== null && parsedCount >= 1 && parsedCount <= 3) {
        fullText = `Amazing, ${selectedNumberOfCats} Cats`;
      } else {
        fullText = "That's too many Fur Babies, my dream fur parent!";
      }

      let currentText = '';
      let index = 0;

      const interval = setInterval(async () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setBubbleText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);

          if (hasCats) {
            const success = await submitStep(3, { catsCount, customCatsCount });
            if (success) {
              setIsStep3Dirty(false);
              // Transition to Step 4 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(4);
                  setIsTransitioning(false);
                }, 800);
              }, 300);
            } else {
              setBubbleText("Oh no, I couldn't save the cat count. Try again, meow!");
              setTimeout(() => {
                setShowBubble(false);
                setBubbleText('');
              }, 3000);
            }
          } else {
            // Hide bubble after 3s so they can edit
            setTimeout(() => {
              setShowBubble(false);
              setBubbleText('');
            }, 3000);
          }
        }
      }, 45);
    } else if (step === 4) {
      // Fast-path: already completed this step and user hasn't changed the fields
      if (sessionStep > 4 && !isStep4Dirty) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(5);
          setIsTransitioning(false);
          setShowBubble(false);
          setBubbleText('');
        }, 800);
        return;
      }

      setIsTyping(true);
      setShowBubble(true);

      const trimmedName = catName.trim();
      let fullText = '';
      let isValid = true;

      if (trimmedName.length < 2) {
        fullText = "Is that really a cat's name? Try again, meow.";
        isValid = false;
      } else if (!catSex) {
        fullText = "Please select your cat's biological gender, meow";
        isValid = false;
      } else {
        fullText = `What a cool name for a ${catSex.toLowerCase()} cat!`;
      }

      let currentText = '';
      let index = 0;

      const interval = setInterval(async () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setBubbleText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);

          if (isValid) {
            const success = await submitStep(4, { catName, catBreed, catMarking, catSex });
            if (success) {
              setIsStep4Dirty(false);
              // Transition to Step 5 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(5);
                  setIsTransitioning(false);
                }, 800);
              }, 300);
            } else {
              setBubbleText("Oh no, I couldn't save your cat details. Try again, meow!");
              setTimeout(() => {
                setShowBubble(false);
                setBubbleText('');
              }, 3000);
            }
          } else {
            // Hide bubble after 3s so they can edit
            setTimeout(() => {
              setShowBubble(false);
              setBubbleText('');
            }, 3000);
          }
        }
      }, 45);
    } else if (step === 5) {
      // Fast-path: already completed this step and user hasn't changed the fields
      if (sessionStep > 5 && !isStep5Dirty) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(6);
          setIsTransitioning(false);
          setShowBubble(false);
          setBubbleText('');
        }, 800);
        return;
      }

      setIsTyping(true);
      setShowBubble(true);

      let fullText = '';
      let isValid = true;

      if (!catLifeStage) {
        fullText = "Please select your cat's life stage, meow";
        isValid = false;
      } else {
        fullText = `Awesome! A wonderful ${catLifeStage.toLowerCase()} cat!`;
      }

      let currentText = '';
      let index = 0;

      const interval = setInterval(async () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setBubbleText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);

          if (isValid) {
            const success = await submitStep(5, { catLifeStage });
            if (success) {
              setIsStep5Dirty(false);
              // Transition to Step 6 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(6);
                  setIsTransitioning(false);
                }, 800);
              }, 300);
            } else {
              setBubbleText("Oh no, I couldn't save your cat's life stage. Try again, meow!");
              setTimeout(() => {
                setShowBubble(false);
                setBubbleText('');
              }, 3000);
            }
          } else {
            // Hide bubble after 3s so they can edit
            setTimeout(() => {
              setShowBubble(false);
              setBubbleText('');
            }, 3000);
          }
        }
      }, 45);
    } else if (step === 6) {
      setIsTyping(true);
      setShowBubble(true);
      const fullText = "Purr-fect! Let's get your account set up now.";
      let currentText = '';
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setBubbleText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => {
            navigate('/register');
          }, 800);
        }
      }, 45);
    }
  };


  // Block rendering when: loading guard is active, initial check hasn't completed,
  // OR the user is trying to view a step they haven't legitimately reached yet.
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

  return (
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center py-12 px-6">


      {/* Decorative Circles */}
      <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-top-left z-50 ${isTransitioning ? 'scale-[8]' : 'scale-100'
        }`} />
      <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 pointer-events-none transition-transform duration-[1000ms] ease-in-out origin-top-right z-50 ${isTransitioning ? 'scale-[12]' : 'scale-100'
        }`} />
      <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-bottom-right z-50 ${isTransitioning ? 'scale-[8]' : 'scale-100'
        }`} />

      {/* Center Wrapper for persistent component mounting and smooth overlay transitions */}
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
