import { Link } from 'react-router-dom';
import { FormField } from '../components/forms/FormField';
import { useRegister } from '../hooks/useRegister';

export default function Register() {
  const {
    form,
    isSubmitting,
    serverError,
    handleRegister,
  } = useRegister();

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-6">Create Account</h1>
        <p className="text-slate-500 text-center mb-8">Join PawWiz to track your cat's wellness</p>
        
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleRegister} noValidate>
          {/* Honeypot field - invisible to real users */}
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
            label="Display Name"
            name="displayName"
            type="text"
            value={form.values.displayName}
            onChange={(e) => form.handleChange('displayName', e.target.value)}
            onBlur={() => form.handleBlur('displayName')}
            error={form.errors.displayName}
            placeholder="How should we call you?"
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

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.values.confirmPassword}
            onChange={(e) => form.handleChange('confirmPassword', e.target.value)}
            onBlur={() => form.handleBlur('confirmPassword')}
            error={form.errors.confirmPassword}
            placeholder="••••••••"
          />


          <button
            type="submit"
            disabled={!form.isValid || isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-md shadow-teal-500/20"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
