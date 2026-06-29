import { useState } from 'react';
import { Link } from 'react-router-dom';
import pawWizText from '../assets/PawWiz_Text_logo.png';

export default function Navbar() {
  const [isTransitioning] = useState(false);

  return (
    <>
      <nav className="border-b border-slate-200/40 bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
            <img src={pawWizText} alt="PawWiz" className="h-6 w-auto object-contain ml-1" />
          </Link>
        </div>
      </nav>

      {/* Decorative Circles expanding on click */}
      <div className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 transition-transform duration-[2000ms] ease-in-out origin-top-left ${isTransitioning ? 'scale-[8]' : 'scale-0'}`} />
        <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 transition-transform duration-[2000ms] ease-in-out origin-top-right ${isTransitioning ? 'scale-[12]' : 'scale-0'}`} />
        <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 transition-transform duration-[2000ms] ease-in-out origin-bottom-right ${isTransitioning ? 'scale-[8]' : 'scale-0'}`} />
      </div>
    </>
  );
}
