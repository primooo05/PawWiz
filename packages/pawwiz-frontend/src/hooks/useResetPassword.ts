/**
 * useResetPassword
 *
 * Manages the full password-reset lifecycle using Supabase's auth state change
 * event system rather than manual hash parsing.
 *
 * Why onAuthStateChange instead of parsing window.location.hash:
 *  - React Router (BrowserRouter) processes the URL before components mount,
 *    which can clear or transform the hash fragment.
 *  - The Supabase JS client auto-detects the implicit-flow token from the URL
 *    on initialisation (detectSessionFromUrl) and fires PASSWORD_RECOVERY via
 *    onAuthStateChange. Relying on the event is the supported, race-free path.
 *
 * State machine:
 *   verifying → ready | invalid
 *   ready     → submitting → done (redirect fires)
 *
 * Security properties preserved:
 *  - Form is never rendered until the Supabase session is confirmed valid.
 *  - Recovery session is destroyed with signOut after updateUser.
 *  - No token is generated or inspected client-side beyond what Supabase exposes.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFormValidation } from './useFormValidation';
import { resetPasswordSchema } from '../schemas/auth';

type ResetState = 'verifying' | 'ready' | 'invalid' | 'submitting' | 'done';

// How long to wait for the PASSWORD_RECOVERY event before giving up.
const RECOVERY_TIMEOUT_MS = 8_000;

export function useResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResetState>('verifying');
  const [serverError, setServerError] = useState('');

  const form = useFormValidation(resetPasswordSchema, {
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let settled = false;

    // Timeout guard: if Supabase never fires PASSWORD_RECOVERY within the window,
    // the link was absent, already consumed, or expired.
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setState('invalid');
      }
    }, RECOVERY_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (settled) return;

      if (event === 'PASSWORD_RECOVERY') {
        settled = true;
        clearTimeout(timer);
        setState('ready');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!form.validateAll()) return;

    setState('submitting');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.values.password,
      });

      if (updateError) {
        setServerError(updateError.message || 'Failed to update password. Please try again.');
        setState('ready');
        return;
      }

      // Destroy the recovery session so it cannot be reused.
      await supabase.auth.signOut();

      setState('done');
      navigate('/login?reset=true', { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setState('ready');
    }
  };

  return { state, form, serverError, handleSubmit };
}
