import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { FormField } from '../components/forms/FormField';
import { useLogin } from '../hooks/useLogin';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Login() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    form,
    isSubmitting,
    serverError,
    turnstileRef,
    setTurnstileToken,
    handleLogin,
  } = useLogin();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [location]);

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-6">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to PawWiz to manage your cat's health</p>
        
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

        <form onSubmit={handleLogin} noValidate>
          <input
            type="text"
            name="honeypot"
            value={form.values.honeypot}
            onChange={(e) => form.handleChange('honeypot', e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={form.values.email}
            onChange={(e) => form.handleChange('email', e.target.value)}
            onBlur={() => form.handleBlur('email')}
            error={form.errors.email}
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.values.password}
            onChange={(e) => form.handleChange('password', e.target.value)}
            onBlur={() => form.handleBlur('password')}
            error={form.errors.password}
            placeholder="••••••••"
          />

          <div className="flex justify-center mb-6">
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              ref={turnstileRef}
              options={{ theme: 'light' }}
            />
          </div>

          <button
            type="submit"
            disabled={!form.isValid || isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-md shadow-teal-500/20"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
