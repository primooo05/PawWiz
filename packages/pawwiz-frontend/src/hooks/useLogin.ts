import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { supabase } from '../lib/supabase';
import { useFormValidation } from './useFormValidation';
import { loginSchema } from '../schemas/auth';

export function useLogin() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useFormValidation(loginSchema, { email: '', password: '', honeypot: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!form.validateAll()) return;
    
    // Honeypot check
    if (form.values.honeypot) {
      console.warn('Bot detected');
      return; // Silent fail
    }

    if (!turnstileToken) {
      setServerError('Please wait for captcha verification');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.values.email,
        password: form.values.password,
      });

      if (error) {
        throw new Error('Invalid email or password');
      }

      if (data.user) {
        navigate('/');
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during login');
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    serverError,
    turnstileRef,
    setTurnstileToken,
    handleLogin,
  };
}
