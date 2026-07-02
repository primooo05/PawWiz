import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleWrapper } from '../components/CircleWrapper';
import Navbar from '../components/Navbar';
import { useLogin } from '../hooks/useLogin';
import catsLogin from '../assets/Cats_Login.svg';

export default function Login() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Transition state for the circular scale animation
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );
  const [isZIndexHigh, setIsZIndexHigh] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  const {
    form,
    isSubmitting,
    serverError,
    handleLogin,
  } = useLogin({
    onSuccess: () => {
      setIsTransitioning(true);
      setIsZIndexHigh(true);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [location]);

  // Clear animateIn state on mount
  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTimeout(() => setIsZIndexHigh(false), 800);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="min-h-dvh w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 px-4 sm:px-6">
      <Navbar />

      {/* Decorative Circles */}
      <CircleWrapper isTransitioning={isTransitioning} isZIndexHigh={isZIndexHigh} />

      {/* Main content wrapper */}
      <div className={`relative w-full max-w-6xl flex-grow flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-12 transition-opacity duration-300 ${
        isTransitioning
          ? 'z-0 invisible opacity-0'
          : isZIndexHigh
            ? 'z-0 opacity-0'
            : 'z-10 opacity-100'
      } my-auto`}>

        {/* Left side: branding text (desktop) + text visible on mobile above the form */}
        <div className="flex flex-col items-start justify-between w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0 relative">
          {/* Branding copy — always visible, sits at the top on mobile */}
          <div>
            <h1 className="px-0 sm:px-2 text-3xl sm:text-4xl lg:text-6xl font-black text-[#e9c46a] leading-tight tracking-tight uppercase select-none mb-4 sm:mb-6">
              LET THE CATS DOMINATE!
            </h1>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed font-medium italic mb-6 sm:mb-8">
              Login and PawWiz will help you to tell you immediately anything before it became an emergency! Plant Toxicity Checker, Feeding guide, and Pregnancy Monitoring, Health Tracker built for furparents!
            </p>
          </div>

          {/* Illustration — desktop only; mobile version rendered below the form */}
          <img
            src={catsLogin}
            alt="Cats Mascot Login"
            className="hidden lg:block w-full max-w-lg object-contain select-none pointer-events-none self-start lg:scale-125 lg:-translate-y-10 z-0"
            draggable={false}
          />
        </div>

        {/* Right side: Login form + mobile illustration */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0 flex flex-col justify-center relative z-10">
          {successMessage && (
            <div className="mb-6 p-4 bg-teal-50 text-teal-700 rounded-xl text-sm text-center">
              {successMessage}
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col text-left">
              <label htmlFor="email" className="italic text-[#a0aec0] text-lg font-bold mb-2 block">
                Enter Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.values.email}
                onChange={(e) => form.handleChange('email', e.target.value)}
                onBlur={() => form.handleBlur('email')}
                className="w-full bg-[#30c290] text-white placeholder-white/80 font-bold px-8 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px]"
              />
              <p className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${form.errors.email ? 'opacity-100' : 'opacity-0'}`}>
                {form.errors.email || '\u00A0'}
              </p>
            </div>

            {/* Password Field */}
            <div className="flex flex-col text-left">
              <label htmlFor="password" className="italic text-[#a0aec0] text-lg font-bold mb-2 block">
                Enter Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your Password"
                  value={form.values.password}
                  onChange={(e) => form.handleChange('password', e.target.value)}
                  onBlur={() => form.handleBlur('password')}
                  autoComplete="current-password"
                  className="w-full bg-[#30c290] text-white placeholder-white/80 font-bold px-8 py-4 pr-14 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e9c46a] rounded-full p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  tabIndex={0}
                >
                  {showPassword ? (
                    /* Eye-slash — password visible */
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye — password hidden */
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${form.errors.password ? 'opacity-100' : 'opacity-0'}`}>
                {form.errors.password || '\u00A0'}
              </p>
            </div>

            <input
              type="text"
              name="honeypot"
              value={form.values.honeypot}
              onChange={(e) => form.handleChange('honeypot', e.target.value)}
              style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0, pointerEvents: 'none' }}
              tabIndex={-1}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={!form.isValid || isSubmitting}
              className="w-full sm:max-w-xs mx-auto bg-[#e9c46a] text-white font-extrabold py-3.5 px-6 rounded-2xl text-center text-lg shadow-[0_4px_0_0_#b8862a] transition-all border-none mt-4 min-h-[44px] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed enabled:hover:bg-[#f0cc74] enabled:active:shadow-none enabled:active:translate-y-[4px]"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Illustration — mobile only, sits below the submit button */}
          <img
            src={catsLogin}
            alt=""
            aria-hidden="true"
            className="lg:hidden w-full max-w-xs sm:max-w-sm object-contain select-none pointer-events-none mx-auto mt-8"
            draggable={false}
          />
        </div>

      </div>
    </div>
  );
}
