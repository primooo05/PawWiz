import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleWrapper } from '../components/CircleWrapper';
import { useLogin } from '../hooks/useLogin';
import catsLogin from '../assets/Cats_Login.svg';

export default function Login() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    form,
    isSubmitting,
    serverError,
    handleLogin,
  } = useLogin();

  // Transition state for the circular scale animation
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [location]);

  // Clear animateIn state on mount
  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => setIsTransitioning(false), 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="min-h-dvh w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 px-4 sm:px-6">

      {/* Decorative Circles */}
      <CircleWrapper isTransitioning={isTransitioning} />

      {/* Main content wrapper */}
      <div className={`relative w-full max-w-6xl flex-grow flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-12 ${isTransitioning ? 'z-0' : 'z-10'} my-auto`}>

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
            <input
              type="text"
              name="honeypot"
              value={form.values.honeypot}
              onChange={(e) => form.handleChange('honeypot', e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

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
                className="w-full bg-[#2ec4b6] text-white placeholder-white/80 font-bold px-8 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px]"
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
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Your Password"
                value={form.values.password}
                onChange={(e) => form.handleChange('password', e.target.value)}
                onBlur={() => form.handleBlur('password')}
                className="w-full bg-[#2ec4b6] text-white placeholder-white/80 font-bold px-8 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px]"
              />
              <p className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${form.errors.password ? 'opacity-100' : 'opacity-0'}`}>
                {form.errors.password || '\u00A0'}
              </p>
            </div>

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
