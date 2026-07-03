import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleWrapper } from '../components/CircleWrapper';
import Navbar from '../components/Navbar';
import { useResetPassword } from '../hooks/useResetPassword';
import catsLogin from '../assets/Cats_Login.svg';

export default function ResetPassword() {
  const { state, form, serverError, handleSubmit } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isSubmitting = state === 'submitting';

  return (
    <div className="min-h-dvh w-full bg-white bg-grid-pattern relative overflow-hidden flex flex-col justify-between items-center pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 px-4 sm:px-6">
      <Navbar />
      <CircleWrapper isTransitioning={false} isZIndexHigh={false} />

      <div className="relative z-10 w-full max-w-6xl flex-grow flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-12 my-auto">

        {/* Left — branding */}
        <div className="flex flex-col items-start justify-between w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0">
          <div>
            <h1 className="px-0 sm:px-2 text-3xl sm:text-4xl lg:text-6xl font-black text-[#e9c46a] leading-tight tracking-tight uppercase select-none mb-4 sm:mb-6">
              NEW PASSWORD
            </h1>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed font-medium italic mb-6 sm:mb-8">
              Choose something strong. Your furparenting adventures are waiting.
            </p>
          </div>
          <img
            src={catsLogin}
            alt="Cats Mascot"
            className="hidden lg:block w-full max-w-lg object-contain select-none pointer-events-none self-start lg:scale-125 lg:-translate-y-10 z-0"
            draggable={false}
          />
        </div>

        {/* Right — gated form panel */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0 flex flex-col justify-center relative z-10">

          {/* ── VERIFYING: token being consumed ─────────────────────── */}
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-12" role="status" aria-live="polite">
              <svg
                className="w-10 h-10 text-[#30c290] animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-slate-500 text-sm font-medium">Verifying your reset link…</p>
            </div>
          )}

          {/* ── INVALID: link missing, expired, or already used ──────── */}
          {state === 'invalid' && (
            <div className="flex flex-col items-center gap-6 text-center py-8">
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm w-full">
                This reset link is invalid or has expired. Reset links can only be used once.
              </div>
              <Link
                to="/login"
                className="text-sm text-[#30c290] hover:underline focus:outline-none focus:ring-2 focus:ring-[#e9c46a] rounded"
              >
                ← Request a new link
              </Link>
            </div>
          )}

          {/* ── READY / SUBMITTING: session verified, form mounted ───── */}
          {(state === 'ready' || state === 'submitting') && (
            <>
              {serverError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

                {/* New Password */}
                <div className="flex flex-col text-left">
                  <label htmlFor="password" className="italic text-[#a0aec0] text-lg font-bold mb-2 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="New Password"
                      value={form.values.password}
                      onChange={(e) => form.handleChange('password', e.target.value)}
                      onBlur={() => form.handleBlur('password')}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="w-full bg-[#30c290] text-white placeholder-white/80 font-bold px-8 py-4 pr-14 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px] disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      disabled={isSubmitting}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e9c46a] rounded-full p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
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

                {/* Confirm Password */}
                <div className="flex flex-col text-left">
                  <label htmlFor="confirmPassword" className="italic text-[#a0aec0] text-lg font-bold mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={form.values.confirmPassword}
                      onChange={(e) => form.handleChange('confirmPassword', e.target.value)}
                      onBlur={() => form.handleBlur('confirmPassword')}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="w-full bg-[#30c290] text-white placeholder-white/80 font-bold px-8 py-4 pr-14 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#e9c46a] text-center text-lg shadow-md min-h-[44px] disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirm}
                      disabled={isSubmitting}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e9c46a] rounded-full p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${form.errors.confirmPassword ? 'opacity-100' : 'opacity-0'}`}>
                    {form.errors.confirmPassword || '\u00A0'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!form.isValid || isSubmitting}
                  className="w-full sm:max-w-xs mx-auto bg-[#e9c46a] text-white font-extrabold py-3.5 px-6 rounded-2xl text-center text-lg shadow-[0_4px_0_0_#b8862a] transition-all border-none mt-4 min-h-[44px] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed enabled:hover:bg-[#f0cc74] enabled:active:shadow-none enabled:active:translate-y-[4px]"
                >
                  {isSubmitting ? 'Updating…' : 'Set New Password'}
                </button>
              </form>
            </>
          )}

          {/* Mobile illustration */}
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
