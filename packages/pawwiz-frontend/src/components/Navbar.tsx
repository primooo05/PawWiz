import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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

  return (
    // Close on outside click (ref on <nav> so hamburger doesn't fight the handler)
    <nav ref={dropdownRef} className="border-b border-slate-200/40 bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🐾</span>
          <span className="text-xl font-black tracking-tight text-slate-900">PawWiz</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map(link => {
            const isHome = location.pathname === '/';
            const targetUrl = isHome ? link.href : `/${link.href}`;
            return (
              <a
                key={link.href}
                href={targetUrl}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                onClick={(e) => {
                  if (isHome) {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {link.label}
              </a>
            );
          })}
          {user ? (
            <button onClick={handleLogout} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-5 py-2 rounded-xl text-xs tracking-wider transition-all duration-100 cursor-pointer">
              LOGOUT
            </button>
          ) : (
            <Link to="/login" className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs tracking-wider transition-all duration-100
              shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer inline-block text-center">
              SIGN IN
            </Link>
          )}
        </div>

        {/* Mobile: Sign In + Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {user ? (
            <button onClick={handleLogout} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-4 py-1.5 rounded-lg text-xs tracking-wider transition-all duration-100 cursor-pointer">
              LOGOUT
            </button>
          ) : (
            <Link to="/login" className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-4 py-1.5 rounded-lg text-xs tracking-wider transition-all duration-100
              shadow-[0_3px_0_0_#b8862a] active:shadow-none active:translate-y-[3px] cursor-pointer inline-block text-center">
              SIGN IN
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
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
            const targetUrl = isHome ? link.href : `/${link.href}`;
            return (
              <a
                key={link.href}
                href={targetUrl}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (isHome) {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-3 rounded-lg transition-all"
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
  );
}
