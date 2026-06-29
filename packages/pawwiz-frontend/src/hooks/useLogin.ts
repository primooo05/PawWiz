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
