import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import catScreen1 from '../assets/Cat_Screen1.svg';

export default function Onboarding() {
  const navigate = useNavigate();
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [isClicked, setIsClicked] = useState(false);

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

  return (
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center py-12 px-6">
      
      {/* Decorative Circles */}
      <div className="w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 pointer-events-none" />
      <div className="w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 pointer-events-none" />
      <div className="w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col justify-center items-center w-full max-w-md z-10">
        {/* Animated Cat Mascot */}
        <div className="animate-float mb-12 flex justify-center items-center">
          <img 
            src={catScreen1} 
            alt="PawWiz Mascot" 
            className="w-64 h-64 md:w-80 md:h-80 object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Buttons and Navigation */}
        <div className="w-full flex flex-col items-center gap-4">
          <Link 
            to="/register" 
            className="w-full max-w-[280px] bg-[#e9c46a] text-[#fdfdfd] hover:bg-[#f0cc74] text-slate-900 font-extrabold py-3.5 px-6 rounded-2xl text-center text-sm tracking-wider shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer"
          >
            Create Account
          </Link>

          <a 
            href="/login"
            onClick={handleAlreadyHaveAccountClick}
            className={`w-full max-w-[280px] bg-white hover:bg-slate-50 font-extrabold py-3.5 px-6 rounded-2xl text-center text-sm tracking-wider border-2 border-[#2ec4b6] shadow-[0_4px_0_0_#209f93] active:shadow-none active:translate-y-[4px] transition-all cursor-pointer relative overflow-hidden block ${
              isClicked ? 'text-white' : 'text-[#2ec4b6]'
            }`}
          >
            <span className="relative z-10 transition-colors duration-200">Already have an account</span>
            {rippleStyle && (
              <span 
                className="ripple-span" 
                style={rippleStyle} 
              />
            )}
          </a>

          {/* Progress Indicators */}
          <div className="flex gap-2.5 mt-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a0aec0]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
          </div>
        </div>
      </div>
      
    </div>
  );
}

