import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import pawWizText from '../../assets/PawWiz_Text_logo.png';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#monitoring', label: 'Monitoring' },
  { href: '#diet', label: 'Diet' },
  { href: '#behavior', label: 'Behavior' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();




  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const [activeSection, setActiveSection] = useState('home');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Scroll spy observer
  useEffect(() => {
    const isHome = location.pathname === '/';
    if (!isHome) {
      setActiveSection('');
      return;
    }

    const sections = NAV_LINKS.map(link => link.href.replace('#', ''));
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // Update sliding indicator style
  useEffect(() => {
    if (!activeSection) {
      setIndicatorStyle({ left: 0, width: 0 });
      return;
    }

    const container = navContainerRef.current;
    if (!container) return;

    const activeLink = container.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
    if (activeLink) {
      setIndicatorStyle({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    } else {
      setIndicatorStyle({ left: 0, width: 0 });
    }
  }, [activeSection]);

  // Handle window resize for indicator
  useEffect(() => {
    const handleResize = () => {
      if (!activeSection) return;
      const container = navContainerRef.current;
      if (!container) return;
      const activeLink = container.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSection]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStartedClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/onboarding', { state: { animateIn: true } });
    }, 2000);
  };

  return (
    <>
      {/* Close on outside click (ref on <nav> so hamburger doesn't fight the handler) */}
      <nav ref={dropdownRef} className="border-b border-slate-200/40 bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              const isHome = location.pathname === '/';
              if (!isHome) {
                e.preventDefault();
                setIsTransitioning(true);
                setTimeout(() => {
                  navigate('/', { state: { animateOut: true } });
                }, 2000);
              }
            }}
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <img src={pawWizText} alt="PawWiz" className="h-6 w-auto object-contain ml-1" />
          </Link>

          {/* Desktop nav */}
          <div ref={navContainerRef} className="hidden md:flex items-center space-x-8 relative py-1">
            {/* Sliding indicator line */}
            <div
              className="absolute bottom-[-10px] h-[3px] bg-[#30c290] rounded-full transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: activeSection ? 1 : 0,
              }}
            />
            {NAV_LINKS.map(link => {
              const isHome = location.pathname === '/';
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={isHome ? link.href : `/${link.href}`}
                  data-section={sectionId}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-[#30c290]' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isHome) {
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                      window.history.replaceState(null, '', link.href);
                    } else {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        navigate(`/${link.href}`, { state: { animateOut: true } });
                      }, 2000);
                    }
                  }}
                >
                  {link.label}
                </a>
              );
            })}
            <button onClick={handleGetStartedClick} className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs tracking-wider transition-all duration-100
              shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer inline-block text-center border-none">
                GET STARTED
            </button>
          </div>

          {/* Mobile: Sign In + Hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={handleGetStartedClick} className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-4 py-1.5 rounded-lg text-xs tracking-wider transition-all duration-100
              shadow-[0_3px_0_0_#b8862a] active:shadow-none active:translate-y-[3px] cursor-pointer inline-block text-center border-none">
                GET STARTED
            </button>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {/* Animated hamburger → X */}
              <div className="w-5 h-5 relative flex flex-col justify-center items-center gap-[5px]">
                <span className={`block h-[2.5px] w-5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`} />
                <span className={`block h-[2.5px] w-5 bg-slate-700 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-[2.5px] w-5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown — ABSOLUTE so it overlays Hero content without causing layout shift */}
        {/* 
      - [x] Define standard modal animations in index.css
      - [ ] Create PrivacyModal.tsx component with custom SVG icons (no emojis) and complete copy
      */}
        <div
          className={`md:hidden absolute left-0 right-0 top-full
          bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg
          overflow-hidden transition-all duration-300 ease-out
          ${menuOpen ? 'max-h-80 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'}`}
          style={{ willChange: 'max-height, opacity, transform' }}
        >
          <div className="px-5 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => {
              const isHome = location.pathname === '/';
              return (
                <a
                  key={link.href}
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    if (isHome) {
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                      window.history.replaceState(null, '', link.href);
                    } else {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        navigate(`/${link.href}`, { state: { animateOut: true } });
                      }, 2000);
                    }
                  }}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-3 rounded-lg transition-all ${activeSection === link.href.replace('#', '')
                      ? 'text-[#30c290] bg-slate-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  style={{
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-8px)',
                    opacity: menuOpen ? 1 : 0,
                    transitionProperty: 'transform, opacity',
                    transitionDuration: '250ms, 250ms',
                    transitionTimingFunction: 'ease, ease',
                    transitionDelay: menuOpen ? `${i * 40}ms, ${i * 40}ms` : '0ms, 0ms',
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
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
