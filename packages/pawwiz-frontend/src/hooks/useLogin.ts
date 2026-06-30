import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFormValidation } from './useFormValidation';
import { loginSchema } from '../schemas/auth';

export function useLogin() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useFormValidation(loginSchema, { email: '', password: '', honeypot: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!form.validateAll()) return;
    
    // Honeypot check — silent fail, no console output to avoid leaking bot detection
    if (form.values.honeypot) {
      return;
    }

    const email = form.values.email;
    const password = form.values.password;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      setServerError('Malformed credential payload');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        navigate('/diet-recommender');
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    serverError,
    handleLogin,
  };
}
