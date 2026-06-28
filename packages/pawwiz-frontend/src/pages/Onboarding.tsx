import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const step = parseInt(searchParams.get('step') || '1', 10);

  const setStep = (newStep: number | ((prev: number) => number)) => {
    const nextStep = typeof newStep === 'function' ? newStep(step) : newStep;
    setSearchParams({ step: nextStep.toString() });
  };

  const {
    sessionId,
    ownerName,
    setOwnerName,
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

      if (active) setLoadingGuard(true);
      const data = await fetchSession(sessionId);
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
  }, [step, sessionId, fetchSession]);



  // Transition and Typing states
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    
    // Scale up to cover screen over 2 seconds (matching the 2000ms duration)
    const session = await initializeSession();
    setTimeout(() => {
      if (session) {
        setStep(2);
      } else {
        setStep(2); // Fallback
      }
      setIsTransitioning(false);
    }, 2000);
  };

  const handleReturnToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/', { state: { animateOut: true } });
    }, 2000);
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
    }, 2000);
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
    }, 2000);
  };


  const handleNextClick = async () => {
    if (isTyping) return; // Prevent double clicks
    
    if (step === 2) {
      setIsTyping(true);
      setShowBubble(true);
      
      const nameToUse = ownerName.trim();
      const hasName = nameToUse.length > 0;
      const fullText = hasName 
        ? `Meow, ${nameToUse}! So glad to meet you! 🐾`
        : `Hey so, I have a name and you don't?meow*`;
        
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
          
          if (hasName) {
            const success = await submitStep(2, { ownerName: nameToUse });
            if (success) {
              // Delay circular scale transition to start AFTER typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(3);
                  setIsTransitioning(false);
                }, 2000);
              }, 1000); // Trigger transition 1 second after typing finishes
            } else {
              setBubbleText("Oh no, I couldn't save your name. Try again, meow!");
              setTimeout(() => {
                setShowBubble(false);
                setBubbleText('');
              }, 3000);
            }
          } else {
            // If empty, let them try again. Hide bubble after 3s so they can edit
            setTimeout(() => {
              setShowBubble(false);
              setBubbleText('');
            }, 3000);
          }
        }
      }, 45); // Snappy 45ms typing speed
    } else if (step === 3) {
      setIsTyping(true);
      setShowBubble(true);

      const hasCats = catsCount.trim().length > 0 || customCatsCount.trim().length > 0;
      const fullText = hasCats 
        ? "That's too many Fur Babies, my dream fur parent!"
        : "Adopt me if you don't have one!";
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
              // Transition to Step 4 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(4);
                  setIsTransitioning(false);
                }, 2000);
              }, 1000);
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
              // Transition to Step 5 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(5);
                  setIsTransitioning(false);
                }, 2000);
              }, 1000);
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
              // Transition to Step 6 after typing finishes
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStep(6);
                  setIsTransitioning(false);
                }, 2000);
              }, 1000);
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
          }, 2000);
        }
      }, 45);
    }
  };


  if (loadingGuard || (step > 1 && !initialChecked)) {
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
      <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-top-left z-50 ${
        isTransitioning ? 'scale-[8]' : 'scale-100'
      }`} />
      <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-top-right z-50 ${
        isTransitioning ? 'scale-[12]' : 'scale-100'
      }`} />
      <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-bottom-right z-50 ${
        isTransitioning ? 'scale-[8]' : 'scale-100'
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
          setOwnerName={setOwnerName}
          isTyping={isTyping}
          showBubble={showBubble && step === 2}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen3
          active={step === 3 && !isTransitioning}
          catsCount={catsCount}
          setCatsCount={setCatsCount}
          customCatsCount={customCatsCount}
          setCustomCatsCount={setCustomCatsCount}
          isTyping={isTyping}
          showBubble={showBubble && step === 3}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen4
          active={step === 4 && !isTransitioning}
          catName={catName}
          setCatName={setCatName}
          catBreed={catBreed}
          setCatBreed={setCatBreed}
          catMarking={catMarking}
          setCatMarking={setCatMarking}
          catSex={catSex}
          setCatSex={setCatSex}
          isTyping={isTyping}
          showBubble={showBubble && step === 4}
          bubbleText={bubbleText}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
        <OnboardingScreen5
          active={step === 5 && !isTransitioning}
          catLifeStage={catLifeStage}
          setCatLifeStage={setCatLifeStage}
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
