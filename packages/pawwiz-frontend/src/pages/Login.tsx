import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import Navbar from '../components/Navbar';
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
    <div className="min-h-screen w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center pt-28 pb-12 px-6 min-w-[365px] min-h-[667px]">
      <Navbar />

      {/* Decorative Circles */}
      <div className={`pointer-events-none overflow-hidden transition-all duration-300 ${isTransitioning ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-0'}`}>
        <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 transition-transform duration-[2000ms] ease-in-out origin-top-left ${isTransitioning ? 'scale-[8]' : 'scale-100'}`} />
        <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 transition-transform duration-[1000ms] ease-in-out origin-top-right ${isTransitioning ? 'scale-[12]' : 'scale-100'}`} />
        <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 transition-transform duration-[2000ms] ease-in-out origin-bottom-right ${isTransitioning ? 'scale-[8]' : 'scale-100'}`} />
      </div>

      {/* Main content wrapper */}
      <div className="relative w-full max-w-6xl flex-grow flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-12 z-10 my-auto">

        {/* Left side: branding/illustration */}
        <div className="flex flex-col items-start justify-between max-w-lg lg:w-1/2 min-h-[450px] lg:min-h-[650px] relative">
          <div>
            <h1 className="max-w-4xl mx-auto px-6 space-y-5 lg:text-6xl font-black text-[#e9c46a] leading-tight tracking-tight uppercase select-none mb-6">
              LET THE CATS DOMINATE!
            </h1>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed font-medium italic mb-8 ">
              Login and PawWiz will help you to tell you immediately anything before it became an emergency! Plant Toxicity Checker, Feeding guide, and Pregnancy Monitoring, Health Tracker built for furparents!
            </p>
          </div>
          <img
            src={catsLogin}
            alt="Cats Mascot Login"
            className="w-full max-w-[500px] lg:max-w-[580px] object-contain select-none pointer-events-none self-center lg:self-start scale-110 lg:scale-135 lg:-translate-y-[3rem]  z-0"
            draggable={false}
          />
        </div>

        {/* Right side: Login form */}
        <div className="w-full lg:w-1/2 max-w-md flex flex-col justify-center relative z-10 -translate-y-4 lg:-translate-y-36">
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
                className="w-full bg-[#2ec4b6] text-white placeholder-white/80 font-bold px-8 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md"
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
                className="w-full bg-[#2ec4b6] text-white placeholder-white/80 font-bold px-8 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md"
              />
              <p className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${form.errors.password ? 'opacity-100' : 'opacity-0'}`}>
                {form.errors.password || '\u00A0'}
              </p>
            </div>

            <button
              type="submit"
              disabled={!form.isValid || isSubmitting}
              className="w-full max-w-[280px] mx-auto bg-[#e9c46a] text-white font-extrabold py-3.5 px-6 rounded-2xl text-center text-lg shadow-[0_4px_0_0_#b8862a] transition-all border-none mt-4 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed enabled:hover:bg-[#f0cc74] enabled:active:shadow-none enabled:active:translate-y-[4px]"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
